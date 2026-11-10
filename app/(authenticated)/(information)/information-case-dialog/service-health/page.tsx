
const applications = [
  { name: "Information Case System", environment: "Production", url: "bizinfo.world/k_sys", status: "Healthy", response: "120 ms", checked: "Just now" },
  { name: "Email Knowledge API", environment: "Production", url: "API service", status: "Healthy", response: "85 ms", checked: "Just now" },
  { name: "MySQL Database", environment: "Production", url: "Database server", status: "Healthy", response: "12 ms", checked: "Just now" },
  { name: "Email Import Service", environment: "Production", url: "Background service", status: "Degraded", response: "1.8 s", checked: "1 min ago" },
];

export default function ServiceHealthPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <div>
        {/* <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">System Monitoring</p> */}
        <h1 className="mt-2 text-3xl font-bold">Service Health</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor the availability and response time of connected applications.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <div>
            <p className="font-semibold text-emerald-800">Systems operational</p>
            <p className="mt-1 text-sm text-emerald-700">
              Most monitored applications are responding normally.
            </p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-semibold">Application Status</h2>
          <p className="mt-1 text-xs text-gray-500">Application availability and latest health checks.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-6 py-4">Application</th>
                <th className="px-4 py-4">Environment</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Response time</th>
                <th className="px-4 py-4">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.name} className="border-t border-gray-100">
                  <td className="px-6 py-4">
                    <p className="font-medium">{app.name}</p>
                    <p className="mt-1 text-xs text-gray-400">{app.url}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{app.environment}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium ${
                      app.status === "Healthy"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{app.response}</td>
                  <td className="px-4 py-4 text-gray-500">{app.checked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
