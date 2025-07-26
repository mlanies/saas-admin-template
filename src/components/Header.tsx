import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/groups", label: "Groups" },
];

export function Header({ currentPath, user }: { currentPath: string; user?: any }) {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 h-16">
      <a href="/" className="text-sm font-bold leading-none text-foreground">
        SaaS Admin Template
      </a>
      
              {/* Show navigation only for authenticated users */}
      {user && user.loggedIn && (
        <>
          {links.map((link) => (
            <a
              key={link.href}
              className={cn(
                "text-sm font-medium leading-none text-foreground",
                currentPath === link.href
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
              href={link.href}
              aria-current={currentPath === link.href ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <a 
              href="/logout" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </a>
          </div>
        </>
      )}
    </nav>
  );
}
