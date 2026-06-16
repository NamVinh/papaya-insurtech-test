import { useState, useMemo } from 'react';
import { exportCSV } from '../utils/csvExport';

const PAGE_SIZE = 20;
const COLUMNS = [
  { key: 'claim_id', label: 'Claim ID' },
  { key: 'member_name', label: 'Member' },
  { key: 'claim_type', label: 'Type' },
  { key: 'diagnosis_icd10', label: 'ICD-10' },
  { key: 'status', label: 'Status' },
  { key: 'submitted_amount', label: 'Submitted (THB)' },
  { key: 'approved_amount', label: 'Approved (THB)' },
  { key: 'submitted_date', label: 'Date' },
  { key: 'insurer', label: 'Insurer' },
  { key: 'country', label: 'Country' },
];

const STATUS_STYLE = {
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
  IN_REVIEW: 'bg-blue-100 text-blue-700',
};

function fmt(n) { return Number(n).toLocaleString(); }

export default function ClaimsTable({ data, title }) {
  const [sortKey, setSortKey] = useState('submitted_date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const num = ['submitted_amount', 'approved_amount'].includes(sortKey);
      const cmp = num ? Number(av) - Number(bv) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortIcon({ col }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">
          {title || 'All Claims'} <span className="text-gray-400 font-normal">({data.length.toLocaleString()} rows)</span>
        </h3>
        <button onClick={() => exportCSV(sorted, 'claims-export.csv')}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
          ↓ Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left px-3 py-2.5 text-gray-600 font-semibold cursor-pointer hover:text-blue-600 whitespace-nowrap select-none">
                  {col.label}<SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={row.claim_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-mono text-gray-500">{row.claim_id}</td>
                <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{row.member_name}</td>
                <td className="px-3 py-2 text-gray-600">{row.claim_type}</td>
                <td className="px-3 py-2 font-mono">{row.diagnosis_icd10}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[row.status] || 'bg-gray-100 text-gray-600'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-gray-700">{fmt(row.submitted_amount)}</td>
                <td className="px-3 py-2 text-right text-green-700 font-medium">{fmt(row.approved_amount)}</td>
                <td className="px-3 py-2 text-gray-500">{row.submitted_date}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.insurer}</td>
                <td className="px-3 py-2 text-gray-600">{row.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">‹</button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">»</button>
        </div>
      </div>
    </div>
  );
}
