const CLAIM_TYPES = ['OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY'];
const INSURERS = ['AIA Thailand', 'Allianz Care', 'Cigna Global'];
const COUNTRIES = ['Thailand', 'Vietnam', 'Hong Kong'];
const STATUSES = ['APPROVED', 'REJECTED', 'PENDING', 'IN_REVIEW'];

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, onChange, onReset }) {
  function set(key, val) { onChange({ ...filters, [key]: val }); }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date From</label>
          <input type="date" value={filters.dateFrom}
            onChange={e => set('dateFrom', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date To</label>
          <input type="date" value={filters.dateTo}
            onChange={e => set('dateTo', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <Select label="Claim Type" value={filters.claimType} onChange={v => set('claimType', v)} options={CLAIM_TYPES} />
        <Select label="Insurer" value={filters.insurer} onChange={v => set('insurer', v)} options={INSURERS} />
        <Select label="Country" value={filters.country} onChange={v => set('country', v)} options={COUNTRIES} />
        <Select label="Status" value={filters.status} onChange={v => set('status', v)} options={STATUSES} />
        <button onClick={onReset}
          className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors self-end focus:outline-none focus:ring-2 focus:ring-gray-400">
          Reset
        </button>
      </div>
    </div>
  );
}
