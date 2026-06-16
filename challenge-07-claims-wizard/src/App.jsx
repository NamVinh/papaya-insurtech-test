import { useState } from 'react';
import { mockMember } from './data/mockMember';
import WizardShell from './components/wizard/WizardShell';
import Step1ClaimType from './components/wizard/Step1ClaimType';
import Step2MemberInfo from './components/wizard/Step2MemberInfo';
import Step3Diagnosis from './components/wizard/Step3Diagnosis';
import Step4Documents from './components/wizard/Step4Documents';
import Step5Review from './components/wizard/Step5Review';

const DOCS_BY_TYPE = {
  OUTPATIENT: [{ key: 'medical_receipt', required: true }],
  INPATIENT: [
    { key: 'discharge_summary', required: true },
    { key: 'itemized_bill', required: true },
    { key: 'medical_receipt', required: true },
  ],
  DENTAL: [{ key: 'dental_receipt', required: true }],
};

function getInitialFormData() {
  return {
    claimType: '',
    memberInfo: {
      memberName: mockMember.name,
      policyNumber: mockMember.policyNumber,
      memberId: mockMember.memberId,
      dateOfBirth: mockMember.dateOfBirth,
      isForDependent: false,
      dependentId: '',
    },
    diagnosis: {
      diagnosisDescription: '',
      icd10: null,
      treatmentDate: '',
      admissionDate: '',
      dischargeDate: '',
      hospitalName: '',
      admissionReason: '',
    },
    documents: {},
  };
}

function validateStep(step, formData) {
  const errs = {};
  if (step === 1) {
    if (!formData.claimType) errs.claimType = 'Please select a claim type.';
  }
  if (step === 2) {
    const mi = formData.memberInfo;
    if (!mi.memberName?.trim()) errs.memberName = 'Member name is required.';
    if (!mi.policyNumber?.trim()) errs.policyNumber = 'Policy number is required.';
    if (!mi.memberId?.trim()) errs.memberId = 'Member ID is required.';
    if (!mi.dateOfBirth) errs.dateOfBirth = 'Date of birth is required.';
    if (mi.isForDependent && !mi.dependentId) errs.dependentId = 'Please select a dependent.';
  }
  if (step === 3) {
    const dx = formData.diagnosis;
    const isInpatient = formData.claimType === 'INPATIENT';
    if (!dx.diagnosisDescription?.trim())
      errs.diagnosisDescription = 'Diagnosis description is required.';
    if (!dx.icd10) errs.icd10 = 'Please select an ICD-10 code.';
    if (!dx.hospitalName?.trim()) errs.hospitalName = 'Hospital / provider name is required.';
    if (isInpatient) {
      if (!dx.admissionDate) errs.admissionDate = 'Admission date is required.';
      if (!dx.dischargeDate) errs.dischargeDate = 'Discharge date is required.';
      if (
        dx.admissionDate &&
        dx.dischargeDate &&
        new Date(dx.dischargeDate) < new Date(dx.admissionDate)
      )
        errs.dischargeDate = 'Discharge date must be on or after admission date.';
      if (!dx.admissionReason?.trim()) errs.admissionReason = 'Admission reason is required.';
    } else {
      if (!dx.treatmentDate) errs.treatmentDate = 'Treatment date is required.';
    }
  }
  if (step === 4) {
    const required = (DOCS_BY_TYPE[formData.claimType] || [])
      .filter((d) => d.required)
      .map((d) => d.key);
    const missing = required.filter((k) => !formData.documents[k]);
    if (missing.length > 0) errs.documents = 'Please upload all required documents.';
  }
  return errs;
}

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  function handleChange(patch) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function handleNext() {
    const errs = validateStep(step, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  function handleGoToStep(n) {
    setErrors({});
    setStep(n);
  }

  const stepProps = {
    formData,
    onChange: handleChange,
    onNext: handleNext,
    onBack: handleBack,
    errors,
  };

  return (
    <WizardShell currentStep={step}>
      {step === 1 && <Step1ClaimType {...stepProps} />}
      {step === 2 && <Step2MemberInfo {...stepProps} />}
      {step === 3 && <Step3Diagnosis {...stepProps} />}
      {step === 4 && <Step4Documents {...stepProps} />}
      {step === 5 && <Step5Review {...stepProps} onGoToStep={handleGoToStep} />}
    </WizardShell>
  );
}
