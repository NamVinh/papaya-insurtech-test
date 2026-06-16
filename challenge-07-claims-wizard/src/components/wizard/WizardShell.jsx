const STEPS = [
  { number: 1, label: 'Claim Type' },
  { number: 2, label: 'Member Info' },
  { number: 3, label: 'Diagnosis' },
  { number: 4, label: 'Documents' },
  { number: 5, label: 'Review' },
];

export default function WizardShell({ currentStep, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Claims Intake Wizard</h1>
          <p className="text-gray-500 mt-1">Submit your insurance claim in 5 easy steps</p>
        </div>

        {/* Progress bar */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const status =
                step.number < currentStep
                  ? 'complete'
                  : step.number === currentStep
                  ? 'current'
                  : 'upcoming';

              return (
                <li key={step.number} className="flex-1 relative">
                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-0.5 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex flex-col items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 z-10 ${
                        status === 'complete'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : status === 'current'
                          ? 'bg-white border-blue-600 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      aria-current={status === 'current' ? 'step' : undefined}
                    >
                      {status === 'complete' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </span>
                    <span
                      className={`mt-1 text-xs font-medium hidden sm:block ${
                        status === 'current' ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
