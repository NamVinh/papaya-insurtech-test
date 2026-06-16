# Challenge 06 — Policy Benefits Calculator

**Difficulty:** Intermediate · **Estimated time:** 2–4h · **Actual time:** ~2.5h

## How to run

```bash
npm install
npm start          # processes 20 expenses and prints formatted results
npm test           # 46 unit tests
npm run test:coverage  # with coverage report
```

## What it does

Takes a policy JSON and a list of medical expenses, then returns the covered amount per expense with a clear explanation. Processes all expenses **chronologically** — earlier claims consume limits that affect later ones.

## Coverage rules implemented

| Rule | Handled |
|------|---------|
| Annual limit per benefit type | ✅ |
| Per-visit sub-limit (monetary cap per visit) | ✅ |
| Copay — percentage (e.g. 10%, 30%) | ✅ |
| Copay — fixed amount (e.g. 300 THB flat per visit) | ✅ |
| Annual deductible | ✅ |
| Waiting period (days since policy start) | ✅ |
| Annual visit count limit | ✅ |
| Exclusion list (diagnosis keyword match) | ✅ |
| Partial coverage when remaining limit < eligible amount | ✅ |
| Chronological limit consumption across all expenses | ✅ |

## Output per expense

```json
{
  "expense_id": "EXP-006",
  "submitted_amount": 1500,
  "covered_amount": 1200,
  "copay_amount": 300,
  "deductible_applied": 0,
  "member_pays": 300,
  "decision": "PARTIALLY_COVERED",
  "reason": "Fixed copay: member pays 300 THB per visit.",
  "remaining_annual_limit": 3800,
  "remaining_visit_limit": 19
}
```

## Project structure

```
challenge-06-benefits-calculator/
├── src/
│   ├── calculator.js        ← reusable module (pure functions, no side effects)
│   └── index.js             ← demo runner with formatted console output
├── data/
│   ├── policy.json          ← policy definition (4 benefit types)
│   ├── expenses.json        ← 20 test expenses covering all 6 scenarios
│   └── expected_outputs.json ← pre-generated results for verification
└── tests/
    └── calculator.test.js   ← 46 unit tests (Jest)
```

## Policy definition

| Benefit | Annual Limit | Per-Visit | Visits/Year | Copay | Deductible | Waiting |
|---------|-------------|-----------|-------------|-------|------------|---------|
| OUTPATIENT | 10,000 THB | 3,000 | 30 | 0% | 0 | 0 days |
| SPECIALIST | 5,000 THB | 2,000 | 20 | **300 THB fixed** | 0 | 0 days |
| INPATIENT | 100,000 THB | — | unlimited | 10% | 2,000 | 30 days |
| DENTAL | 2,000 THB | 3,000 | 10 | 30% | 0 | 60 days |

> SPECIALIST uses **fixed copay** (300 THB flat per visit) to demonstrate both copay types.

## 20 test expenses — scenario coverage

| Scenario | Count | Expense IDs |
|----------|-------|-------------|
| ✅ COVERED — full | 5 | EXP-001, 002, 003, 004, 005 |
| ⚠️ PARTIALLY_COVERED — copay | 4 | EXP-006, 007, 008, 009 |
| ❌ DENIED — waiting period | 3 | EXP-010, 011, 012 |
| ❌ DENIED — exclusion | 2 | EXP-013, 014 |
| ⚠️ PARTIALLY_COVERED — remaining limit | 3 | EXP-015, 017, 019 |
| ❌ DENIED — annual limit exhausted | 3 | EXP-016, 018, 020 |

## Test results

```
Tests: 46 passed, 46 total
```

Test suites cover:
- `daysBetween` utility
- Normal coverage (full)
- Copay percentage
- Copay fixed amount (+ fixed takes priority over percentage)
- Per-visit limit
- Deductible (first expense vs. subsequent — already paid)
- Waiting period (denial + exact boundary day)
- Exclusion denial
- Annual limit exhaustion
- Partial coverage — remaining limit < eligible
- Chronological ordering
- Annual visit limit (denial + countdown + waiting-period-denied does not consume visit)
- Edge cases: unknown benefit type, invalid inputs
- Full 20-expense dataset integrity checks
