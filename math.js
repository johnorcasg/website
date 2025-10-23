/*
 * Pure math library for the Real Estate Deal Analyzer.
 * All functions accept and return plain numbers.  To minimise floating
 * precision issues we round results using a helper.  If more
 * deterministic decimal behaviour is required, a dedicated decimal
 * library could be embedded here (no external CDNs allowed).
 */

const MathEngine = (() => {
  const pow10 = (exp) => Math.pow(10, exp);
  /** Round a number to `decimals` using half‑up rounding. */
  function round(value, decimals = 2) {
    const factor = pow10(decimals);
    return Math.round(value * factor) / factor;
  }

  /** Ensure input is a finite number or zero. */
  function num(x) {
    const v = parseFloat(x);
    return isNaN(v) ? 0 : v;
  }

  /** Maximum Allowable Offer (wholetail/flip) */
  function calcMAO(asIsValue, { closingRate = 0, trashRate = 0, listRate = 0, buyerRate = 0, fundingRate = 0, wholesaleRate = 0, profitRate = 0 }) {
    const v = num(asIsValue);
    const amounts = closingRate + trashRate + listRate + buyerRate + fundingRate + wholesaleRate + profitRate;
    const mao = v * (1 - amounts);
    return round(mao, 0);
  }

  /** Funding cost for two positions */
  function calcFunding(mao, { ltv1 = 0, points1 = 0, rate1 = 0, months1 = 0, ltv2 = 0, points2 = 0, rate2 = 0, months2 = 0 }) {
    const m = num(mao);
    const loan1 = m * ltv1;
    const loan2 = m * ltv2;
    const cost1 = loan1 * points1 + loan1 * rate1 / 12 * months1;
    const cost2 = loan2 * points2 + loan2 * rate2 / 12 * months2;
    return round(cost1 + cost2, 0);
  }

  /** Exit price and max buy price (ARV section) */
  function calcExit(arv, exitPct, rehab, wholesaleFee) {
    const exitPrice = num(arv) * num(exitPct) - num(rehab);
    const maxBuy = exitPrice - num(wholesaleFee);
    return {
      exitPrice: round(exitPrice, 0),
      maxBuy: round(maxBuy, 0),
      maxBuyPct: num(arv) > 0 ? round(maxBuy / num(arv), 4) : 0
    };
  }

  /** Long‑term rental metrics */
  function calcRental({ units = 1, rent = 0, otherIncome = 0, vacancyPct = 0, managementPct = 0, taxes = 0, insurance = 0, hoa = 0, repairs = 0, capex = 0, utilities = 0, otherOpex = 0, annualDebt = 0, investment = 0, capRateTarget = 0 }) {
    const gross = (num(rent) + num(otherIncome)) * num(units);
    const vacancy = gross * num(vacancyPct);
    const effective = gross - vacancy;
    const expense = effective * num(managementPct) + num(taxes) + num(insurance) + num(hoa) + num(repairs) + num(capex) + num(utilities) + num(otherOpex);
    const noi = effective - expense;
    const capRate = num(capRateTarget) > 0 ? noi / num(capRateTarget) : 0;
    const cashFlow = noi - num(annualDebt);
    const dscr = num(annualDebt) > 0 ? noi / num(annualDebt) : 0;
    const coc = num(investment) > 0 ? (cashFlow) / num(investment) : 0;
    return {
      grossMonthly: round(gross / 12, 2),
      noi: round(noi, 0),
      cashFlow: round(cashFlow, 0),
      dscr: round(dscr, 2),
      capRateValue: round(noi / num(investment), 3),
      cashOnCash: round(coc, 3),
      valuation: round(capRate, 0)
    };
  }

  /** Short‑term rental metrics */
  function calcSTR({ nightlyRate = 0, occupancy = 0, cleaningFeeMo = 0, taxes = 0, insurance = 0, pmi = 0, hoa = 0, utilities = 0, airbnbPct = 0.03, repairsPct = 0, mgmtPct = 0, mortgagePmt = 0, investment = 0 }) {
    const grossMonthly = (num(nightlyRate) * 365 / 12) * num(occupancy) + num(cleaningFeeMo);
    const airbnbFee = grossMonthly * num(airbnbPct);
    const repairs = grossMonthly * num(repairsPct);
    const mgmt = grossMonthly * num(mgmtPct);
    const expenses = num(taxes) / 12 + num(insurance) / 12 + num(pmi) / 12 + num(hoa) / 12 + num(utilities) + airbnbFee + repairs + mgmt + num(cleaningFeeMo);
    const noi = grossMonthly - expenses;
    const cashFlow = noi - num(mortgagePmt);
    const coc = num(investment) > 0 ? (cashFlow * 12) / num(investment) : 0;
    return {
      grossMonthly: round(grossMonthly, 2),
      noiMonthly: round(noi, 2),
      cashFlowMo: round(cashFlow, 2),
      cashOnCash: round(coc, 3)
    };
  }

  return { round, calcMAO, calcFunding, calcExit, calcRental, calcSTR };
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.MathEngine = MathEngine;
}