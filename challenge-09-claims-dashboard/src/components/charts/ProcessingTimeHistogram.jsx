import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProcessingTimeHistogram({ data }) {
  const chartData = useMemo(() => {
    const buckets = Array(10).fill(0); // 0-2, 3-5, 6-8, ... 24-26, 27-30
    const labels = ['1–3','4–6','7–9','10–12','13–15','16–18','19–21','22–24','25–27','28–30'];
    data.forEach(r => {
      if (!r.processed_date || !r.submitted_date) return;
      const days = Math.round((new Date(r.processed_date) - new Date(r.submitted_date)) / 86400000);
      if (days < 1) return;
      const bucket = Math.min(Math.floor((days - 1) / 3), 9);
      buckets[bucket]++;
    });
    return labels.map((label, i) => ({ label, count: buckets[i] }));
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Processing Time Distribution (days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [v, 'Claims']} labelFormatter={(l) => `${l} days`} />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
