/*
  Entry point for the Deal Analyzer.  The heavy lifting is handled in
  engine/state.js, engine/math.js and ui/components.js.  This file can
  expose helpers or acceptance tests if needed.
*/

// Example: run internal acceptance tests in console
window.runAcceptanceTests = function() {
  // Test 1: rental DSCR should be >=1.20
  const test1 = MathEngine.calcRental({
    units: 2,
    rent: 1000,
    otherIncome: 0,
    vacancyPct: 0.05,
    managementPct: 0.1,
    taxes: 2400,
    insurance: 1000,
    hoa: 0,
    repairs: 600,
    capex: 600,
    utilities: 0,
    otherOpex: 0,
    annualDebt: 12000,
    investment: 40000,
    capRateTarget: 0.08
  });
  console.log('Rental test DSCR >=1.20:', test1.dscr);
};