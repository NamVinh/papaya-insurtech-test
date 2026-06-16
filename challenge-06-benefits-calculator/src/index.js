'use strict';

const path = require('path');
const { calculateCoverage } = require('./calculator');

const policy = require(path.join(__dirname, '../data/policy.json'));
const expenses = require(path.join(__dirname, '../data/expenses.json'));

const { results, summary } = calculateCoverage(policy, expenses);

// ── Per-expense results ────────────────────────────────────────────────────
console.log('\n========================================');
console.log('  POLICY BENEFITS CALCULATOR — RESULTS  ');
console.log(`  Policy: ${policy.policy_id} | Member: ${policy.member_name}`);
console.log('========================================\n');

const WIDTH = 60;

results.forEach((r) => {
  const bar = '─'.repeat(WIDTH);
  const icon = r.decision === 'COVERED' ? '✅' :
               r.decision === 'PARTIALLY_COVERED' ? '⚠️ ' : '❌';
  console.log(bar);
  console.log(`${icon}  ${r.expense_id}  [${r.decision}]`);
  console.log(`   Submitted : ${r.submitted_amount.toLocaleString()} THB`);
  console.log(`   Covered   : ${r.covered_amount.toLocaleString()} THB`);
  if (r.copay_amount > 0) {
    console.log(`   Copay     : ${r.copay_amount.toLocaleString()} THB`);
  }
  if (r.deductible_applied > 0) {
    console.log(`   Deductible: ${r.deductible_applied.toLocaleString()} THB`);
  }
  console.log(`   Member pays: ${r.member_pays.toLocaleString()} THB`);
  console.log(`   Reason    : ${r.reason}`);
  if (r.remaining_annual_limit !== null) {
    console.log(`   Remaining : ${r.remaining_annual_limit.toLocaleString()} THB`);
  }
});

// ── Benefit summary ────────────────────────────────────────────────────────
console.log('\n\n========================================');
console.log('  BENEFIT SUMMARY AFTER ALL EXPENSES    ');
console.log('========================================');
console.log(
  `${'Benefit'.padEnd(12)} ${'Annual Limit'.padStart(13)} ${'Used'.padStart(10)} ${'Remaining'.padStart(12)}`
);
console.log('─'.repeat(50));
summary.forEach((row) => {
  console.log(
    `${row.benefit_type.padEnd(12)} ${row.annual_limit.toLocaleString().padStart(13)} ${row.used.toLocaleString().padStart(10)} ${row.remaining.toLocaleString().padStart(12)}`
  );
});

// ── Scenario coverage check ────────────────────────────────────────────────
const scenarios = {
  COVERED: results.filter((r) => r.decision === 'COVERED').length,
  PARTIALLY_COVERED: results.filter((r) => r.decision === 'PARTIALLY_COVERED').length,
  DENIED: results.filter((r) => r.decision === 'DENIED').length,
};
console.log('\n========================================');
console.log('  SCENARIO BREAKDOWN                    ');
console.log('========================================');
console.log(`  ✅ COVERED          : ${scenarios.COVERED}`);
console.log(`  ⚠️  PARTIALLY_COVERED: ${scenarios.PARTIALLY_COVERED}`);
console.log(`  ❌ DENIED           : ${scenarios.DENIED}`);
console.log(`  Total               : ${results.length}`);
console.log('========================================\n');
