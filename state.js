/*
  Centralised application state and persistence.
  The store holds global inputs, per‑strategy parameters and computed outputs.  It persists
  to localStorage with versioning so that future migrations are possible.
*/

const AppState = (() => {
  const VERSION = 1;
  const STORAGE_KEY = 'dealAnalyzerState_v' + VERSION;
  const subscribers = [];

  // Default state across strategies
  const defaultState = {
    version: VERSION,
    strategy: 'rental',
    rental: {
      units: 1,
      rent: 1200,
      otherIncome: 0,
      vacancyPct: 0.05,
      managementPct: 0.08,
      taxes: 3600,
      insurance: 1200,
      hoa: 0,
      repairs: 600,
      capex: 600,
      utilities: 0,
      otherOpex: 0,
      annualDebt: 0,
      investment: 0,
      capRateTarget: 0.08
    },
    flip: {
      asIsValue: 250000,
      closingRate: 0.03,
      trashRate: 0.01,
      listRate: 0.01,
      buyerRate: 0.03,
      fundingRate: 0.03,
      wholesaleRate: 0.00,
      profitRate: 0.20,
      ltv1: 0.8,
      points1: 0.02,
      rate1: 0.12,
      months1: 3,
      ltv2: 0.2,
      points2: 0.02,
      rate2: 0.12,
      months2: 3,
      arv: 300000,
      exitPct: 0.7,
      rehab: 50000,
      wholesaleFee: 15000
    },
    str: {
      nightlyRate: 180,
      occupancy: 0.8,
      cleaningFeeMo: 900,
      taxes: 312,
      insurance: 660,
      pmi: 0,
      hoa: 0,
      utilities: 250,
      airbnbPct: 0.03,
      repairsPct: 0.05,
      mgmtPct: 0.08,
      mortgagePmt: 1200,
      investment: 0
    }
  };

  let state = {};

  /** Load state from localStorage or fallback to defaults */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === VERSION) {
          state = Object.assign({}, defaultState, parsed);
          notify();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
    state = JSON.parse(JSON.stringify(defaultState));
    save();
  }

  /** Save state to localStorage */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  }

  /** Subscribe to state changes */
  function subscribe(fn) {
    subscribers.push(fn);
  }

  function notify() {
    subscribers.forEach((fn) => fn(state));
  }

  /** Update a specific path in the state */
  function update(path, value) {
    const keys = path.split('.');
    let obj = state;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    save();
    notify();
  }

  /** Select a strategy */
  function setStrategy(name) {
    state.strategy = name;
    save();
    notify();
  }

  /** Public API */
  return { load, save, subscribe, update, setStrategy, get state() { return state; }, defaultState };
})();

// expose
if (typeof window !== 'undefined') {
  window.AppState = AppState;
}