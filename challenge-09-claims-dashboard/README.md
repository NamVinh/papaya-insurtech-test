# Challenge 09 — Claims Analytics Dashboard

**Difficulty:** Intermediate · **Estimated time:** 3–5h · **Actual time:** ~3h

## Live demo

> Deployed URL will be added after Vercel deploy.

## How to run locally

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview production build locally

# Regenerate the dataset (optional — already included)
node scripts/generateData.cjs
```

## Spec compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Dataset** | | |
| 5,000 claims CSV with all 13 columns | ✅ | `public/claims.csv` + `src/data/claims.csv` |
| Realistic distributions | ✅ | OUTPATIENT 60%, APPROVED 64%, REJECTED 16% |
| 20 ICD-10 codes | ✅ | J00–K29 range, realistic spread |
| processed_date null for PENDING | ✅ | Generator logic |
| Skewed submitted_amount | ✅ | 55% in 500–5K, few up to 2M |
| **KPI Cards** | | |
| Total claims count | ✅ | Updates with all active filters |
| Approval rate (%) | ✅ | approved / total × 100 |
| Avg processing time (days) | ✅ | Avg of processed_date − submitted_date |
| Total approved amount | ✅ | Sum of approved_amount for APPROVED status |
| Average claim amount | ✅ | Avg submitted_amount |
| **Charts** | | |
| Claims by status (donut chart) | ✅ | Color-coded: green/red/amber/blue |
| Claims over time (line chart) | ✅ | Week / Month toggle button |
| Top 10 diagnoses by frequency (horiz bar) | ✅ | Clickable bars for drill-down |
| Top 10 diagnoses by total cost (horiz bar) | ✅ | Clickable bars for drill-down |
| Processing time histogram | ✅ | 10 buckets: 1–3, 4–6, … 28–30 days |
| Approval rate by insurer (grouped bar) | ✅ | Approved / Rejected / Pending % per insurer |
| **Interactivity** | | |
| Global filters: date range | ✅ | Date From / Date To inputs |
| Global filters: claim type, insurer, country, status | ✅ | Dropdown selects |
| All filters apply to all KPIs + charts simultaneously | ✅ | Single `useFilteredData` hook |
| Click diagnosis bar → claims table below | ✅ | Blue highlight on selected bar + drill-down panel |
| Click again to deselect / close button | ✅ | |
| Hover tooltip on all chart elements | ✅ | Recharts built-in Tooltip |
| **Data Table** | | |
| Sortable by any column | ✅ | Click header → ↑↓ toggle |
| Paginated (20 rows/page) | ✅ | First/Prev/Next/Last navigation |
| Responds to all active filters | ✅ | Receives filtered data |
| Export filtered data as CSV | ✅ | Blob download, respects current filters + sort |
| **General** | | |
| Dashboard loads < 3 seconds | ✅ | PapaParse client-side, no network request |
| Responsive layout (desktop + tablet) | ✅ | Tailwind grid breakpoints |

## Project structure

```
challenge-09-claims-dashboard/
├── public/
│   └── claims.csv                    ← 5,000-row dataset (served by Vite)
├── scripts/
│   └── generateData.cjs              ← dataset generator (Node.js)
├── src/
│   ├── App.jsx                       ← filter state, KPI calcs, drill-down logic
│   ├── components/
│   │   ├── FilterBar.jsx             ← 6 filter controls + Reset button
│   │   ├── KPICard.jsx               ← reusable KPI card
│   │   ├── ClaimsTable.jsx           ← sortable, paginated, exportable table
│   │   └── charts/
│   │       ├── ClaimsByStatus.jsx    ← donut chart
│   │       ├── ClaimsOverTime.jsx    ← line chart (week/month toggle)
│   │       ├── TopDiagnoses.jsx      ← 2 horizontal bar charts
│   │       ├── ProcessingTimeHistogram.jsx ← histogram
│   │       └── ApprovalByInsurer.jsx ← grouped bar chart
│   ├── hooks/
│   │   └── useFilteredData.js        ← memoised multi-filter logic
│   ├── data/
│   │   └── claims.csv                ← source copy (also in public/)
│   └── utils/
│       └── csvExport.js              ← Blob-based CSV download
```

## How to test each feature

### Filters
- Use **Date From / Date To** to narrow to a specific quarter (e.g. 2024-01-01 to 2024-03-31)
- Change **Claim Type** to INPATIENT → all KPIs and charts update immediately
- Change **Insurer** to "AIA Thailand" → approval rate by insurer chart highlights changes
- Click **Reset** → all filters cleared and all data restored

### KPI Cards
- With no filters: Total = 5,000, Approval Rate ~64%
- Filter to REJECTED status only: Approval Rate drops to 0%, Total Approved = 0

### Charts
- **Claims over time**: toggle Week / Month to change granularity
- **Top Diagnoses**: hover a bar → tooltip shows exact count/amount; click a bar → drill-down table appears below
- **Processing Time**: filter to IN_REVIEW only → histogram distribution shifts
- **Approval by Insurer**: shows grouped bars per insurer; apply country filter to compare

### Drill-down
1. Click any bar in the Top Diagnoses frequency or cost chart
2. A drill-down panel appears below showing only claims for that ICD-10 code
3. The panel includes row count, full table with sort + export
4. Click the same bar again, or click ✕, to close the drill-down

### Data Table
- Click any column header to sort ascending → click again for descending
- Navigate pages with «/‹/›/» buttons
- Click **↓ Export CSV** to download the current filtered + sorted dataset

### Responsive
- Resize to tablet width (~768px) → charts stack to 1-column grid
- KPI cards reflow to 2 columns on mobile, 3 on tablet, 5 on desktop
