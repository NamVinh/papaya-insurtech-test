import { mockMember } from '../../data/mockMember';

function Field({ label, id, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Step2MemberInfo({ formData, onChange, onNext, onBack, errors }) {
  const d = formData.memberInfo;

  function update(field, value) {
    onChange({
      memberInfo: { ...d, [field]: value },
    });
  }

  const isForDependent = d.isForDependent;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Member &amp; Policy Information</h2>
      <p className="text-gray-500 text-sm mb-6">
        Verify your details below. Pre-filled from your policy — you may edit if needed.
      </p>

      <div className="space-y-4">
        <Field label="Member Name" id="memberName" required>
          <input
            id="memberName"
            type="text"
            value={d.memberName}
            onChange={(e) => update('memberName', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.memberName ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors?.memberName && <p className="text-red-500 text-xs mt-1">{errors.memberName}</p>}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Policy Number" id="policyNumber" required>
            <input
              id="policyNumber"
              type="text"
              value={d.policyNumber}
              onChange={(e) => update('policyNumber', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.policyNumber ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors?.policyNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.policyNumber}</p>
            )}
          </Field>

          <Field label="Member ID" id="memberId" required>
            <input
              id="memberId"
              type="text"
              value={d.memberId}
              onChange={(e) => update('memberId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.memberId ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors?.memberId && <p className="text-red-500 text-xs mt-1">{errors.memberId}</p>}
          </Field>
        </div>

        <Field label="Date of Birth" id="dateOfBirth" required>
          <input
            id="dateOfBirth"
            type="date"
            value={d.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.dateOfBirth ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors?.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
          )}
        </Field>

        {/* Dependent toggle */}
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isForDependent}
              onChange={(e) => update('isForDependent', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              This claim is for a dependent
            </span>
          </label>
        </div>

        {isForDependent && (
          <Field label="Select Dependent" id="dependentId" required>
            <select
              id="dependentId"
              value={d.dependentId}
              onChange={(e) => update('dependentId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.dependentId ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">— Select dependent —</option>
              {mockMember.dependents.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name} ({dep.relation})
                </option>
              ))}
            </select>
            {errors?.dependentId && (
              <p className="text-red-500 text-xs mt-1">{errors.dependentId}</p>
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
