import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = { APPROVED: '#22c55e', REJECTED: '#ef4444', PENDING: '#f59e0b', IN_REVIEW: '#3b82f6' };

export default function ClaimsByStatus({ data }) {
  const counts = {};
  data.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Claims by Status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}>
            {chartData.map(entry => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [v, 'Claims']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
