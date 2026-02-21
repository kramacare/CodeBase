import { useQueue } from "../context/QueueContext";

export default function LiveQueue() {
  const { queue, currentToken } = useQueue();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Live Queue</h1>

      {/* Now Serving */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold">Now Serving</h2>
        <div className="text-3xl font-bold text-[#00555A] mt-2">
          A-{currentToken}
        </div>
      </div>

      {/* Waiting Queue */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Waiting Patients</h2>

        {queue.length === 0 ? (
          <p className="text-gray-500">No patients in queue</p>
        ) : (
          <ul className="space-y-2">
            {queue.map((p, i) => (
              <li
                key={p.token}
                className="flex justify-between border-b pb-2"
              >
                <span>{p.token}</span>
                <span className="text-gray-500">{p.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
