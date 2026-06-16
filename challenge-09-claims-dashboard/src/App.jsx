import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useFilteredData } from './hooks/useFilteredData';
import FilterBar from './components/FilterBar';
import KPICard from './components/KPICard';
import ClaimsByStatus from './components/charts/ClaimsByStatus';
import ClaimsOverTime from './components/charts/ClaimsOverTime';
import TopDiagnoses from './components/charts/TopDiagnoses';
import ProcessingTimeHistogram from './components/charts/ProcessingTimeHistogram';
import ApprovalByInsurer from './components/charts/ApprovalByInsurer';
import ClaimsTable from './components/ClaimsTable';

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '', claimType: '', insurer: '', country: '', status: '' };

const ICD10_LABELS = {
  J00:'Common cold', J06:'Upper resp. infection', J45:'Asthma', J18:'Pneumonia',
  I10:'Hypertension', I21:'Myocardial infarction', E11:'Type 2 diabetes',
  K21:'GERD', M54:'Back pain', L20:'Atopic dermatitis', A90:'Dengue fever',
  B01:'Chickenpox', K02:'Dental caries', K05:'Gingivitis', H10:'Conjunctivitis',
  R50:'Fever (unknown)', G43:'Migraine', N39:'UTI', J30:'Allergic rhinitis', K29:'Gastritis',
};

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedDiag, setSelectedDiag] = useState(null);

  useEffect(() => {
    fetch('/claims.csv')
      .then(r => r.text())
      .then(text => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
        setRawData(result.data);
        setLoading(false);
      });
  }, []);

  const filtered = useFilteredData(rawData, filters);

  const kpis = useMemo(() => {
    if (!filtered.length) return null;
    const approved = filtered.filter(r => r.status === 'APPROVED');
    const approvalRate = ((approved.length / filtered.length) * 100).toFixed(1);
    const totalApproved = approved.reduce((s, r) => s + Number(r.approved_amount), 0);
    const avgClaim = filtered.reduce((s, r) => s + Number(r.submitted_amount), 0) / filtered.length;

    const processed = filtered.filter(r => r.processed_date && r.submitted_date);
    const avgProcessing = processed.length
      ? processed.reduce((s, r) => s + Math.round((new Date(r.processed_date) - new Date(r.submitted_date)) / 86400000), 0) / processed.length
      : 0;

    return { total: filtered.length, approvalRate, totalApproved, avgClaim: Math.round(avgClaim), avgProcessing: avgProcessing.toFixed(1) };
  }, [filtered]);

  const drillData = useMemo(() => {
    if (!selectedDiag) return [];
    return filtered.filter(r => r.diagnosis_icd10 === selectedDiag);
  }, [filtered, selectedDiag]);

  function handleDiagClick(code) {
    setSelectedDiag(prev => prev === code ? null : code);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading 5,000 claims…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Claims Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">5,000 claims · Jan–Dec 2024 · Papaya Insurtech</p>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} onReset={() => { setFilters(DEFAULT_FILTERS); setSelectedDiag(null); }} />

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <KPICard title="Total Claims" value={kpis.total.toLocaleString()} color="blue" />
            <KPICard title="Approval Rate" value={`${kpis.approvalRate}%`} color="green" />
            <KPICard title="Avg Processing" value={`${kpis.avgProcessing} days`} color="amber" />
            <KPICard title="Total Approved" value={`${fmt(kpis.totalApproved)} THB`} color="purple" />
            <KPICard title="Avg Claim" value={`${fmt(kpis.avgClaim)} THB`} color="rose" />
          </div>
        )}

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <ClaimsByStatus data={filtered} />
          <div className="lg:col-span-2">
            <ClaimsOverTime data={filtered} />
          </div>
        </div>

        {/* Top diagnoses */}
        <div className="mb-4">
          <TopDiagnoses data={filtered} onDiagClick={handleDiagClick} selectedDiag={selectedDiag} />
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ProcessingTimeHistogram data={filtered} />
          <ApprovalByInsurer data={filtered} />
        </div>

        {/* Drill-down table (shown when diagnosis selected) */}
        {selectedDiag && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-700">
                  Drill-down: {selectedDiag} — {ICD10_LABELS[selectedDiag] || selectedDiag}
                </span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {drillData.length} claims
                </span>
              </div>
              <button onClick={() => setSelectedDiag(null)}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                ✕ Close
              </button>
            </div>
            <ClaimsTable data={drillData} title={`Claims for ${selectedDiag}`} />
          </div>
        )}

        {/* Main table */}
        <ClaimsTable data={filtered} />
      </div>
    </div>
  );
}
