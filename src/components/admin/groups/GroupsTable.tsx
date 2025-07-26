import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  users_count: number;
};

const createColumns = (apiToken: string): ColumnDef<Group>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const group = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <a
              className="text-primary font-medium hover:underline"
              href={`/admin/groups/${group.id}`}
            >
              {group.name}
            </a>
            {group.description && (
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "users_count",
    header: "Members",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span>{row.original.users_count} users</span>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const group = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/admin/groups/${group.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                View Details
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/admin/groups/${group.id}/users`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/admin/groups/${group.id}/permissions`}>
                <Edit className="mr-2 h-4 w-4" />
                Permissions
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
                  // Handle delete
                  fetch(`/api/groups/${group.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${apiToken}`,
                    },
                  }).then(() => {
                    window.location.reload();
                  });
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface GroupsTableProps {
  data: Group[];
  apiToken: string;
}

export function GroupsTable({ data, apiToken }: GroupsTableProps) {
  const columns = createColumns(apiToken);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Groups</h1>
          <p className="text-muted-foreground">
            Manage user groups and permissions
          </p>
        </div>
      </div>
      
      <div className="rounded-md border">
        <DataTable table={table} />
      </div>
    </div>
  );
} 