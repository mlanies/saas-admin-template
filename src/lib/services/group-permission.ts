export interface GroupPermission {
  id: string;
  group_id: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface CreatePermissionData {
  resource: string;
  action: string;
}

export type Resource = 'customers' | 'subscriptions' | 'admin' | 'groups';
export type Action = 'read' | 'write' | 'delete' | 'admin';

export class GroupPermissionService {
  constructor(private db: D1Database) {}

  async getGroupPermissions(groupId: string): Promise<GroupPermission[]> {
    const result = await this.db
      .prepare('SELECT * FROM group_permissions WHERE group_id = ? ORDER BY resource, action')
      .bind(groupId)
      .all<GroupPermission>();
    
    return result.results || [];
  }

  async addPermission(groupId: string, data: CreatePermissionData): Promise<GroupPermission> {
    const result = await this.db
      .prepare(`
        INSERT INTO group_permissions (group_id, resource, action)
        VALUES (?, ?, ?)
        RETURNING *
      `)
      .bind(groupId, data.resource, data.action)
      .first<GroupPermission>();
    
    if (!result) {
      throw new Error('Failed to add permission');
    }
    
    return result;
  }

  async removePermission(groupId: string, permissionId: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM group_permissions WHERE id = ? AND group_id = ?')
      .bind(permissionId, groupId)
      .run();
    
    return result.meta.changes > 0;
  }

  async hasPermission(groupId: string, resource: string, action: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT 1 FROM group_permissions WHERE group_id = ? AND resource = ? AND action = ?')
      .bind(groupId, resource, action)
      .first<{ '1': number }>();
    
    return !!result;
  }

  async getUserPermissions(userId: string): Promise<{ resource: string; action: string }[]> {
    const result = await this.db
      .prepare(`
        SELECT DISTINCT gp.resource, gp.action
        FROM group_permissions gp
        JOIN user_groups ug ON gp.group_id = ug.group_id
        WHERE ug.user_id = ?
        ORDER BY gp.resource, gp.action
      `)
      .bind(userId)
      .all<{ resource: string; action: string }>();
    
    return result.results || [];
  }

  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const result = await this.db
      .prepare(`
        SELECT 1 FROM group_permissions gp
        JOIN user_groups ug ON gp.group_id = ug.group_id
        WHERE ug.user_id = ? AND gp.resource = ? AND gp.action = ?
      `)
      .bind(userId, resource, action)
      .first<{ '1': number }>();
    
    return !!result;
  }

  async setGroupPermissions(groupId: string, permissions: CreatePermissionData[]): Promise<void> {
    // Удаляем все существующие разрешения
    await this.db
      .prepare('DELETE FROM group_permissions WHERE group_id = ?')
      .bind(groupId)
      .run();

    // Добавляем новые разрешения
    for (const permission of permissions) {
      await this.addPermission(groupId, permission);
    }
  }
} 