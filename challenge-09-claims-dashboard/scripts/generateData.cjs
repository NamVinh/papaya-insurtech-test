const fs = require('fs');
const path = require('path');

let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

// ~60% OUTPATIENT, ~20% INPATIENT, ~15% DENTAL, ~5% MATERNITY
const CLAIM_TYPES = [
  ...Array(12).fill('OUTPATIENT'),
  ...Array(4).fill('INPATIENT'),
  ...Array(3).fill('DENTAL'),
  ...Array(1).fill('MATERNITY'),
];

// ~65% APPROVED, ~15% REJECTED, ~12% PENDING, ~8% IN_REVIEW
const STATUSES_POOL = [
  ...Array(13).fill('APPROVED'),
  ...Array(3).fill('REJECTED'),
  ...Array(2).fill('PENDING'),
  ...Array(2).fill('IN_REVIEW'),
];

const ICD10_CODES = [
  'J00','J06','J45','J18','I10','I21','E11','K21','M54','L20',
  'A90','B01','K02','K05','H10','R50','G43','N39','J30','K29'
];

const MEMBER_FIRST = ['Nguyen','Tran','Le','Pham','Hoang','Vo','Dang','Bui',
  'Somchai','Siriporn','Wanchai','Nattaporn','Apinya',
  'Chan','Wei','Ming','Ying','Hui'];
const MEMBER_LAST = ['Van An','Thi Lan','Van Minh','Thi Hoa','Van Long','Thi Mai',
  'Suwan','Wongkham','Charoenwong','Kittipong','Thanapon',
  'Wai Man','Siu Fung','Ka Wai','Ho Yin','Mei Ling'];

const ASSESSORS = ['Alice Chen','Bob Kumar','Carol Nguyen','David Park','Emma Wilson'];
const INSURERS = ['AIA Thailand','Allianz Care','Cigna Global'];
const COUNTRIES = [
  ...Array(10).fill('Thailand'),
  ...Array(6).fill('Vietnam'),
  ...Array(4).fill('Hong Kong'),
];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function skewedAmount() {
  const u = rand();
  if (u < 0.55) return randInt(500, 5000);
  if (u < 0.80) return randInt(5001, 30000);
  if (u < 0.93) return randInt(30001, 100000);
  if (u < 0.99) return randInt(100001, 500000);
  return randInt(500001, 2000000);
}

const rows = [];
rows.push('claim_id,policy_id,member_name,claim_type,diagnosis_icd10,submitted_amount,approved_amount,status,submitted_date,processed_date,assessor,insurer,country');

for (let i = 1; i <= 5000; i++) {
  const claimId = `CLM-${String(i).padStart(5,'0')}`;
  const policyId = `POL-${String(randInt(1, 800)).padStart(5,'0')}`;
  const memberName = `${pick(MEMBER_FIRST)} ${pick(MEMBER_LAST)}`;
  const claimType = pick(CLAIM_TYPES);
  const icd10 = pick(ICD10_CODES);

  const dayOfYear = randInt(1, 366);
  const submittedDate = addDays('2023-12-31', dayOfYear);

  const status = pick(STATUSES_POOL);
  const submittedAmount = skewedAmount();

  let approvedAmount = 0;
  if (status === 'APPROVED') {
    approvedAmount = Math.round(submittedAmount * (0.6 + rand() * 0.4));
  }

  let processedDate = '';
  if (status !== 'PENDING') {
    processedDate = addDays(submittedDate, randInt(1, 30));
  }

  const assessor = pick(ASSESSORS);
  const insurer = pick(INSURERS);
  const country = pick(COUNTRIES);

  const safeName = `"${memberName}"`;

  rows.push([claimId, policyId, safeName, claimType, icd10,
    submittedAmount, approvedAmount, status, submittedDate,
    processedDate, assessor, insurer, country].join(','));
}

const outPath = path.join(__dirname, '../src/data/claims.csv');
fs.writeFileSync(outPath, rows.join('\n'), 'utf8');

// Distribution summary
const data = rows.slice(1);
const statusCount = {}, typeCount = {};
data.forEach(r => {
  const cols = r.split(',');
  const status = cols[7]; const type = cols[3];
  statusCount[status] = (statusCount[status]||0)+1;
  typeCount[type] = (typeCount[type]||0)+1;
});
console.log(`Generated ${data.length} claims → ${outPath}`);
console.log('Status dist:', statusCount);
console.log('Type dist:  ', typeCount);
