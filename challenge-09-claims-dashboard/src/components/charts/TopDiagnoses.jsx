import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ICD10_LABELS = {
  J00:'Common cold', J06:'Upper resp. infection', J45:'Asthma', J18:'Pneumonia',
  I10:'Hypertension', I21:'Myocardial infarction', E11:'Type 2 diabetes',
  K21:'GERD', M54:'Back pain', L20:'Atopic dermatitis', A90:'Dengue fever',
  B01:'Chickenpox', K02:'Dental caries', K05:'Gingivitis', H10:'Conjunctivitis',
  R50:'Fever (unknown)', G43:'Migraine', N39:'UTI', J30:'Allergic rhinitis', K29:'Gastritis',
};

const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899',
  '#f43f5e','#ef4444','#f97316','#f59e0b','#eab308'];

function fmt(n) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`;
  return n;
}

function DiagChart({ title, chartData, dataKey, color, onDiagClick, selectedDiag }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-3">Click a bar to drill down into claims</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={fmt} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
          <Tooltip
            formatter={(v, name) => [name === 'count' ? v : `${v.toLocaleString()} THB`, name === 'count' ? 'Claims' : 'Total Cost']}
            labelFormatter={(l) => l}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} onClick={d => onDiagClick(d.code)}>
            {chartData.map((entry, i) => (
              <Cell key={entry.code}
                fill={entry.code === selectedDiag ? '#1d4ed8' : COLORS[i % COLORS.length]}
                cursor="pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TopDiagnoses({ data, onDiagClick, selectedDiag }) {
  const { byFreq, byCost } = useMemo(() => {
    const freq = {}, cost = {};
    data.forEach(r => {
      freq[r.diagnosis_icd10] = (freq[r.diagnosis_icd10] || 0) + 1;
      cost[r.diagnosis_icd10] = (cost[r.diagnosis_icd10] || 0) + Number(r.approved_amount);
    });
    const label = code => `${code}: ${ICD10_LABELS[code] || code}`;
    const byFreq = Object.entries(freq).sort(([,a],[,b]) => b - a).slice(0, 10)
      .map(([code, count]) => ({ code, label: label(code), count })).reverse();
    const byCost = Object.entries(cost).sort(([,a],[,b]) => b - a).slice(0, 10)
      .map(([code, total]) => ({ code, label: label(code), total })).reverse();
    return { byFreq, byCost };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DiagChart title="Top 10 Diagnoses by Frequency" chartData={byFreq}
        dataKey="count" color="#3b82f6" onDiagClick={onDiagClick} selectedDiag={selectedDiag} />
      <DiagChart title="Top 10 Diagnoses by Total Approved Cost" chartData={byCost}
        dataKey="total" color="#6366f1" onDiagClick={onDiagClick} selectedDiag={selectedDiag} />
    </div>
  );
}
