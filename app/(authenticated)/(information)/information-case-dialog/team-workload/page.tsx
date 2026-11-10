
const jobs = [
  { name: "Daily Information Case Sync", schedule: "00:30 daily", lastRun: "Today, 00:30", duration: "2m 14s", status: "Completed" },
  { name: "Email Import Batch", schedule: "01:00 daily", lastRun: "Today, 01:00", duration: "5m 32s", status: "Completed" },
  { name: "Knowledge Index Refresh", schedule: "02:00 daily", lastRun: "Today, 02:00", duration: "Running", status: "Running" },
  { name: "Daily Report Generation", schedule: "06:00 daily", lastRun: "Today, 06:00", duration: "—", status: "Scheduled" },
  { name: "Database Backup", schedule: "23:00 daily", lastRun: "Yesterday, 23:00", duration: "8m 10s", status: "Failed" },
];

const statusStyle: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Running: "bg-blue-50 text-blue-700",
  Scheduled: "bg-gray-100 text-gray-600",
  Failed: "bg-red-50 text-red-700",
};

export default function TeamWorkloadPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <div>
        {/* <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Operations</p> */}
        <h1 className="mt-2 text-3xl font-bold">Team Workload</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor scheduled batch jobs and their execution status.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          ["Total jobs", "5"],
          ["Completed", "2"],
          ["Failed", "1"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-semibold">Daily Batch Jobs</h2>
          <p className="mt-1 text-xs text-gray-500">Scheduled tasks and latest execution results.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-6 py-4">Job name</th>
                <th className="px-4 py-4">Schedule</th>
                <th className="px-4 py-4">Last run</th>
                <th className="px-4 py-4">Duration</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.name} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-medium">{job.name}</td>
                  <td className="px-4 py-4 text-gray-500">{job.schedule}</td>
                  <td className="px-4 py-4 text-gray-500">{job.lastRun}</td>
                  <td className="px-4 py-4 text-gray-500">{job.duration}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-md px-3 py-1 text-xs font-medium ${statusStyle[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
