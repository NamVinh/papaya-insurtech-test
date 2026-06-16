import FileUpload from '../ui/FileUpload';

const DOCS_BY_TYPE = {
  OUTPATIENT: [
    { key: 'medical_receipt', label: 'Medical Receipt', required: true },
    { key: 'prescription', label: 'Prescription', required: false },
  ],
  INPATIENT: [
    { key: 'discharge_summary', label: 'Discharge Summary', required: true },
    { key: 'itemized_bill', label: 'Itemized Bill', required: true },
    { key: 'medical_receipt', label: 'Medical Receipt', required: true },
  ],
  DENTAL: [
    { key: 'dental_receipt', label: 'Dental Receipt', required: true },
    { key: 'treatment_plan', label: 'Treatment Plan', required: false, note: 'Required for major dental procedures' },
  ],
};

export default function Step4Documents({ formData, onChange, onNext, onBack, errors }) {
  const claimType = formData.claimType;
  const files = formData.documents;
  const docs = DOCS_BY_TYPE[claimType] || [];

  function handleAdd(key, file) {
    onChange({ documents: { ...files, [key]: file } });
  }

  function handleRemove(key) {
    const updated = { ...files };
    delete updated[key];
    onChange({ documents: updated });
  }

  const missingRequired = docs
    .filter((d) => d.required && !files[d.key])
    .map((d) => d.label);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Document Upload</h2>
      <p className="text-gray-500 text-sm mb-2">
        Upload the required documents for your <strong>{claimType}</strong> claim.
      </p>
      {missingRequired.length > 0 && errors?.documents && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Missing required documents:</p>
          <ul className="list-disc list-inside text-sm text-red-500 mt-1">
            {missingRequired.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        {docs.map((doc) => (
          <div key={doc.key}>
            {doc.note && (
              <p className="text-xs text-amber-600 mb-1 ml-0.5">ℹ️ {doc.note}</p>
            )}
            <FileUpload
              label={doc.label}
              required={doc.required}
              docKey={doc.key}
              files={files}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
