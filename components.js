/*
 * UI component helpers and renderers.  This file builds input forms,
 * KPI bars, progress rings and registers event listeners.  It relies on
 * the global AppState and MathEngine modules.
 */

(function () {
  const root = document.getElementById('calc-root');
  const tabContainer = root.querySelector('.strategy-tabs');
  const main = root.querySelector('.app-main');

  /** Build a progress ring SVG element. */
  function createProgressRing(value, max = 1, label = '') {
    const pct = Math.min(Math.max(value / max, 0), 1);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = circumference * pct;
    const ring = document.createElement('div');
    ring.className = 'progress-ring';
    ring.innerHTML = `
      <svg width="80" height="80">
        <circle class="background" cx="40" cy="40" r="36" />
        <circle class="progress" cx="40" cy="40" r="36"
          stroke-dasharray="${circumference.toFixed(2)}"
          stroke-dashoffset="${(circumference - strokeDash).toFixed(2)}"></circle>
      </svg>
      <div class="progress-label">${(pct * 100).toFixed(0)}%\n${label}</div>`;
    return ring;
  }

  /** Create a generic number input */
  function createNumberInput(label, path, step = 'any') {
    const group = document.createElement('div');
    group.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    const input = document.createElement('input');
    input.type = 'number';
    input.step = step;
    input.value = AppState.state[path.split('.')[0]][path.split('.')[1]] || 0;
    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      AppState.update(path, isNaN(val) ? 0 : val);
    });
    group.appendChild(lbl);
    group.appendChild(input);
    return group;
  }

  /** Render the rental form */
  function renderRentalForm(container) {
    const cfg = AppState.state.rental;
    const form = document.createElement('div');
    form.className = 'strategy-form';
    form.append(
      createNumberInput('Units', 'rental.units', 1),
      createNumberInput('Rent (per unit)', 'rental.rent'),
      createNumberInput('Other income (mo)', 'rental.otherIncome'),
      createNumberInput('Vacancy %', 'rental.vacancyPct', 0.01),
      createNumberInput('Management %', 'rental.managementPct', 0.01),
      createNumberInput('Taxes (yr)', 'rental.taxes'),
      createNumberInput('Insurance (yr)', 'rental.insurance'),
      createNumberInput('HOA (yr)', 'rental.hoa'),
      createNumberInput('Repairs (yr)', 'rental.repairs'),
      createNumberInput('CapEx (yr)', 'rental.capex'),
      createNumberInput('Utilities (yr)', 'rental.utilities'),
      createNumberInput('Other Opex (yr)', 'rental.otherOpex'),
      createNumberInput('Annual Debt Service', 'rental.annualDebt'),
      createNumberInput('Total Investment', 'rental.investment'),
      createNumberInput('Target Cap Rate', 'rental.capRateTarget', 0.01)
    );
    container.appendChild(form);
  }

  /** Render the flip/wholesale form */
  function renderFlipForm(container) {
    const cfg = AppState.state.flip;
    const form = document.createElement('div');
    form.className = 'strategy-form';
    form.append(
      createNumberInput('Adjusted As‑Is Value', 'flip.asIsValue'),
      createNumberInput('Closing %', 'flip.closingRate', 0.01),
      createNumberInput('Trash %', 'flip.trashRate', 0.01),
      createNumberInput('List %', 'flip.listRate', 0.01),
      createNumberInput('Buyer Agent %', 'flip.buyerRate', 0.01),
      createNumberInput('Funding %', 'flip.fundingRate', 0.01),
      createNumberInput('Wholesale %', 'flip.wholesaleRate', 0.01),
      createNumberInput('Profit %', 'flip.profitRate', 0.01),
      createNumberInput('1st LTV', 'flip.ltv1', 0.01),
      createNumberInput('1st Points', 'flip.points1', 0.01),
      createNumberInput('1st Rate', 'flip.rate1', 0.01),
      createNumberInput('1st Months', 'flip.months1', 1),
      createNumberInput('2nd LTV', 'flip.ltv2', 0.01),
      createNumberInput('2nd Points', 'flip.points2', 0.01),
      createNumberInput('2nd Rate', 'flip.rate2', 0.01),
      createNumberInput('2nd Months', 'flip.months2', 1),
      createNumberInput('ARV', 'flip.arv'),
      createNumberInput('Exit %', 'flip.exitPct', 0.01),
      createNumberInput('Rehab', 'flip.rehab'),
      createNumberInput('Wholesale Fee', 'flip.wholesaleFee')
    );
    container.appendChild(form);
  }

  /** Render the short‑term rental form */
  function renderSTRForm(container) {
    const cfg = AppState.state.str;
    const form = document.createElement('div');
    form.className = 'strategy-form';
    form.append(
      createNumberInput('Nightly Rate', 'str.nightlyRate'),
      createNumberInput('Occupancy', 'str.occupancy', 0.01),
      createNumberInput('Cleaning Fee (mo)', 'str.cleaningFeeMo'),
      createNumberInput('Taxes (yr)', 'str.taxes'),
      createNumberInput('Insurance (yr)', 'str.insurance'),
      createNumberInput('PMI (yr)', 'str.pmi'),
      createNumberInput('HOA (yr)', 'str.hoa'),
      createNumberInput('Utilities (mo)', 'str.utilities'),
      createNumberInput('Airbnb Fee %', 'str.airbnbPct', 0.01),
      createNumberInput('Repairs %', 'str.repairsPct', 0.01),
      createNumberInput('Management %', 'str.mgmtPct', 0.01),
      createNumberInput('Mortgage P&I (mo)', 'str.mortgagePmt'),
      createNumberInput('Investment', 'str.investment')
    );
    container.appendChild(form);
  }

  /** Render KPIs based on state and strategy */
  function renderKPIs(container) {
    const strategy = AppState.state.strategy;
    container.innerHTML = '';
    const bar = document.createElement('div');
    bar.className = 'kpi-bar';
    if (strategy === 'rental') {
      const m = MathEngine.calcRental(AppState.state.rental);
      bar.appendChild(createKPI('NOI', `$${m.noi.toLocaleString()}`));
      bar.appendChild(createKPI('Cash Flow (yr)', `$${m.cashFlow.toLocaleString()}`));
      bar.appendChild(createKPI('DSCR', m.dscr.toFixed(2), getRiskBadge(m.dscr, 1.2, 1.0)));
      bar.appendChild(createKPI('Cap Rate', (m.capRateValue * 100).toFixed(2) + '%'));
      bar.appendChild(createKPI('Cash on Cash', (m.cashOnCash * 100).toFixed(1) + '%'));
    } else if (strategy === 'flip') {
      const mao = MathEngine.calcMAO(AppState.state.flip.asIsValue, AppState.state.flip);
      const funding = MathEngine.calcFunding(mao, AppState.state.flip);
      const exit = MathEngine.calcExit(AppState.state.flip.arv, AppState.state.flip.exitPct, AppState.state.flip.rehab, AppState.state.flip.wholesaleFee);
      bar.appendChild(createKPI('MAO', `$${mao.toLocaleString()}`));
      bar.appendChild(createKPI('Funding', `$${funding.toLocaleString()}`));
      bar.appendChild(createKPI('Exit Price', `$${exit.exitPrice.toLocaleString()}`));
      bar.appendChild(createKPI('Max Buy', `$${exit.maxBuy.toLocaleString()}`));
      bar.appendChild(createKPI('Max Buy %', (exit.maxBuyPct * 100).toFixed(1) + '%'));
    } else if (strategy === 'str') {
      const m = MathEngine.calcSTR(AppState.state.str);
      bar.appendChild(createKPI('Gross (mo)', `$${m.grossMonthly.toLocaleString()}`));
      bar.appendChild(createKPI('NOI (mo)', `$${m.noiMonthly.toLocaleString()}`));
      bar.appendChild(createKPI('Cash Flow (mo)', `$${m.cashFlowMo.toLocaleString()}`));
      bar.appendChild(createKPI('Cash on Cash', (m.cashOnCash * 100).toFixed(1) + '%'));
    }
    container.appendChild(bar);
  }

  /** Helper to create KPI item */
  function createKPI(label, value, badge) {
    const k = document.createElement('div');
    k.className = 'kpi';
    const lbl = document.createElement('div');
    lbl.className = 'label';
    lbl.textContent = label;
    const val = document.createElement('div');
    val.className = 'value';
    val.textContent = value;
    k.appendChild(lbl);
    k.appendChild(val);
    if (badge) {
      k.appendChild(badge);
    }
    return k;
  }

  /** Generate a risk badge based on a value and thresholds */
  function getRiskBadge(value, greenThreshold, redThreshold) {
    const badge = document.createElement('span');
    if (value >= greenThreshold) {
      badge.className = 'badge badge-success';
      badge.textContent = 'Good';
    } else if (value < redThreshold) {
      badge.className = 'badge badge-danger';
      badge.textContent = 'Bad';
    } else {
      badge.className = 'badge badge-warning';
      badge.textContent = 'Fair';
    }
    return badge;
  }

  /** Render the entire application */
  function render() {
    // Clear tab container
    tabContainer.innerHTML = '';
    const strategies = [
      { id: 'rental', name: 'Rental' },
      { id: 'flip', name: 'Flip/Wholetail' },
      { id: 'str', name: 'Short‑Term' }
    ];
    strategies.forEach((s) => {
      const tab = document.createElement('button');
      tab.className = 'strategy-tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', AppState.state.strategy === s.id);
      tab.textContent = s.name;
      tab.addEventListener('click', () => {
        AppState.setStrategy(s.id);
      });
      tabContainer.appendChild(tab);
    });

    // Clear main area
    main.innerHTML = '';
    // KPI bar container
    const kpiContainer = document.createElement('section');
    renderKPIs(kpiContainer);
    main.appendChild(kpiContainer);
    // Form container
    const formContainer = document.createElement('section');
    if (AppState.state.strategy === 'rental') {
      renderRentalForm(formContainer);
    } else if (AppState.state.strategy === 'flip') {
      renderFlipForm(formContainer);
    } else if (AppState.state.strategy === 'str') {
      renderSTRForm(formContainer);
    }
    main.appendChild(formContainer);
  }

  // Subscribe to state changes
  AppState.subscribe(render);
  // Load and initial render
  document.addEventListener('DOMContentLoaded', () => {
    AppState.load();
    render();
  });
})();