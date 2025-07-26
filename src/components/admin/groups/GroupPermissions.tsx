import React, { useState, useEffect } from 'react';
import { Save, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GroupPermission {
  id: string;
  group_id: string;
  resource: string;
  action: string;
  created_at: string;
}

interface GroupPermissionsProps {
  groupId: string;
  groupName: string;
  apiToken?: string;
}

const RESOURCES = [
  { id: 'customers', label: 'Customers', description: 'Manage customer data' },
  { id: 'subscriptions', label: 'Subscriptions', description: 'Manage subscription plans' },
  { id: 'admin', label: 'Admin Panel', description: 'Access to admin dashboard' },
  { id: 'groups', label: 'Groups', description: 'Manage user groups' }
];

const ACTIONS = [
  { id: 'read', label: 'Read', description: 'View data' },
  { id: 'write', label: 'Write', description: 'Create and edit data' },
  { id: 'delete', label: 'Delete', description: 'Remove data' },
  { id: 'admin', label: 'Admin', description: 'Full access' }
];

export function GroupPermissions({ groupId, groupName, apiToken }: GroupPermissionsProps) {
  const [permissions, setPermissions] = useState<GroupPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    fetchPermissions();
  }, [groupId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
      }
      
      const response = await fetch(`/api/groups/${groupId}/permissions`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch group permissions');
      }
      const data = await response.json() as GroupPermission[];
      setPermissions(data);
      
      // Create permissions matrix
      const matrix: Record<string, Record<string, boolean>> = {};
      RESOURCES.forEach(resource => {
        matrix[resource.id] = {};
        ACTIONS.forEach(action => {
          matrix[resource.id][action.id] = data.some(
            p => p.resource === resource.id && p.action === action.id
          );
        });
      });
      setPermissionMatrix(matrix);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: checked
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError(null);

      // Собираем все разрешения из матрицы
      const newPermissions: { resource: string; action: string }[] = [];
      Object.entries(permissionMatrix).forEach(([resource, actions]) => {
        Object.entries(actions).forEach(([action, enabled]) => {
          if (enabled) {
            newPermissions.push({ resource, action });
          }
        });
      });

      // Send request to update permissions
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
      }
      
      const response = await fetch(`/api/groups/${groupId}/permissions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newPermissions),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to save permissions');
      }

      // Update permissions list
      await fetchPermissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to remove this permission?')) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
      }
      
      const response = await fetch(`/api/groups/${groupId}/permissions/${permissionId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to remove permission');
      }

      // Update permissions list
      await fetchPermissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove permission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Group Permissions</h1>
        <p className="text-muted-foreground">
          Manage permissions for group: {groupName}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  {ACTIONS.map(action => (
                    <TableHead key={action.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">{action.label}</span>
                        <span className="text-xs text-muted-foreground">{action.description}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {RESOURCES.map(resource => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{resource.label}</div>
                        <div className="text-sm text-muted-foreground">{resource.description}</div>
                      </div>
                    </TableCell>
                    {ACTIONS.map(action => (
                      <TableCell key={action.id} className="text-center">
                        <Checkbox
                          checked={permissionMatrix[resource.id]?.[action.id] || false}
                          onCheckedChange={(checked: boolean | 'indeterminate') => 
                            handlePermissionChange(resource.id, action.id, checked === true)
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSavePermissions} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No permissions set for this group.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      {RESOURCES.find(r => r.id === permission.resource)?.label || permission.resource}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ACTIONS.find(a => a.id === permission.action)?.label || permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(permission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePermission(permission.id)}
                        title="Remove permission"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 