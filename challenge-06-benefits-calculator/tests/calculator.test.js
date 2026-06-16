'use strict';

const { calculateCoverage, processExpense, daysBetween, initState } = require('../src/calculator');

// ── Shared test policy ────────────────────────────────────────────────────
const basePolicy = {
  policy_id: 'POL-TEST',
  member_name: 'Test Member',
  policy_start_date: '2024-01-01',
  currency: 'THB',
  benefits: {
    OUTPATIENT: {
      annual_limit: 10000,
      per_visit_limit: 3000,
      visits_per_year: 30,
      copay_percentage: 0,
      copay_fixed: 0,
      deductible: 0,
      waiting_period_days: 0,
      exclusions: ['cosmetic treatment'],
    },
    SPECIALIST: {
      annual_limit: 5000,
      per_visit_limit: 2000,
      visits_per_year: 20,
      copay_percentage: 20,
      copay_fixed: 0,
      deductible: 0,
      waiting_period_days: 0,
      exclusions: ['hair loss treatment'],
    },
    INPATIENT: {
      annual_limit: 100000,
      per_visit_limit: null,
      visits_per_year: null,
      copay_percentage: 10,
      copay_fixed: 0,
      deductible: 2000,
      waiting_period_days: 30,
      exclusions: ['elective cosmetic surgery'],
    },
    DENTAL: {
      annual_limit: 2000,
      per_visit_limit: 3000,
      visits_per_year: 10,
      copay_percentage: 30,
      copay_fixed: 0,
      deductible: 0,
      waiting_period_days: 60,
      exclusions: ['teeth whitening'],
    },
  },
};

function makeExpense(overrides = {}) {
  return {
    expense_id: 'EXP-T01',
    date: '2024-06-01',
    benefit_type: 'OUTPATIENT',
    sub_benefit: 'GP Visit',
    amount: 500,
    diagnosis: 'General illness',
    provider: 'Test Hospital',
    ...overrides,
  };
}

// ── Helper to get a fresh state ───────────────────────────────────────────
function freshState() {
  return initState(basePolicy);
}

