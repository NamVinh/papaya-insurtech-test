import { useState } from 'react';
import { mockMember } from '../../data/mockMember';

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  const diff = new Date(b) - new Date(a);
  return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
}

export default function Step5Review({ formData, onBack, onGoToStep }) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { claimType, memberInfo: mi, diagnosis: dx, documents } = formData;
  const dep = mi.isForDependent
    ? mockMember.dependents.find((d) => d.id === mi.dependentId)
    : null;

  const los =
    claimType === 'INPATIENT' ? daysBetween(dx.admissionDate, dx.dischargeDate) : null;

  const docEntries = Object.entries(documents);

  function handleSubmit() {
    console.log('=== CLAIM SUBMITTED ===', JSON.stringify(formData, null, 2));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Your claim has been received. Reference ID:{' '}
          <strong className="font-mono text-gray-800">CLM-{Date.now().toString().slice(-8)}</strong>
        </p>
        <p className="text-gray-400 text-xs">Check your console for the full submission payload.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Review &amp; Submit</h2>
      <p className="text-gray-500 text-sm mb-6">
        Review all information before submitting. Use the edit links to go back and change anything.
      </p>

      {/* Step 1 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Claim Type</span>
        <button
          onClick={() => onGoToStep(1)}
          className="text-xs text-blue-600 hover:underline focus:outline-none"
        >
          Edit
        </button>
      </div>
      <Section title="">
        <Row label="Type" value={claimType} />
      </Section>

      {/* Step 2 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Member Info</span>
        <button
          onClick={() => onGoToStep(2)}
          className="text-xs text-blue-600 hover:underline focus:outline-none"
        >
          Edit
        </button>
      </div>
      <Section title="">
        <Row label="Member Name" value={mi.memberName} />
        <Row label="Policy Number" value={mi.policyNumber} />
        <Row label="Member ID" value={mi.memberId} />
        <Row label="Date of Birth" value={mi.dateOfBirth} />
        {dep && <Row label="Dependent" value={`${dep.name} (${dep.relation})`} />}
      </Section>

      {/* Step 3 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Diagnosis</span>
        <button
          onClick={() => onGoToStep(3)}
          className="text-xs text-blue-600 hover:underline focus:outline-none"
        >
          Edit
        </button>
      </div>
      <Section title="">
        <Row label="Description" value={dx.diagnosisDescription} />
        <Row
          label="ICD-10"
          value={dx.icd10 ? `${dx.icd10.code} — ${dx.icd10.description}` : ''}
        />
        {claimType === 'INPATIENT' ? (
          <>
            <Row label="Admission Date" value={dx.admissionDate} />
            <Row label="Discharge Date" value={dx.dischargeDate} />
            {los !== null && <Row label="Length of Stay" value={`${los} day${los !== 1 ? 's' : ''}`} />}
            <Row label="Admission Reason" value={dx.admissionReason} />
          </>
        ) : (
          <Row label="Treatment Date" value={dx.treatmentDate} />
        )}
        <Row label="Hospital / Provider" value={dx.hospitalName} />
      </Section>

      {/* Step 4 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Documents</span>
        <button
          onClick={() => onGoToStep(4)}
          className="text-xs text-blue-600 hover:underline focus:outline-none"
        >
          Edit
        </button>
      </div>
      <Section title="">
        {docEntries.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded.</p>
        ) : (
          docEntries.map(([key, file]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-gray-400">— {file.name}</span>
            </div>
          ))
        )}
      </Section>

      {/* Confirmation */}
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I confirm that all the information provided is accurate and complete. I understand that
            false or misleading information may result in claim rejection or policy cancellation.
          </span>
        </label>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!confirmed}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit Claim
        </button>
      </div>
    </div>
  );
}
