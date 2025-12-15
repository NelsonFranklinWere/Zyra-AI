export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome to your Zyra dashboard.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Messages Today</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="mt-2 text-3xl font-bold">0%</p>
        </div>
      </div>
    </div>
  );
}

