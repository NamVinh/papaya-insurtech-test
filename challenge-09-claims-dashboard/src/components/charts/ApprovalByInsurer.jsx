import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const INSURERS = ['AIA Thailand', 'Allianz Care', 'Cigna Global'];

export default function ApprovalByInsurer({ data }) {
  const chartData = useMemo(() => {
    return INSURERS.map(insurer => {
      const rows = data.filter(r => r.insurer === insurer);
      const total = rows.length;
      const approved = rows.filter(r => r.status === 'APPROVED').length;
      const rejected = rows.filter(r => r.status === 'REJECTED').length;
      const pending = rows.filter(r => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
      return {
        insurer: insurer.replace(' ', '\n'),
        approved: total ? Math.round((approved / total) * 100) : 0,
        rejected: total ? Math.round((rejected / total) * 100) : 0,
        pending: total ? Math.round((pending / total) * 100) : 0,
      };
    });
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Approval Rate by Insurer (%)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="insurer" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
          <Tooltip formatter={(v) => [`${v}%`]} />
          <Legend />
          <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" name="Pending/Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
