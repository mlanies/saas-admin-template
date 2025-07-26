-- Migration number: 0007 	 2024-12-27T22:30:00.000Z
-- Customer-group relationship table (many-to-many) without foreign key to customers
CREATE TABLE customer_groups (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    customer_id INTEGER NOT NULL,
    group_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE(customer_id, group_id)
); 