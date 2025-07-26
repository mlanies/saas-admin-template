export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
}

export class GroupService {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Group[]> {
    const result = await this.db
      .prepare('SELECT * FROM groups ORDER BY created_at DESC')
      .all<Group>();
    return result.results || [];
  }

  async getById(id: string): Promise<Group | null> {
    const result = await this.db
      .prepare('SELECT * FROM groups WHERE id = ?')
      .bind(id)
      .first<Group>();
    return result || null;
  }

  async create(data: CreateGroupData): Promise<Group> {
    const result = await this.db
      .prepare(`
        INSERT INTO groups (name, description)
        VALUES (?, ?)
        RETURNING *
      `)
      .bind(data.name, data.description || null)
      .first<Group>();
    
    if (!result) {
      throw new Error('Failed to create group');
    }
    
    return result;
  }

  async update(id: string, data: UpdateGroupData): Promise<Group | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await this.db
      .prepare(`
        UPDATE groups 
        SET ${updates.join(', ')}
        WHERE id = ?
        RETURNING *
      `)
      .bind(...values)
      .first<Group>();

    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM groups WHERE id = ?')
      .bind(id)
      .run();
    
    return result.meta.changes > 0;
  }

  async getUsersCount(groupId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM user_groups WHERE group_id = ?')
      .bind(groupId)
      .first<{ count: number }>();
    
    return result?.count || 0;
  }
} 