// ══════════════════════════════════════════════════════════════════════════
// 1. daysBetween utility
// ══════════════════════════════════════════════════════════════════════════
describe('daysBetween', () => {
  test('same day returns 0', () => {
    expect(daysBetween('2024-01-01', '2024-01-01')).toBe(0);
  });

  test('one day apart returns 1', () => {
    expect(daysBetween('2024-01-01', '2024-01-02')).toBe(1);
  });

  test('30 days apart', () => {
    expect(daysBetween('2024-01-01', '2024-01-31')).toBe(30);
  });

  test('60 days apart (across month boundary)', () => {
    expect(daysBetween('2024-01-01', '2024-03-01')).toBe(60);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 2. Normal coverage (COVERED 100%)
// ══════════════════════════════════════════════════════════════════════════
describe('Normal coverage', () => {
  test('expense within limits is COVERED in full', () => {
    const state = freshState();
    const result = processExpense(makeExpense({ amount: 800 }), basePolicy, state);
    expect(result.decision).toBe('COVERED');
    expect(result.covered_amount).toBe(800);
    expect(result.member_pays).toBe(0);
  });

  test('expense at exactly per-visit limit is COVERED', () => {
    const state = freshState();
    const result = processExpense(makeExpense({ amount: 3000 }), basePolicy, state);
    expect(result.decision).toBe('COVERED');
    expect(result.covered_amount).toBe(3000);
  });

  test('remaining annual limit decreases after covered expense', () => {
    const state = freshState();
    processExpense(makeExpense({ amount: 1000 }), basePolicy, state);
    expect(state.remaining_annual['OUTPATIENT']).toBe(9000);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 3. Copay — percentage
// ══════════════════════════════════════════════════════════════════════════
describe('Copay — percentage', () => {
  test('20% copay on SPECIALIST: covered = 80% of eligible', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'SPECIALIST', amount: 1500, diagnosis: 'Cardiology' }),
      basePolicy,
      state,
    );
    expect(result.decision).toBe('PARTIALLY_COVERED');
    expect(result.covered_amount).toBe(1200);
    expect(result.copay_amount).toBe(300);
    expect(result.member_pays).toBe(300);
  });

  test('30% copay on DENTAL after waiting period', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'DENTAL', amount: 1000, date: '2024-03-05', diagnosis: 'Tooth extraction' }),
      basePolicy,
      state,
    );
    expect(result.decision).toBe('PARTIALLY_COVERED');
    expect(result.copay_amount).toBe(300);
    expect(result.covered_amount).toBe(700);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 4. Per-visit limit
// ══════════════════════════════════════════════════════════════════════════
describe('Per-visit limit', () => {
  test('SPECIALIST: amount above per-visit limit — eligible capped at 2000', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'SPECIALIST', amount: 2500, diagnosis: 'Dermatology' }),
      basePolicy,
      state,
    );
    // eligible = 2000, covered = 2000 * 80% = 1600
    expect(result.covered_amount).toBe(1600);
    expect(result.member_pays).toBe(900); // 500 over-limit + 400 copay
  });

  test('OUTPATIENT: amount above per-visit limit — over-limit portion not covered', () => {
    const state = freshState();
    const result = processExpense(makeExpense({ amount: 4000 }), basePolicy, state);
    expect(result.covered_amount).toBe(3000); // capped at per_visit_limit
    expect(result.member_pays).toBe(1000);
    expect(result.decision).toBe('PARTIALLY_COVERED');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 5. Deductible
// ══════════════════════════════════════════════════════════════════════════
describe('Deductible', () => {
  test('INPATIENT: deductible applied to first expense', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'INPATIENT', amount: 20000, date: '2024-06-15', diagnosis: 'Appendicitis' }),
      basePolicy,
      state,
    );
    // eligible = 20000, deductible = 2000, after = 18000, copay 10% = 1800, covered = 16200
    expect(result.deductible_applied).toBe(2000);
    expect(result.covered_amount).toBe(16200);
    expect(result.copay_amount).toBe(1800);
    expect(state.deductible_paid['INPATIENT']).toBe(2000);
  });

  test('INPATIENT: second expense has no deductible (already paid)', () => {
    const state = freshState();
    // First expense pays off deductible
    processExpense(
      makeExpense({ benefit_type: 'INPATIENT', amount: 5000, date: '2024-06-15', diagnosis: 'Surgery' }),
      basePolicy,
      state,
    );
    // Second expense — deductible already 0
    const result = processExpense(
      makeExpense({ benefit_type: 'INPATIENT', amount: 10000, date: '2024-07-01', diagnosis: 'Follow-up' }),
      basePolicy,
      state,
    );
    expect(result.deductible_applied).toBe(0);
    expect(result.covered_amount).toBe(9000); // 10000 * 90%
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 6. Waiting period denial
// ══════════════════════════════════════════════════════════════════════════
describe('Waiting period denial', () => {
  test('INPATIENT claim before 30-day waiting period is DENIED', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'INPATIENT', date: '2024-01-10', amount: 30000, diagnosis: 'Surgery' }),
      basePolicy,
      state,
    );
    expect(result.decision).toBe('DENIED');
    expect(result.covered_amount).toBe(0);
    expect(result.reason).toMatch(/waiting period/i);
  });

  test('DENTAL claim before 60-day waiting period is DENIED', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'DENTAL', date: '2024-02-20', amount: 3000, diagnosis: 'Root canal' }),
      basePolicy,
      state,
    );
    expect(result.decision).toBe('DENIED');
    expect(result.reason).toMatch(/waiting period/i);
  });

  test('claim exactly on waiting period boundary day is allowed', () => {
    const state = freshState();
    // DENTAL waiting = 60 days; day 60 from Jan 1 = March 1
    const result = processExpense(
      makeExpense({ benefit_type: 'DENTAL', date: '2024-03-01', amount: 500, diagnosis: 'Cleaning' }),
      basePolicy,
      state,
    );
    // Should NOT be denied for waiting period (might still have copay)
    expect(result.decision).not.toBe('DENIED');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 7. Exclusion denial
// ══════════════════════════════════════════════════════════════════════════
describe('Exclusion denial', () => {
  test('OUTPATIENT: excluded diagnosis is DENIED', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ amount: 5000, diagnosis: 'Cosmetic treatment' }),
      basePolicy,
      state,
    );
    expect(result.decision).toBe('DENIED');
    expect(result.reason).toMatch(/excluded/i);
    expect(result.covered_amount).toBe(0);
  });

  test('SPECIALIST: excluded diagnosis is DENIED and annual limit unchanged', () => {
    const state = freshState();
    const before = state.remaining_annual['SPECIALIST'];
    processExpense(
      makeExpense({ benefit_type: 'SPECIALIST', amount: 1500, diagnosis: 'Hair loss treatment' }),
      basePolicy,
      state,
    );
    expect(state.remaining_annual['SPECIALIST']).toBe(before);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 8. Annual limit exhaustion
// ══════════════════════════════════════════════════════════════════════════
describe('Annual limit exhaustion', () => {
  test('expense denied when annual limit is fully used', () => {
    const state = freshState();
    state.remaining_annual['OUTPATIENT'] = 0; // simulate exhausted

    const result = processExpense(makeExpense({ amount: 500 }), basePolicy, state);
    expect(result.decision).toBe('DENIED');
    expect(result.reason).toMatch(/exhausted/i);
  });

  test('multiple expenses correctly deplete the annual limit', () => {
    const state = freshState();
    // 5 × 1000 THB = 5000 THB used, 5000 remaining
    for (let i = 1; i <= 5; i++) {
      processExpense(makeExpense({ expense_id: `EXP-T${i}`, amount: 1000 }), basePolicy, state);
    }
    expect(state.remaining_annual['OUTPATIENT']).toBe(5000);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 9. Partially covered — remaining limit < eligible covered amount
// ══════════════════════════════════════════════════════════════════════════
describe('Partially covered — remaining limit less than covered amount', () => {
  test('covered amount capped by remaining annual limit', () => {
    const state = freshState();
    state.remaining_annual['OUTPATIENT'] = 800; // only 800 left

    const result = processExpense(makeExpense({ amount: 1500 }), basePolicy, state);
    expect(result.decision).toBe('PARTIALLY_COVERED');
    expect(result.covered_amount).toBe(800); // capped by remaining
    expect(result.member_pays).toBe(700); // 1500 - 800
    expect(state.remaining_annual['OUTPATIENT']).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 10. Chronological ordering & shared limit consumption
// ══════════════════════════════════════════════════════════════════════════
describe('Chronological processing', () => {
  test('expenses processed in date order regardless of input order', () => {
    const policy = {
      ...basePolicy,
      benefits: {
        OUTPATIENT: { ...basePolicy.benefits.OUTPATIENT, annual_limit: 1500 },
      },
    };

    const expenses = [
      makeExpense({ expense_id: 'LATE', date: '2024-06-15', amount: 1000 }),
      makeExpense({ expense_id: 'EARLY', date: '2024-03-01', amount: 1000 }),
    ];

    const { results } = calculateCoverage(policy, expenses);
    // EARLY processed first → uses 1000 → remaining 500
    // LATE processed second → only 500 remaining → PARTIALLY_COVERED
    const early = results.find((r) => r.expense_id === 'EARLY');
    const late = results.find((r) => r.expense_id === 'LATE');

    expect(early.decision).toBe('COVERED');
    expect(late.decision).toBe('PARTIALLY_COVERED');
    expect(late.covered_amount).toBe(500);
  });

  test('earlier expense affects remaining limit for later expense', () => {
    const state = freshState();
    // Drain 9000 THB using 3 expenses at per-visit limit (3000 each)
    processExpense(makeExpense({ expense_id: 'E1', amount: 3000 }), basePolicy, state); // remaining: 7000
    processExpense(makeExpense({ expense_id: 'E2', amount: 3000 }), basePolicy, state); // remaining: 4000
    processExpense(makeExpense({ expense_id: 'E3', amount: 3000 }), basePolicy, state); // remaining: 1000
    expect(state.remaining_annual['OUTPATIENT']).toBe(1000);

    // 4th expense: eligible 2000 but only 1000 remaining → PARTIALLY_COVERED
    const result = processExpense(
      makeExpense({ expense_id: 'E4', amount: 2000, date: '2024-02-01' }),
      basePolicy,
      state,
    );
    expect(result.covered_amount).toBe(1000);
    expect(result.decision).toBe('PARTIALLY_COVERED');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 11. Unknown benefit type
// ══════════════════════════════════════════════════════════════════════════
describe('Edge cases', () => {
  test('unknown benefit type is DENIED gracefully', () => {
    const state = freshState();
    const result = processExpense(
      makeExpense({ benefit_type: 'VISION', amount: 500 }),
      basePolicy,
      state,
    );
    expect(result.decision).toBe('DENIED');
    expect(result.reason).toMatch(/not covered/i);
  });

  test('calculateCoverage throws on invalid policy', () => {
    expect(() => calculateCoverage(null, [])).toThrow();
  });

  test('calculateCoverage throws on non-array expenses', () => {
    expect(() => calculateCoverage(basePolicy, null)).toThrow();
  });

  test('summary reflects correct used/remaining after full run', () => {
    const expenses = [
      makeExpense({ expense_id: 'S1', amount: 1000 }),
      makeExpense({ expense_id: 'S2', amount: 2000 }),
    ];
    const { summary } = calculateCoverage(basePolicy, expenses);
    const outpatient = summary.find((s) => s.benefit_type === 'OUTPATIENT');
    expect(outpatient.used).toBe(3000);
    expect(outpatient.remaining).toBe(7000);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 12. Full run against the 20-expense dataset
// ══════════════════════════════════════════════════════════════════════════
describe('Full 20-expense dataset', () => {
  const policy = require('../data/policy.json');
  const expenses = require('../data/expenses.json');
  let results, summary;

  beforeAll(() => {
    ({ results, summary } = calculateCoverage(policy, expenses));
  });

  test('processes all 20 expenses', () => {
    expect(results).toHaveLength(20);
  });

  test('contains at least 5 COVERED decisions', () => {
    const covered = results.filter((r) => r.decision === 'COVERED');
    expect(covered.length).toBeGreaterThanOrEqual(5);
  });

  test('contains at least 3 DENIED decisions (waiting period)', () => {
    const denied = results.filter((r) => r.decision === 'DENIED' && r.reason.match(/waiting period/i));
    expect(denied.length).toBeGreaterThanOrEqual(3);
  });

  test('contains at least 2 DENIED decisions (exclusion)', () => {
    const denied = results.filter((r) => r.decision === 'DENIED' && r.reason.match(/excluded/i));
    expect(denied.length).toBeGreaterThanOrEqual(2);
  });

  test('contains at least 3 DENIED decisions (limit exhausted)', () => {
    const denied = results.filter((r) => r.decision === 'DENIED' && r.reason.match(/exhausted/i));
    expect(denied.length).toBeGreaterThanOrEqual(3);
  });

  test('contains PARTIALLY_COVERED decisions', () => {
    const partial = results.filter((r) => r.decision === 'PARTIALLY_COVERED');
    expect(partial.length).toBeGreaterThan(0);
  });

  test('every result has required output fields including remaining_visit_limit', () => {
    results.forEach((r) => {
      expect(r).toHaveProperty('expense_id');
      expect(r).toHaveProperty('submitted_amount');
      expect(r).toHaveProperty('covered_amount');
      expect(r).toHaveProperty('member_pays');
      expect(r).toHaveProperty('decision');
      expect(r).toHaveProperty('reason');
      expect(r).toHaveProperty('remaining_annual_limit');
      expect(r).toHaveProperty('remaining_visit_limit');
      expect(typeof r.reason).toBe('string');
      expect(r.reason.length).toBeGreaterThan(0);
    });
  });

  test('member_pays = submitted - covered for every result', () => {
    results.forEach((r) => {
      expect(r.member_pays).toBe(r.submitted_amount - r.covered_amount);
    });
  });

  test('OUTPATIENT annual limit not exceeded', () => {
    const outpatient = summary.find((s) => s.benefit_type === 'OUTPATIENT');
    expect(outpatient.used).toBeLessThanOrEqual(outpatient.annual_limit);
  });

  test('SPECIALIST annual limit not exceeded', () => {
    const specialist = summary.find((s) => s.benefit_type === 'SPECIALIST');
    expect(specialist.used).toBeLessThanOrEqual(specialist.annual_limit);
  });

  test('remaining_visit_limit decreases with each covered visit', () => {
    const outpatientResults = results.filter(
      (r) => r.expense_id.startsWith('EXP-0') &&
              ['EXP-001','EXP-002','EXP-003'].includes(r.expense_id)
    );
    // Each consecutive OUTPATIENT visit should have a lower remaining_visit_limit
    const limits = outpatientResults.map((r) => r.remaining_visit_limit);
    expect(limits[0]).toBeGreaterThan(limits[1]);
    expect(limits[1]).toBeGreaterThan(limits[2]);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 13. Fixed copay
// ══════════════════════════════════════════════════════════════════════════
describe('Fixed copay', () => {
  const fixedCopayPolicy = {
    ...basePolicy,
    benefits: {
      ...basePolicy.benefits,
      OUTPATIENT: {
        ...basePolicy.benefits.OUTPATIENT,
        copay_fixed: 200,
        copay_percentage: 0,
      },
    },
  };

  test('fixed copay deducted from covered amount', () => {
    const state = initState(fixedCopayPolicy);
    const result = processExpense(
      makeExpense({ amount: 1000 }),
      fixedCopayPolicy,
      state,
    );
    expect(result.copay_amount).toBe(200);
    expect(result.covered_amount).toBe(800);
    expect(result.member_pays).toBe(200);
    expect(result.decision).toBe('PARTIALLY_COVERED');
    expect(result.reason).toMatch(/fixed copay/i);
  });

  test('fixed copay applied regardless of expense amount', () => {
    const state = initState(fixedCopayPolicy);
    const small = processExpense(makeExpense({ amount: 500 }), fixedCopayPolicy, state);
    const large = processExpense(makeExpense({ amount: 2000 }), fixedCopayPolicy, state);
    // Same flat copay for both
    expect(small.copay_amount).toBe(200);
    expect(large.copay_amount).toBe(200);
  });

  test('fixed copay cannot exceed eligible amount', () => {
    const state = initState(fixedCopayPolicy);
    const result = processExpense(
      makeExpense({ amount: 150 }), // less than fixed copay of 200
      fixedCopayPolicy,
      state,
    );
    // copay capped at eligible (150)
    expect(result.copay_amount).toBe(150);
    expect(result.covered_amount).toBe(0);
    expect(result.decision).toBe('DENIED');
  });

  test('fixed copay takes priority over percentage copay', () => {
    const bothPolicy = {
      ...basePolicy,
      benefits: {
        ...basePolicy.benefits,
        OUTPATIENT: {
          ...basePolicy.benefits.OUTPATIENT,
          copay_fixed: 300,
          copay_percentage: 20, // should be ignored when fixed > 0
        },
      },
    };
    const state = initState(bothPolicy);
    const result = processExpense(makeExpense({ amount: 1000 }), bothPolicy, state);
    expect(result.copay_amount).toBe(300); // fixed, not 200 (20%)
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 14. Visit limit
// ══════════════════════════════════════════════════════════════════════════
describe('Visit limit', () => {
  test('expense denied when annual visit limit is reached', () => {
    const limitedPolicy = {
      ...basePolicy,
      benefits: {
        ...basePolicy.benefits,
        OUTPATIENT: { ...basePolicy.benefits.OUTPATIENT, visits_per_year: 2 },
      },
    };
    const state = initState(limitedPolicy);
    processExpense(makeExpense({ expense_id: 'V1', amount: 500 }), limitedPolicy, state); // visit 1
    processExpense(makeExpense({ expense_id: 'V2', amount: 500 }), limitedPolicy, state); // visit 2
    const result = processExpense(makeExpense({ expense_id: 'V3', amount: 500 }), limitedPolicy, state); // over limit
    expect(result.decision).toBe('DENIED');
    expect(result.reason).toMatch(/visit limit/i);
    expect(result.remaining_visit_limit).toBe(0);
  });

  test('remaining_visit_limit counts down with each visit', () => {
    const state = initState(basePolicy); // OUTPATIENT visits_per_year: 30
    const r1 = processExpense(makeExpense({ expense_id: 'V1', amount: 500 }), basePolicy, state);
    const r2 = processExpense(makeExpense({ expense_id: 'V2', amount: 500 }), basePolicy, state);
    expect(r1.remaining_visit_limit).toBe(29);
    expect(r2.remaining_visit_limit).toBe(28);
  });

  test('waiting-period-denied expense does not consume a visit', () => {
    const state = initState(basePolicy); // DENTAL visits_per_year: 10
    // DENTAL waiting = 60 days; Jan 5 = day 4 → denied
    processExpense(
      makeExpense({ benefit_type: 'DENTAL', date: '2024-01-05', amount: 500, diagnosis: 'Cleaning' }),
      basePolicy,
      state,
    );
    expect(state.visits_used['DENTAL']).toBe(0); // visit NOT counted
  });

  test('remaining_visit_limit is null for benefit with no visit limit', () => {
    const state = initState(basePolicy); // INPATIENT visits_per_year: null
    const result = processExpense(
      makeExpense({ benefit_type: 'INPATIENT', date: '2024-06-01', amount: 10000, diagnosis: 'Surgery' }),
      basePolicy,
      state,
    );
    expect(result.remaining_visit_limit).toBeNull();
  });
});
