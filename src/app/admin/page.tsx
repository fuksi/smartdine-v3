import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UtensilsCrossed,
  ShoppingCart,
  Settings,
  BarChart3,
  Users,
  Package,
} from "lucide-react";

export default function AdminPage() {
  const dashboardCards = [
    {
      title: "Menu Management",
      description: "Add, edit, and manage your menu items and categories",
      href: "/admin/menu",
      icon: UtensilsCrossed,
    },
    {
      title: "Option Management",
      description:
        "Create and manage product options that can be assigned to menu items",
      href: "/admin/options",
      icon: Settings,
    },
    {
      title: "Orders",
      description: "View and manage incoming orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Analytics",
      description: "View sales reports and performance metrics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Customers",
      description: "Manage customer information and history",
      href: "/admin/customers",
      icon: Users,
    },
    {
      title: "Inventory",
      description: "Track and manage restaurant inventory",
      href: "/admin/inventory",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your restaurant management dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
