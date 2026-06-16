'use strict';

/**
 * Calculates the number of days between two ISO date strings (inclusive of start).
 * @param {string} startDate - ISO date string (YYYY-MM-DD)
 * @param {string} expenseDate - ISO date string (YYYY-MM-DD)
 * @returns {number} number of days elapsed
 */
function daysBetween(startDate, expenseDate) {
  const start = new Date(startDate);
  const expense = new Date(expenseDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((expense - start) / msPerDay);
}

/**
 * Initialises the mutable state object for tracking limits per benefit type.
 * @param {Object} policy
 * @returns {Object} state
 */
function initState(policy) {
  const state = {
    remaining_annual: {},
    deductible_paid: {},
  };
  for (const [type, benefit] of Object.entries(policy.benefits)) {
    state.remaining_annual[type] = benefit.annual_limit;
    state.deductible_paid[type] = 0;
  }
  return state;
}

/**
 * Processes a single expense against the policy and current state.
 * State is mutated to reflect consumed limits.
 *
 * @param {Object} expense
 * @param {Object} policy
 * @param {Object} state  - mutable state; modified in place
 * @returns {Object} expense result
 */
function processExpense(expense, policy, state) {
  const { expense_id, date, benefit_type, amount, diagnosis } = expense;
  const benefit = policy.benefits[benefit_type];

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
    };
  }

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
    };
  }

  // ── 2. Exclusion check ───────────────────────────────────────────────────
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
    };
  }

  // ── 3. Annual limit already fully exhausted ──────────────────────────────
  if (state.remaining_annual[benefit_type] <= 0) {
    return {
      expense_id,
      submitted_amount: amount,
      covered_amount: 0,
      copay_amount: 0,
      deductible_applied: 0,
      member_pays: amount,
      decision: 'DENIED',
      reason: `Annual limit for ${benefit_type} (${policy.benefits[benefit_type].annual_limit} THB) has been fully exhausted.`,
      remaining_annual_limit: 0,
    };
  }

  // ── 4. Per-visit limit ───────────────────────────────────────────────────
  const perVisitLimit = benefit.per_visit_limit;
  const eligible = perVisitLimit ? Math.min(amount, perVisitLimit) : amount;
  const overVisitLimit = amount - eligible;

  // ── 5. Deductible ────────────────────────────────────────────────────────
  const deductibleRemaining = benefit.deductible - state.deductible_paid[benefit_type];
  const deductibleApplied = Math.min(deductibleRemaining, eligible);
  const afterDeductible = eligible - deductibleApplied;
  state.deductible_paid[benefit_type] += deductibleApplied;

  // ── 6. Copay ─────────────────────────────────────────────────────────────
  const copayAmount = Math.round(afterDeductible * (benefit.copay_percentage / 100));
  const coveredBeforeAnnualLimit = afterDeductible - copayAmount;

  // ── 7. Annual limit ──────────────────────────────────────────────────────
  const coveredAmount = Math.min(coveredBeforeAnnualLimit, state.remaining_annual[benefit_type]);
  state.remaining_annual[benefit_type] -= coveredAmount;

  // ── 8. Determine decision ────────────────────────────────────────────────
  let decision;
  if (coveredAmount === amount) {
    decision = 'COVERED';
  } else if (coveredAmount === 0) {
    decision = 'DENIED';
  } else {
    decision = 'PARTIALLY_COVERED';
  }

  // ── 9. Build human-readable reason ──────────────────────────────────────
  const reasonParts = [];
  if (overVisitLimit > 0) {
    reasonParts.push(`Per-visit limit of ${perVisitLimit} THB applied (submitted ${amount} THB; ${overVisitLimit} THB over-limit not eligible)`);
  }
  if (deductibleApplied > 0) {
    reasonParts.push(`Annual deductible applied: ${deductibleApplied} THB`);
  }
  if (copayAmount > 0) {
    reasonParts.push(`${benefit.copay_percentage}% copay: member pays ${copayAmount} THB`);
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
  };
}

/**
 * Builds the end-of-run benefit summary.
 * @param {Object} policy
 * @param {Object} state
 * @returns {Object[]} summary rows
 */
function buildSummary(policy, state) {
  return Object.entries(policy.benefits).map(([type, benefit]) => ({
    benefit_type: type,
    annual_limit: benefit.annual_limit,
    used: benefit.annual_limit - state.remaining_annual[type],
    remaining: state.remaining_annual[type],
    deductible_total: benefit.deductible,
    deductible_paid: state.deductible_paid[type],
  }));
}

/**
 * Main entry point.  Processes all expenses in chronological order.
 *
 * @param {Object} policy  - parsed policy JSON
 * @param {Object[]} expenses - array of expense objects
 * @returns {{ results: Object[], summary: Object[] }}
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
