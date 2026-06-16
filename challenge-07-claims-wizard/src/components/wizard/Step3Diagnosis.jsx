import { useState } from 'react';
import ICD10Search from '../ui/ICD10Search';
import { mockHospitals } from '../../data/mockHospitals';

function Field({ label, id, required, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  const diff = new Date(b) - new Date(a);
  return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
}

export default function Step3Diagnosis({ formData, onChange, onNext, onBack, errors }) {
  const claimType = formData.claimType;
  const d = formData.diagnosis;
  const [hospitalInput, setHospitalInput] = useState(d.hospitalName);
  const [hospitalSuggestions, setHospitalSuggestions] = useState([]);

  function update(field, value) {
    onChange({ diagnosis: { ...d, [field]: value } });
  }

  function handleHospitalInput(e) {
    const val = e.target.value;
    setHospitalInput(val);
    update('hospitalName', val);
    if (val.length > 0) {
      const lower = val.toLowerCase();
      setHospitalSuggestions(
        mockHospitals.filter((h) => h.toLowerCase().includes(lower)).slice(0, 6)
      );
    } else {
      setHospitalSuggestions([]);
    }
  }

  function selectHospital(name) {
    setHospitalInput(name);
    update('hospitalName', name);
    setHospitalSuggestions([]);
  }

  const isInpatient = claimType === 'INPATIENT';
  const los = isInpatient ? daysBetween(d.admissionDate, d.dischargeDate) : null;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Diagnosis &amp; Treatment</h2>
      <p className="text-gray-500 text-sm mb-6">
        Provide details about the medical condition and treatment received.
      </p>

      <div className="space-y-4">
        <Field label="Diagnosis Description" id="diagnosisDescription" required>
          <textarea
            id="diagnosisDescription"
            rows={3}
            value={d.diagnosisDescription}
            onChange={(e) => update('diagnosisDescription', e.target.value)}
            placeholder="Describe the diagnosis or reason for visit..."
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors?.diagnosisDescription ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors?.diagnosisDescription && (
            <p className="text-red-500 text-xs mt-1">{errors.diagnosisDescription}</p>
          )}
        </Field>

        <Field
          label="ICD-10 Code"
          id="icd10"
          required
          hint="Start typing the code (e.g. J06) or condition name (e.g. flu)"
        >
          <ICD10Search
            value={d.icd10}
            onChange={(val) => update('icd10', val)}
            error={!!errors?.icd10}
          />
          {errors?.icd10 && <p className="text-red-500 text-xs mt-1">{errors.icd10}</p>}
        </Field>

        {/* Date fields */}
        {isInpatient ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Admission Date" id="admissionDate" required>
              <input
                id="admissionDate"
                type="date"
                value={d.admissionDate}
                onChange={(e) => update('admissionDate', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors?.admissionDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors?.admissionDate && (
                <p className="text-red-500 text-xs mt-1">{errors.admissionDate}</p>
              )}
            </Field>
            <Field label="Discharge Date" id="dischargeDate" required>
              <input
                id="dischargeDate"
                type="date"
                value={d.dischargeDate}
                min={d.admissionDate || undefined}
                onChange={(e) => update('dischargeDate', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors?.dischargeDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors?.dischargeDate && (
                <p className="text-red-500 text-xs mt-1">{errors.dischargeDate}</p>
              )}
            </Field>
            {los !== null && (
              <div className="sm:col-span-2">
                <p className="text-sm text-blue-600 font-medium">
                  Length of stay: <strong>{los} day{los !== 1 ? 's' : ''}</strong>
                </p>
              </div>
            )}
          </div>
        ) : (
          <Field label="Treatment Date" id="treatmentDate" required>
            <input
              id="treatmentDate"
              type="date"
              value={d.treatmentDate}
              onChange={(e) => update('treatmentDate', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.treatmentDate ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors?.treatmentDate && (
              <p className="text-red-500 text-xs mt-1">{errors.treatmentDate}</p>
            )}
          </Field>
        )}

        {/* Hospital name with suggestions */}
        <Field label="Provider / Hospital Name" id="hospitalName" required>
          <div className="relative">
            <input
              id="hospitalName"
              type="text"
              value={hospitalInput}
              onChange={handleHospitalInput}
              onBlur={() => setTimeout(() => setHospitalSuggestions([]), 150)}
              placeholder="Start typing hospital name..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.hospitalName ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {hospitalSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {hospitalSuggestions.map((h) => (
                  <li
                    key={h}
                    onMouseDown={() => selectHospital(h)}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors?.hospitalName && (
            <p className="text-red-500 text-xs mt-1">{errors.hospitalName}</p>
          )}
        </Field>

        {/* Inpatient-only: admission reason */}
        {isInpatient && (
          <Field label="Admission Reason" id="admissionReason" required>
            <textarea
              id="admissionReason"
              rows={2}
              value={d.admissionReason}
              onChange={(e) => update('admissionReason', e.target.value)}
              placeholder="Why was the patient admitted?"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors?.admissionReason ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors?.admissionReason && (
              <p className="text-red-500 text-xs mt-1">{errors.admissionReason}</p>
            )}
          </Field>
        )}
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
