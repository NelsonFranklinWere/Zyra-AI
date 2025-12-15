export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-4 text-gray-600">Manage your account and business settings.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <p className="mt-2 text-sm text-gray-600">Coming soon</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Business Settings</h2>
          <p className="mt-2 text-sm text-gray-600">Coming soon</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">WhatsApp Integration</h2>
          <p className="mt-2 text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

