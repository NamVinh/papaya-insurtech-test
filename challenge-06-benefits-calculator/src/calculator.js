'use strict';

/**
 * Calculates the number of days between two ISO date strings.
 */
function daysBetween(startDate, expenseDate) {
  const start = new Date(startDate);
  const expense = new Date(expenseDate);
  return Math.floor((expense - start) / (1000 * 60 * 60 * 24));
}

/**
 * Initialises mutable state: remaining annual limits, deductible paid, visits used.
 */
function initState(policy) {
  const state = {
    remaining_annual: {},
    deductible_paid: {},
    visits_used: {},
  };
  for (const [type, benefit] of Object.entries(policy.benefits)) {
    state.remaining_annual[type] = benefit.annual_limit;
    state.deductible_paid[type] = 0;
    state.visits_used[type] = 0;
  }
  return state;
}

/**
 * Processes a single expense against the policy and current state.
 * State is mutated in place to reflect consumed limits.
 */
function processExpense(expense, policy, state) {
  const { expense_id, date, benefit_type, amount, diagnosis } = expense;
  const benefit = policy.benefits[benefit_type];

  // Unknown benefit type
  if (!benefit) {
    return {
      expense_id,
      submitted_amount: amount,
      covered_amount: 0,
      copay_amount: 0,
      deductible_applied: 0,
      member_pays: amount,
      decision: 'DENIED',
      reason: `Benefit type "${benefit_type}" is not covered under this policy.`,
      remaining_annual_limit: null,
      remaining_visit_limit: null,
    };
  }

  const visitsPerYear = benefit.visits_per_year ?? null;

  // ── 1. Waiting period ────────────────────────────────────────────────────
  const daysElapsed = daysBetween(policy.policy_start_date, date);
  if (daysElapsed < benefit.waiting_period_days) {
    return {
      expense_id,
      submitted_amount: amount,
      covered_amount: 0,
      copay_amount: 0,
      deductible_applied: 0,
      member_pays: amount,
      decision: 'DENIED',
      reason: `Waiting period not met. ${daysElapsed} day(s) since policy start; ${benefit.waiting_period_days} required for ${benefit_type}.`,
      remaining_annual_limit: state.remaining_annual[benefit_type],
      remaining_visit_limit: visitsPerYear !== null ? visitsPerYear - state.visits_used[benefit_type] : null,
    };
  }

  // ── 2. Visit limit ───────────────────────────────────────────────────────
  // Count visit after passing waiting period (the visit physically happened)
  if (visitsPerYear !== null) {
    if (state.visits_used[benefit_type] >= visitsPerYear) {
      return {
        expense_id,
        submitted_amount: amount,
        covered_amount: 0,
        copay_amount: 0,
        deductible_applied: 0,
        member_pays: amount,
        decision: 'DENIED',
        reason: `Annual visit limit for ${benefit_type} (${visitsPerYear} visits/year) has been reached.`,
        remaining_annual_limit: state.remaining_annual[benefit_type],
        remaining_visit_limit: 0,
      };
    }
    state.visits_used[benefit_type]++;
  }

  // ── 3. Exclusion check ───────────────────────────────────────────────────
  const diagLower = diagnosis.toLowerCase();
  const matched = benefit.exclusions.find((ex) => diagLower.includes(ex.toLowerCase()));
  if (matched) {
    return {
      expense_id,
      submitted_amount: amount,
      covered_amount: 0,
      copay_amount: 0,
      deductible_applied: 0,
      member_pays: amount,
      decision: 'DENIED',
      reason: `Diagnosis "${diagnosis}" is excluded under the ${benefit_type} benefit (matched exclusion: "${matched}").`,
      remaining_annual_limit: state.remaining_annual[benefit_type],
      remaining_visit_limit: visitsPerYear !== null ? visitsPerYear - state.visits_used[benefit_type] : null,
    };
  }

  // ── 4. Annual limit already fully exhausted ──────────────────────────────
  if (state.remaining_annual[benefit_type] <= 0) {
    return {
      expense_id,
      submitted_amount: amount,
      covered_amount: 0,
      copay_amount: 0,
      deductible_applied: 0,
      member_pays: amount,
      decision: 'DENIED',
      reason: `Annual limit for ${benefit_type} (${benefit.annual_limit} THB) has been fully exhausted.`,
      remaining_annual_limit: 0,
      remaining_visit_limit: visitsPerYear !== null ? visitsPerYear - state.visits_used[benefit_type] : null,
    };
  }

  // ── 5. Per-visit limit ───────────────────────────────────────────────────
  const perVisitLimit = benefit.per_visit_limit;
  const eligible = perVisitLimit ? Math.min(amount, perVisitLimit) : amount;
  const overVisitLimit = amount - eligible;

  // ── 6. Deductible ────────────────────────────────────────────────────────
  const deductibleRemaining = benefit.deductible - state.deductible_paid[benefit_type];
  const deductibleApplied = Math.min(deductibleRemaining, eligible);
  const afterDeductible = eligible - deductibleApplied;
  state.deductible_paid[benefit_type] += deductibleApplied;

  // ── 7. Copay — fixed takes priority over percentage ──────────────────────
  let copayAmount;
  let copayReason;
  if (benefit.copay_fixed > 0) {
    copayAmount = Math.min(benefit.copay_fixed, afterDeductible);
    copayReason = `Fixed copay: member pays ${copayAmount} THB per visit`;
  } else {
    copayAmount = Math.round(afterDeductible * (benefit.copay_percentage / 100));
    copayReason = copayAmount > 0 ? `${benefit.copay_percentage}% copay: member pays ${copayAmount} THB` : null;
  }
  const coveredBeforeAnnualLimit = afterDeductible - copayAmount;

  // ── 8. Annual limit ──────────────────────────────────────────────────────
  const coveredAmount = Math.min(coveredBeforeAnnualLimit, state.remaining_annual[benefit_type]);
  state.remaining_annual[benefit_type] -= coveredAmount;

  // ── 9. Determine decision ────────────────────────────────────────────────
  let decision;
  if (coveredAmount === amount) {
    decision = 'COVERED';
  } else if (coveredAmount === 0) {
    decision = 'DENIED';
  } else {
    decision = 'PARTIALLY_COVERED';
  }

  // ── 10. Build human-readable reason ─────────────────────────────────────
  const reasonParts = [];
  if (overVisitLimit > 0) {
    reasonParts.push(`Per-visit limit of ${perVisitLimit} THB applied (submitted ${amount} THB; ${overVisitLimit} THB over-limit not eligible)`);
  }
  if (deductibleApplied > 0) {
    reasonParts.push(`Annual deductible applied: ${deductibleApplied} THB`);
  }
  if (copayReason) {
    reasonParts.push(copayReason);
  }
  if (coveredAmount < coveredBeforeAnnualLimit) {
    const shortfall = coveredBeforeAnnualLimit - coveredAmount;
    reasonParts.push(`Annual limit reached: ${shortfall} THB not covered (only ${coveredAmount} THB remaining in annual pool)`);
  }
  if (reasonParts.length === 0) {
    reasonParts.push(`Covered in full under ${benefit_type} benefit`);
  }

  return {
    expense_id,
    submitted_amount: amount,
    covered_amount: coveredAmount,
    copay_amount: copayAmount,
    deductible_applied: deductibleApplied,
    member_pays: amount - coveredAmount,
    decision,
    reason: reasonParts.join('. ') + '.',
    remaining_annual_limit: state.remaining_annual[benefit_type],
    remaining_visit_limit: visitsPerYear !== null ? visitsPerYear - state.visits_used[benefit_type] : null,
  };
}

/**
 * Builds the end-of-run benefit summary.
 */
function buildSummary(policy, state) {
  return Object.entries(policy.benefits).map(([type, benefit]) => ({
    benefit_type: type,
    annual_limit: benefit.annual_limit,
    used: benefit.annual_limit - state.remaining_annual[type],
    remaining: state.remaining_annual[type],
    visits_per_year: benefit.visits_per_year ?? null,
    visits_used: state.visits_used[type],
    visits_remaining: benefit.visits_per_year != null ? benefit.visits_per_year - state.visits_used[type] : null,
    deductible_total: benefit.deductible,
    deductible_paid: state.deductible_paid[type],
  }));
}

/**
 * Main entry point. Processes all expenses chronologically.
 */
function calculateCoverage(policy, expenses) {
  if (!policy || !policy.benefits) throw new Error('Invalid policy: missing benefits');
  if (!Array.isArray(expenses)) throw new Error('Expenses must be an array');

  const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
  const state = initState(policy);
  const results = sorted.map((expense) => processExpense(expense, policy, state));

  return {
    results,
    summary: buildSummary(policy, state),
  };
}

module.exports = { calculateCoverage, processExpense, daysBetween, initState };
