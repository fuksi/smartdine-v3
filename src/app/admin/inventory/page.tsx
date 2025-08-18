export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Track and manage restaurant inventory levels
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">
          Inventory Management Coming Soon
        </h3>
        <p className="text-muted-foreground mb-4">
          This section will include features for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Track ingredient stock levels</li>
          <li>Set low stock alerts and reorder points</li>
          <li>Manage supplier information and orders</li>
          <li>Track ingredient costs and pricing</li>
          <li>Generate inventory reports</li>
          <li>Link ingredients to menu items</li>
        </ul>
      </div>
    </div>
  );
}
