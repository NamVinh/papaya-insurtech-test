const CLAIM_TYPES = [
  {
    id: 'OUTPATIENT',
    label: 'Outpatient',
    icon: '🏥',
    description: 'Doctor visits, consultations, minor procedures without overnight stay',
    docs: 'Medical receipt required',
  },
  {
    id: 'INPATIENT',
    label: 'Inpatient',
    icon: '🛏️',
    description: 'Hospital admission with overnight stay, surgeries, intensive care',
    docs: 'Discharge summary + itemized bill required',
  },
  {
    id: 'DENTAL',
    label: 'Dental',
    icon: '🦷',
    description: 'Dental check-ups, fillings, extractions, major dental procedures',
    docs: 'Dental receipt required',
  },
];

export default function Step1ClaimType({ formData, onChange, onNext }) {
  const selected = formData.claimType;

  function handleSelect(type) {
    onChange({ claimType: type });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Select Claim Type</h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose the type of medical claim you are submitting.
      </p>

      <div className="space-y-3" role="radiogroup" aria-label="Claim type">
        {CLAIM_TYPES.map((type) => {
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(type.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{type.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold text-base ${
                        isSelected ? 'text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      {type.label}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{type.docs}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
