export interface CustomerGroup {
  id: string;
  customer_id: number;
  group_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface CustomerInGroup {
  id: string;
  email: string;
  role: 'admin' | 'member';
  joined_at: string;
  type: 'customer';
}

export interface AddCustomerToGroupData {
  customer_id: number;
  role?: 'admin' | 'member';
}

export class CustomerGroupService {
  constructor(private authDb: D1Database, private customerDb?: D1Database) {}

  async getCustomersInGroup(groupId: string): Promise<CustomerInGroup[]> {
    const result = await this.authDb
      .prepare(`
        SELECT cg.customer_id, cg.role, cg.joined_at
        FROM customer_groups cg
        WHERE cg.group_id = ?
        ORDER BY cg.joined_at DESC
      `)
      .bind(groupId)
      .all<{ customer_id: number; role: string; joined_at: string }>();
    
    if (!this.customerDb) {
      return [];
    }

    // Get customer details from customer database
    const customers = await Promise.all(
      (result.results || []).map(async (row) => {
        const customer = await this.customerDb!
          .prepare('SELECT id, email FROM customers WHERE id = ?')
          .bind(row.customer_id)
          .first<{ id: number; email: string }>();
        
        if (!customer) {
          return null;
        }

        return {
          id: customer.id.toString(),
          email: customer.email,
          role: row.role as 'admin' | 'member',
          joined_at: row.joined_at,
          type: 'customer' as const
        };
      })
    );

    return customers.filter(Boolean) as CustomerInGroup[];
  }

  async addCustomerToGroup(groupId: string, data: AddCustomerToGroupData): Promise<CustomerGroup> {
    const result = await this.authDb
      .prepare(`
        INSERT INTO customer_groups (customer_id, group_id, role)
        VALUES (?, ?, ?)
        RETURNING *
      `)
      .bind(data.customer_id, groupId, data.role || 'member')
      .first<CustomerGroup>();
    
    if (!result) {
      throw new Error('Failed to add customer to group');
    }
    
    return result;
  }

  async removeCustomerFromGroup(groupId: string, customerId: number): Promise<boolean> {
    const result = await this.authDb
      .prepare('DELETE FROM customer_groups WHERE group_id = ? AND customer_id = ?')
      .bind(groupId, customerId)
      .run();
    
    return result.meta.changes > 0;
  }

  async updateCustomerRole(groupId: string, customerId: number, role: 'admin' | 'member'): Promise<CustomerGroup | null> {
    const result = await this.authDb
      .prepare(`
        UPDATE customer_groups 
        SET role = ?
        WHERE group_id = ? AND customer_id = ?
        RETURNING *
      `)
      .bind(role, groupId, customerId)
      .first<CustomerGroup>();
    
    return result || null;
  }

  async isCustomerInGroup(customerId: number, groupId: string): Promise<boolean> {
    const result = await this.authDb
      .prepare('SELECT 1 FROM customer_groups WHERE customer_id = ? AND group_id = ?')
      .bind(customerId, groupId)
      .first<{ '1': number }>();
    
    return !!result;
  }
} 