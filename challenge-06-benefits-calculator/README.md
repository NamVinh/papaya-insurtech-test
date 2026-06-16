# Challenge 06 — Policy Benefits Calculator

**Difficulty:** Intermediate · **Estimated time:** 2–4h · **Actual time:** ~2.5h

## What it does

Takes a policy JSON and a list of medical expenses, then returns the covered amount per expense with a clear explanation. Processes expenses **chronologically** — earlier claims consume limits that affect later ones.

## Coverage rules implemented

| Rule | Handled |
|------|---------|
| Annual limit per benefit type | ✅ |
| Per-visit sub-limit | ✅ |
| Copay percentage | ✅ |
| Annual deductible | ✅ |
| Waiting period | ✅ |
| Exclusion list (diagnosis match) | ✅ |
| Partial coverage when remaining < eligible | ✅ |

## Run

```bash
npm install
npm start        # demo: processes 20 expenses and prints results
npm test         # 37 unit tests
```

## Project structure

```
├── src/
│   ├── calculator.js   ← reusable module (pure function, no side effects)
│   └── index.js        ← demo runner with formatted output
├── data/
│   ├── policy.json     ← policy definition (4 benefit types)
│   └── expenses.json   ← 20 test expenses covering all scenarios
└── tests/
    └── calculator.test.js  ← 37 unit tests (Jest)
```

## Policy used

| Benefit | Annual Limit | Per-Visit | Copay | Deductible | Waiting |
|---------|-------------|-----------|-------|------------|---------|
| OUTPATIENT | 10,000 THB | 3,000 | 0% | 0 | 0 days |
| SPECIALIST | 5,000 THB | 2,000 | 20% | 0 | 0 days |
| INPATIENT | 100,000 THB | — | 10% | 2,000 | 30 days |
| DENTAL | 2,000 THB | 3,000 | 30% | 0 | 60 days |

## 20 test expenses — scenario coverage

| Scenario | Count | Expense IDs |
|----------|-------|-------------|
| ✅ COVERED (full) | 5 | EXP-001..005 |
| ⚠️ PARTIALLY_COVERED (copay) | 4 | EXP-006, 007, 008, 009 |
| ❌ DENIED — waiting period | 3 | EXP-010, 011, 012 |
| ❌ DENIED — exclusion | 2 | EXP-013, 014 |
| ⚠️ PARTIALLY_COVERED — remaining limit | 3 | EXP-015, 017, 019 |
| ❌ DENIED — annual limit exhausted | 3 | EXP-016, 018, 020 |

## Test results

```
Tests: 37 passed, 37 total
```

Covers: normal coverage, copay %, per-visit limit, deductible (first vs. subsequent expense),
waiting period boundary, exclusion match, limit exhaustion, remaining-limit partial coverage,
chronological ordering, unknown benefit type, invalid inputs.
