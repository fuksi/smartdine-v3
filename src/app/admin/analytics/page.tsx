export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          View sales reports and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">$12,345</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-3xl font-bold text-blue-600">542</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Average Order</h3>
          <p className="text-3xl font-bold text-purple-600">$22.76</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">
          Analytics Dashboard Coming Soon
        </h3>
        <p className="text-muted-foreground">
          Detailed analytics, charts, and reporting features will be implemented
          here.
        </p>
      </div>
    </div>
  );
}
