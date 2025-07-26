export interface UserGroup {
  id: string;
  user_id: string;
  group_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface UserInGroup {
  id: string;
  email: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface AddUserToGroupData {
  user_id: string;
  role?: 'admin' | 'member';
}

export class UserGroupService {
  constructor(private db: D1Database) {}

  async getUsersInGroup(groupId: string): Promise<UserInGroup[]> {
    const result = await this.db
      .prepare(`
        SELECT u.id, u.email, ug.role, ug.joined_at
        FROM user_groups ug
        JOIN user u ON ug.user_id = u.id
        WHERE ug.group_id = ?
        ORDER BY ug.joined_at DESC
      `)
      .bind(groupId)
      .all<UserInGroup>();
    
    return result.results || [];
  }

  async addUserToGroup(groupId: string, data: AddUserToGroupData): Promise<UserGroup> {
    const result = await this.db
      .prepare(`
        INSERT INTO user_groups (user_id, group_id, role)
        VALUES (?, ?, ?)
        RETURNING *
      `)
      .bind(data.user_id, groupId, data.role || 'member')
      .first<UserGroup>();
    
    if (!result) {
      throw new Error('Failed to add user to group');
    }
    
    return result;
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM user_groups WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .run();
    
    return result.meta.changes > 0;
  }

  async updateUserRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<UserGroup | null> {
    const result = await this.db
      .prepare(`
        UPDATE user_groups 
        SET role = ?
        WHERE group_id = ? AND user_id = ?
        RETURNING *
      `)
      .bind(role, groupId, userId)
      .first<UserGroup>();
    
    return result || null;
  }

  async getUserGroups(userId: string): Promise<{ group_id: string; role: string }[]> {
    const result = await this.db
      .prepare('SELECT group_id, role FROM user_groups WHERE user_id = ?')
      .bind(userId)
      .all<{ group_id: string; role: string }>();
    
    return result.results || [];
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT 1 FROM user_groups WHERE user_id = ? AND group_id = ?')
      .bind(userId, groupId)
      .first<{ '1': number }>();
    
    return !!result;
  }

  async getUserRoleInGroup(userId: string, groupId: string): Promise<'admin' | 'member' | null> {
    const result = await this.db
      .prepare('SELECT role FROM user_groups WHERE user_id = ? AND group_id = ?')
      .bind(userId, groupId)
      .first<{ role: string }>();
    
    return (result?.role as 'admin' | 'member') || null;
  }
} 