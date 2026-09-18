import { analyzeSyllabusPace, getDepartmentsMatrix } from '../services/erpCcr.service';
import assert from 'assert';

console.log('🧪 Starting CCR QA Test Automation Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${error.message}\n`);
  }
}

// ── TEST SUITE: ALGORITHM 1 - SYLLABUS PACE & VELOCITY ANALYZER ──
console.log('📌 Testing Algorithm 1 (Syllabus Pace & Velocity Analyzer):');

test('Pace Ratio & Deficit: 100% on schedule (Planned 4, Handled 4)', () => {
  const result = analyzeSyllabusPace(4, 4, 'YES', '75%');
  assert.strictEqual(result.paceRatio, 1.0, 'Pace ratio should be 1.0');
  assert.strictEqual(result.periodsDeficit, 0, 'Periods deficit should be 0');
  assert.strictEqual(result.isDeficit, false, 'isDeficit should be false');
  assert.strictEqual(result.healthStatus, 'ON_TRACK', 'Health status should be ON_TRACK');
  assert.strictEqual(result.requiresExtraHours, false, 'Should not require extra hours');
  assert.strictEqual(result.parsedCoveragePercent, 75, 'Parsed percentage should be 75');
});

test('Pace Ratio & Deficit: Severe lag (< 70% pace or >= 3 periods deficit)', () => {
  const result = analyzeSyllabusPace(5, 2, 'NO', 'Unit 1 - 40%');
  assert.strictEqual(result.paceRatio, 0.4, 'Pace ratio should be 0.4');
  assert.strictEqual(result.periodsDeficit, 3, 'Periods deficit should be 3');
  assert.strictEqual(result.isDeficit, true, 'isDeficit should be true');
  assert.strictEqual(result.healthStatus, 'CRITICAL_LAG', 'Health status should be CRITICAL_LAG');
  assert.strictEqual(result.requiresExtraHours, true, 'Should require extra hours');
  assert.strictEqual(result.suggestedExtraHours, 3, 'Suggested extra hours should equal deficit');
  assert.strictEqual(result.parsedCoveragePercent, 40, 'Parsed percentage should be 40');
});

test('Pace Ratio & Deficit: Moderate lag (< 100% pace)', () => {
  const result = analyzeSyllabusPace(4, 3, 'NO', '60%');
  assert.strictEqual(result.paceRatio, 0.75, 'Pace ratio should be 0.75');
  assert.strictEqual(result.periodsDeficit, 1, 'Periods deficit should be 1');
  assert.strictEqual(result.healthStatus, 'BEHIND_SCHEDULE', 'Health status should be BEHIND_SCHEDULE');
});

test('Edge Case: Zero periods planned (Division by zero guard)', () => {
  const result = analyzeSyllabusPace(0, 0, 'YES', '100%');
  assert.strictEqual(result.paceRatio, 1.0, 'Pace ratio should be guarded to 1.0');
  assert.strictEqual(result.periodsDeficit, 0, 'Periods deficit should be 0');
  assert.strictEqual(result.healthStatus, 'ON_TRACK', 'Health status should be ON_TRACK');
});

test('Edge Case: Negative or invalid string inputs', () => {
  const result = analyzeSyllabusPace(-5, -2, 'YES', 'InvalidString');
  assert.strictEqual(result.periodsDeficit, 0, 'Negative periods handled cleanly');
  assert.strictEqual(result.parsedCoveragePercent, 0, 'Unparseable string defaults to 0%');
});

// ── TEST SUITE: MASTER HIERARCHY MATRIX & METADATA ──
console.log('\n📌 Testing Academic Hierarchy Matrix:');

test('1st Year 8 Sections Structure', () => {
  const matrix = getDepartmentsMatrix();
  const firstYear: any = matrix.years.find((y) => y.id === '1st Year');
  assert.ok(firstYear, '1st Year entry should exist');
  assert.strictEqual(firstYear?.sections?.length, 8, '1st Year must have exactly 8 sections (A to H)');
  
  const secA = firstYear?.sections?.find((s: any) => s.code === 'SEC-A');
  const secH = firstYear?.sections?.find((s: any) => s.code === 'SEC-H');
  assert.ok(secA, 'Section A must exist');
  assert.ok(secH, 'Section H must exist');
});

test('Higher Years (2nd, 3rd, 4th) Department Multi-Branch Support', () => {
  const matrix = getDepartmentsMatrix();
  const thirdYear: any = matrix.years.find((y) => y.id === '3rd Year');
  assert.ok(thirdYear, '3rd Year entry should exist');
  assert.ok(thirdYear?.hasDepartments, '3rd Year should have department division');
  
  const cse = thirdYear?.departments?.find((d: any) => d.id === 'CSE');
  assert.ok(cse, 'CSE department must exist in 3rd year');
  assert.deepStrictEqual(cse?.sections, ['3rd Year CSE-A', '3rd Year CSE-B']);
});

console.log(`\n========================================`);
console.log(`📊 Test Suite Result: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
