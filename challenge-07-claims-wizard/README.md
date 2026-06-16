# Challenge 07 — Claims Intake Wizard

**Difficulty:** Intermediate · **Estimated time:** 3–5h · **Actual time:** ~3h

## Live demo

**https://challenge-07-claims-wizard.vercel.app**

## How to run locally

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

## Spec compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Step 1 — Claim Type** | | |
| Outpatient / Inpatient / Dental options | ✅ | Card-style radio buttons |
| Selection drives fields & docs in later steps | ✅ | Conditional logic in Steps 3 & 4 |
| **Step 2 — Member Info** | | |
| Pre-filled from mock data (editable) | ✅ | name, policy number, member ID, DOB |
| Dependent selector | ✅ | Checkbox toggle → dropdown of 3 dependents |
| **Step 3 — Diagnosis & Treatment** | | |
| Diagnosis description (free text) | ✅ | Textarea, required |
| ICD-10 autocomplete (≥100 codes) | ✅ | 105 codes, debounced 150ms, keyboard nav |
| Single date (outpatient/dental) | ✅ | |
| Date range (inpatient) | ✅ | Admission + Discharge |
| Length of stay auto-calculated | ✅ | Live-updates as dates change |
| Provider/hospital name with suggestions | ✅ | 20 mock hospitals, dropdown on type |
| Admission reason (inpatient only) | ✅ | |
| **Step 4 — Document Upload** | | |
| Outpatient: medical receipt (req), prescription (opt) | ✅ | |
| Inpatient: discharge summary + itemized bill + medical receipt (all req) | ✅ | |
| Dental: dental receipt (req), treatment plan (opt, note for major dental) | ✅ | |
| File type validation — PDF/JPG/PNG only | ✅ | Checked on select & drag-drop |
| Max 10 MB per file | ✅ | |
| Upload progress indicator | ✅ | Simulated animated progress bar |
| Block Next if required docs missing | ✅ | Shows list of missing docs |
| **Step 5 — Review & Submit** | | |
| Full summary of all steps | ✅ | Grouped by section |
| Edit link per section → navigate without data loss | ✅ | |
| Confirmation checkbox | ✅ | Submit disabled until checked |
| Mock submit — console log + success screen | ✅ | Shows reference ID |
| **General** | | |
| Form state persists across back/forward | ✅ | Single `formData` state in App |
| Responsive layout (desktop + mobile) | ✅ | Tailwind sm: breakpoints |
| Keyboard accessible (tab + Enter) | ✅ | Native HTML buttons, ICD-10 arrow/Enter nav |

## Project structure

```
challenge-07-claims-wizard/
├── src/
│   ├── App.jsx                          ← global state + validation + step routing
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardShell.jsx          ← progress bar (5 steps)
│   │   │   ├── Step1ClaimType.jsx       ← claim type selection
│   │   │   ├── Step2MemberInfo.jsx      ← member info + dependent selector
│   │   │   ├── Step3Diagnosis.jsx       ← diagnosis + ICD-10 + dates + hospital
│   │   │   ├── Step4Documents.jsx       ← document upload (conditional per type)
│   │   │   └── Step5Review.jsx          ← full review + confirm + submit
│   │   └── ui/
│   │       ├── ICD10Search.jsx          ← autocomplete combobox (debounce 150ms)
│   │       └── FileUpload.jsx           ← drag-drop upload + progress indicator
│   └── data/
│       ├── icd10Codes.js                ← 105 ICD-10 codes
│       ├── mockMember.js                ← member + 3 dependents
│       └── mockHospitals.js             ← 20 hospital suggestions
```

## How to test each feature

### Step 1 — Claim type
- Click **Next** without selecting anything → validation error appears
- Select each type and confirm the card highlights correctly

### Step 2 — Member info
- All fields pre-filled; clear "Member Name" → error on Next
- Tick "This claim is for a dependent" → dropdown appears; try submitting without selecting → error

### Step 3 — Diagnosis (test all 3 paths)

**Outpatient / Dental path:**
- Single "Treatment Date" field shown
- ICD-10: type `flu` → see Influenza result; type `J0` → multiple J0x codes; press ↑/↓ to navigate, Enter to select
- Hospital: type `bang` → Bangkok Hospital suggestions appear
- Click Next with empty fields → inline errors on each field

**Inpatient path:** (go back to Step 1, change to Inpatient)
- "Admission Date" + "Discharge Date" appear instead of single date
- Enter admission `2024-01-10` and discharge `2024-01-15` → **Length of stay: 5 days** shown live
- Enter discharge before admission → validation error "must be on or after admission date"
- "Admission Reason" textarea appears (inpatient only)

### Step 4 — Document upload

**Outpatient:** Medical Receipt (required) + Prescription (optional)
- Click Next with no uploads → "Missing required documents: Medical Receipt"
- Try uploading a `.txt` file → "Only PDF, JPG, or PNG files are allowed."
- Try uploading a file > 10 MB → "File exceeds 10 MB limit."
- Upload a valid PDF/JPG/PNG → progress bar animates → file shown in green with name + size
- Click ✕ on uploaded file → reverts to upload zone

**Inpatient:** 3 required docs; upload only 2 → error lists the missing one

**Dental:** Dental Receipt required; Treatment Plan shows optional note about major dental

### Step 5 — Review & Submit
- All data from Steps 1–4 displayed in labelled sections
- Click **Edit** next to any section → navigates to that step with all data intact
- Change a value, return to Step 5 → review reflects the updated data
- Submit button is **disabled** until confirmation checkbox is ticked
- Tick checkbox → Submit button turns green and becomes clickable
- Click Submit → success screen with reference ID; open browser DevTools console to see full JSON payload

### Responsive design
- Resize browser to mobile width (< 640px) — layout switches to single column
- Progress bar labels hide on mobile (shows step numbers only)

### Keyboard navigation
- Tab through all fields and buttons in order
- On Next / Back buttons: press Enter to activate
- In ICD-10 search: type to open dropdown → ↑/↓ to move through results → Enter to select → Escape to close
