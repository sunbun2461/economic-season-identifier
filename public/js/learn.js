;(function() {
const { applyTheme, buildHeader, buildKeyBar, setupAccordion } = window.MacroTheme;

// ─── CHEAT SHEET ACCORDION ────────────────────────────────────────────────────

const CS_RENDERERS = {};

window.toggleCheatSheet = function(itemId, componentName) {
  const item = document.getElementById(itemId);
  if (!item) { console.error('[Learn] toggleCheatSheet: item not found:', itemId); return; }
  const isOpen = item.classList.contains('open');
  if (isOpen) {
    item.classList.remove('open');
  } else {
    document.querySelectorAll('.cs-item.open').forEach(i => i.classList.remove('open'));
    item.classList.add('open');
    const target = document.getElementById(itemId + '-target');
    if (target && !target._rendered && CS_RENDERERS[componentName]) {
      console.log('[Learn] Rendering cheat sheet:', componentName);
      target.innerHTML = '<div class="cs-placeholder">Loading…</div>';
      try {
        CS_RENDERERS[componentName](target);
        target._rendered = true;
        console.log('[Learn] Rendered:', componentName);
      } catch (err) {
        console.error('[Learn] Render error in', componentName, ':', err);
        target.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.85rem;text-align:center">
          <strong>Render error in ${componentName}</strong><br>
          <code style="font-size:0.75rem;color:#dc2626">${err.message}</code><br>
          <small style="color:#94a3b8">Check browser console (F12) for details.</small>
        </div>`;
      }
    } else if (!CS_RENDERERS[componentName]) {
      console.warn('[Learn] No renderer found for:', componentName);
    }
  }
};

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

function fadeAnim() { return 'animation:fadeSlideIn 0.3s ease'; }

function pillTag(text, fg, bg) {
  return `<span style="display:inline-block;padding:0.22rem 0.55rem;border-radius:20px;font-size:0.68rem;font-weight:500;background:${bg};color:${fg}">${text}</span>`;
}

function factRow(text, color) {
  return `<div style="display:flex;align-items:center;gap:0.4rem;padding:0.3rem 0.6rem;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0"><span style="width:4px;height:4px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span><span style="font-size:0.75rem;color:#475569;font-weight:500">${text}</span></div>`;
}

function overline(text) {
  return `<p style="font-size:0.62rem;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin-bottom:0.4rem">${text}</p>`;
}

function placeholder(icon, title, body) {
  return `<div style="background:white;border-radius:18px;padding:2rem;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid #e2e8f0"><div style="font-size:2rem;margin-bottom:0.6rem;opacity:0.5">${icon}</div><p style="font-size:0.88rem;font-weight:600;color:#334155;margin-bottom:0.3rem">${title}</p><p style="font-size:0.79rem;color:#94a3b8;line-height:1.6">${body}</p></div>`;
}

const FADE_STYLE = `<style>@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style>`;

// ─── CHEAT SHEET 1: CYCLE WHEEL ───────────────────────────────────────────────

CS_RENDERERS.cycleWheel = function(container) {
  const PH = [
    { n:'Spring', s:'Recovery', icon:'🌱', c:'#10b981', dk:'#059669', b1:'#d1fae5', b2:'#6ee7b7',
      desc:'Early expansion phase with rising confidence, accommodative policy, and improving fundamentals.',
      ind:['GDP accelerating','Falling unemployment','Low interest rates','Rising consumer confidence'],
      ast:['Equities','High-yield bonds','Cyclical sectors'] },
    { n:'Summer', s:'Peak', icon:'☀️', c:'#eab308', dk:'#ca8a04', b1:'#fef9c3', b2:'#fde047',
      desc:'Mature expansion with peak activity, rising inflation pressures, and full employment.',
      ind:['Peak GDP growth','Full employment','Rising inflation','Strong corporate earnings'],
      ast:['Commodities','Real estate','Inflation-protected securities'] },
    { n:'Autumn', s:'Tightening', icon:'🍂', c:'#f97316', dk:'#ea580c', b1:'#ffedd5', b2:'#fdba74',
      desc:'Late-cycle slowdown as policy tightens, growth decelerates, and vulnerabilities emerge.',
      ind:['Slowing growth','Rate hikes','Yield curve flattening','Rising volatility'],
      ast:['Defensive stocks','Cash','Short-duration bonds'] },
    { n:'Winter', s:'Contraction', icon:'❄️', c:'#3b82f6', dk:'#2563eb', b1:'#dbeafe', b2:'#93c5fd',
      desc:'Recession phase with declining output, rising unemployment, and risk aversion.',
      ind:['Falling GDP','Rising unemployment','Declining profits','Flight to safety'],
      ast:['Government bonds','Gold','Defensive equities'] },
  ];
  const SZ=420, C=210, OR=185, IR=72, MR=(OR+IR)/2;
  const toRad = a => ((a - 90) * Math.PI) / 180;
  const ptOn = (r, a) => ({ x: C + r * Math.cos(toRad(a)), y: C + r * Math.sin(toRad(a)) });
  function arc(s, e, or, ir) {
    const p1=ptOn(or,s), p2=ptOn(or,e), p3=ptOn(ir,e), p4=ptOn(ir,s);
    return `M ${p1.x} ${p1.y} A ${or} ${or} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ir} ${ir} 0 0 0 ${p4.x} ${p4.y} Z`;
  }
  let act = null;

  function buildSVG() {
    const defs = PH.map((p,i) => `<linearGradient id="cwg${i}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${p.b1}"/><stop offset="100%" stop-color="${p.b2}"/></linearGradient>`).join('');
    const segs = PH.map((p,i) => {
      const s=i*90, e=s+90;
      return `<path data-i="${i}" class="cw-seg" d="${arc(s,e,OR,IR)}" fill="url(#cwg${i})" stroke="white" stroke-width="3" style="cursor:pointer"/>
              <path d="${arc(s+4,e-4,OR,OR-5)}" fill="${p.c}" opacity="0.6" style="pointer-events:none"/>`;
    }).join('');
    const lbls = PH.map((p,i) => {
      const mp = ptOn(MR, i*90+45);
      return `<text x="${mp.x}" y="${mp.y-13}" text-anchor="middle" style="font-size:0.95rem;font-weight:700;fill:${p.dk};font-family:'DM Sans',sans-serif;pointer-events:none">${p.icon} ${p.n}</text>
              <text x="${mp.x}" y="${mp.y+7}" text-anchor="middle" style="font-size:0.62rem;font-weight:600;fill:#64748b;text-transform:uppercase;letter-spacing:0.1em;pointer-events:none">${p.s}</text>`;
    }).join('');
    return `<div style="text-align:center">
      <svg width="${SZ}" height="${SZ}" viewBox="0 0 ${SZ} ${SZ}" style="max-width:100%">
        <defs>${defs}<filter id="cwsh"><feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.07"/></filter></defs>
        <g filter="url(#cwsh)">${segs}</g>
        ${lbls}
        <circle cx="${C}" cy="${C}" r="${IR}" fill="white" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${C}" y="${C-7}" text-anchor="middle" style="font-size:0.58rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;fill:#94a3b8">Economic</text>
        <text x="${C}" y="${C+10}" text-anchor="middle" style="font-size:0.58rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;fill:#94a3b8">Cycle</text>
      </svg>
      <p style="font-size:0.67rem;color:#94a3b8;margin-top:0.5rem">Spring → Summer → Autumn → Winter →</p>
    </div>`;
  }

  function buildDetail() {
    if (act === null) return placeholder('📊','Explore each phase','Click a segment to see indicators and favored assets for that phase.');
    const p = PH[act];
    return `<div style="background:white;border-radius:16px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.06);border:1px solid ${p.c}22;${fadeAnim()}">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <span style="font-size:1.5rem">${p.icon}</span>
        <div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;font-weight:700;color:${p.c};margin:0">${p.n}</h3>
          <span style="font-size:0.63rem;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;font-weight:600">${p.s}</span>
        </div>
      </div>
      <p style="font-size:0.83rem;color:#475569;line-height:1.65;margin-bottom:1rem">${p.desc}</p>
      ${overline('Key Indicators')}
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:1rem">${p.ind.map(x => pillTag(x, p.c, p.c+'15')).join('')}</div>
      ${overline('Favored Assets')}
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem">${p.ast.map(x => pillTag(x, '#475569', '#f8fafc')).join('')}</div>
    </div>`;
  }

  function buildBtns() {
    return PH.map((p,i) => `<button class="cw-btn" data-i="${i}" style="display:flex;align-items:center;gap:0.4rem;padding:0.42rem 0.8rem;border-radius:9px;border:${act===i?`2px solid ${p.c}`:'2px solid transparent'};background:${act===i?p.c+'14':'white'};cursor:pointer">
      <span style="width:7px;height:7px;border-radius:50%;background:${p.c};display:inline-block"></span>
      <span style="font-size:0.78rem;font-weight:600;color:#334155">${p.n}</span>
      <span style="font-size:0.68rem;color:#94a3b8">${p.s}</span>
    </button>`).join('');
  }

  container.innerHTML = `${FADE_STYLE}
    <div style="display:flex;gap:2rem;align-items:center;justify-content:center;flex-wrap:wrap">
      <div id="cw-wheel">${buildSVG()}</div>
      <div style="flex:1 1 280px;max-width:340px"><div id="cw-detail">${buildDetail()}</div></div>
    </div>
    <div id="cw-btns" style="display:flex;justify-content:center;gap:0.8rem;margin-top:1.5rem;flex-wrap:wrap">${buildBtns()}</div>`;

  function toggle(i) {
    act = act === i ? null : i;
    document.getElementById('cw-detail').innerHTML = buildDetail();
    document.getElementById('cw-btns').innerHTML = buildBtns();
    bindBtns();
  }
  function bindBtns() { container.querySelectorAll('.cw-btn').forEach(b => b.addEventListener('click', () => toggle(+b.dataset.i))); }
  container.querySelectorAll('.cw-seg').forEach(s => s.addEventListener('click', () => toggle(+s.dataset.i)));
  bindBtns();
};

// ─── CHEAT SHEET 2: YIELD CURVE ───────────────────────────────────────────────

CS_RENDERERS.yieldCurve = function(container) {
  const CURVES = [
    { n:'Normal', c:'#10b981', cL:'#d1fae5', dash:false, sig:'Growth expected', icon:'📈',
      desc:'Longer-term bonds yield more than shorter-term ones. The most common shape, signaling investors expect healthy growth and moderate inflation.',
      impl:['Economic expansion ahead','Healthy credit markets','Banks profitable on lending','Favorable for risk assets'],
      pts:[{x:0,y:0.28},{x:0.25,y:0.44},{x:0.5,y:0.58},{x:0.75,y:0.69},{x:1,y:0.82}] },
    { n:'Flat', c:'#94a3b8', cL:'#f1f5f9', dash:true, sig:'Uncertainty / Transition', icon:'⚖️',
      desc:'Short-term and long-term yields are nearly equal. This transitional shape often appears when markets are uncertain about future direction.',
      impl:['Economic inflection point','Monetary policy transition','Market indecision','Often precedes inversion'],
      pts:[{x:0,y:0.48},{x:0.25,y:0.50},{x:0.5,y:0.52},{x:0.75,y:0.53},{x:1,y:0.54}] },
    { n:'Inverted', c:'#ef4444', cL:'#fee2e2', dash:false, sig:'Recession signal', icon:'⚠️',
      desc:'Short-term bonds yield more than long-term ones. Historically one of the most reliable recession predictors, signaling economic deterioration ahead.',
      impl:['Recession risk elevated','Fed likely to cut rates','Flight to long-term safety','Credit tightening expected'],
      pts:[{x:0,y:0.78},{x:0.2,y:0.66},{x:0.5,y:0.52},{x:0.75,y:0.38},{x:1,y:0.26}] },
  ];
  const SW=560, SH=320, CX=55, CY=25, CW=455, CH=240;
  let act = null;

  function smoothPath(pts) {
    const p = pts.map(pt => ({ x: CX + pt.x*CW, y: CY + CH - pt.y*CH }));
    let d = `M ${p[0].x} ${p[0].y}`;
    for (let i=0; i<p.length-1; i++) {
      const cx = (p[i].x + p[i+1].x)/2;
      d += ` C ${cx} ${p[i].y}, ${cx} ${p[i+1].y}, ${p[i+1].x} ${p[i+1].y}`;
    }
    return d;
  }

  function buildChart() {
    const bottom = CY + CH;
    const grid = [0.15,0.5,0.85].map(v => {
      const y = CY + CH - v*CH;
      return `<line x1="${CX}" y1="${y}" x2="${CX+CW}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 6"/>`;
    }).join('');
    const mats = ['3M','2Y','5Y','10Y','30Y'];
    const xLabels = mats.map((m,i) => {
      const x = CX + (i/4)*CW;
      return `<text x="${x}" y="${bottom+20}" text-anchor="middle" style="font-size:0.7rem;fill:#64748b;font-family:'JetBrains Mono',monospace;font-weight:500">${m}</text>`;
    }).join('');
    const yLabels = [['High',0.85],['Mid',0.5],['Low',0.15]].map(([l,v]) => {
      const y = CY + CH - v*CH;
      return `<text x="${CX-10}" y="${y+4}" text-anchor="end" style="font-size:0.66rem;fill:#94a3b8">${l}</text>`;
    }).join('');
    const curves = CURVES.map((c,i) => {
      const d = smoothPath(c.pts);
      const last = { x: CX + c.pts[c.pts.length-1].x*CW, y: CY + CH - c.pts[c.pts.length-1].y*CH };
      const dim = act !== null && act !== i;
      const areaPath = d + ` L ${CX+CW} ${bottom} L ${CX} ${bottom} Z`;
      return `<g class="yc-curve" data-i="${i}" style="cursor:pointer;opacity:${dim?0.12:1};transition:opacity 0.3s">
        <path d="${areaPath}" fill="${c.c}" fill-opacity="0.05"/>
        <path d="${d}" fill="none" stroke="${c.c}" stroke-width="${act===i?3.5:2.5}" stroke-dasharray="${c.dash?'10 7':'none'}" stroke-linecap="round"/>
        <circle cx="${last.x}" cy="${last.y}" r="4.5" fill="${c.c}" stroke="white" stroke-width="2"/>
        <text x="${last.x+12}" y="${last.y+5}" style="font-size:0.78rem;font-weight:700;fill:${c.c};font-family:'DM Sans',sans-serif">${c.n}</text>
      </g>`;
    }).join('');
    return `<div style="background:white;border-radius:20px;padding:1.2rem 1.2rem 0.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <svg viewBox="0 0 ${SW} ${SH}" width="100%" style="display:block">
        ${grid}
        <line x1="${CX}" y1="${CY}" x2="${CX}" y2="${bottom}" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="${CX}" y1="${bottom}" x2="${CX+CW}" y2="${bottom}" stroke="#cbd5e1" stroke-width="1.5"/>
        ${yLabels}${xLabels}
        <text x="${CX+CW/2}" y="${bottom+38}" text-anchor="middle" style="font-size:0.63rem;fill:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Maturity</text>
        <text x="12" y="${CY+CH/2}" text-anchor="middle" transform="rotate(-90,12,${CY+CH/2})" style="font-size:0.63rem;fill:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Yield</text>
        ${curves}
      </svg>
      <div style="display:flex;justify-content:center;gap:1rem;padding:0.6rem 0 0.2rem;border-top:1px solid #f1f5f9;flex-wrap:wrap">
        ${CURVES.map((c,i) => `<button class="yc-btn" data-i="${i}" style="display:flex;align-items:center;gap:0.35rem;padding:0.4rem 0.8rem;border-radius:8px;border:${act===i?`2px solid ${c.c}`:'2px solid transparent'};background:${act===i?c.cL:'transparent'};cursor:pointer">
          <span style="display:inline-block;width:18px;height:3px;background:${c.c};border-radius:2px;${c.dash?'border-top:2px dashed '+c.c+';background:none;height:0':''}" ></span>
          <span style="font-size:0.76rem;font-weight:600;color:${act===i?c.c:'#64748b'}">${c.n}</span>
        </button>`).join('')}
      </div>
    </div>`;
  }

  function buildDetail() {
    if (act === null) return placeholder('📐','Select a curve','Click on any curve or use the legend to explore what each shape signals about the economy.');
    const c = CURVES[act];
    return `<div style="background:white;border-radius:18px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid ${c.c}18;${fadeAnim()}">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <span style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${c.cL};border-radius:12px">${c.icon}</span>
        <div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;font-weight:700;color:${c.c};margin:0">${c.n}</h3>
          <span style="font-size:0.66rem;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;font-weight:600">${c.sig}</span>
        </div>
      </div>
      <p style="font-size:0.83rem;color:#475569;line-height:1.7;margin-bottom:1rem">${c.desc}</p>
      ${overline('Implications')}
      <div style="display:flex;flex-direction:column;gap:0.3rem">${c.impl.map(x => factRow(x, c.c)).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div style="display:flex;gap:2rem;align-items:center;justify-content:center;flex-wrap:wrap">
      <div id="yc-chart" style="flex:1 1 520px;max-width:640px">${buildChart()}</div>
      <div style="flex:1 1 280px;max-width:340px"><div id="yc-detail">${buildDetail()}</div></div>
    </div>`;

  function toggle(i) {
    act = act === i ? null : i;
    document.getElementById('yc-chart').innerHTML = buildChart();
    document.getElementById('yc-detail').innerHTML = buildDetail();
    bindAll();
  }
  function bindAll() {
    container.querySelectorAll('.yc-curve').forEach(s => s.addEventListener('click', () => toggle(+s.dataset.i)));
    container.querySelectorAll('.yc-btn').forEach(b => b.addEventListener('click', () => toggle(+b.dataset.i)));
  }
  bindAll();
};

// ─── CHEAT SHEET 3: RATE FLOW ─────────────────────────────────────────────────

CS_RENDERERS.rateFlow = function(container) {
  const NODES = {
    fed: { id:'fed', label:'Fed Funds Rate', sub:'The overnight lending rate set by the Federal Reserve', icon:'🏛️', c:'#3b82f6', cL:'#dbeafe', tier:0,
      desc:'The federal funds rate is the interest rate at which banks lend reserve balances overnight. It\'s the primary tool the Fed uses to influence monetary policy.',
      mech:'The FOMC meets ~8 times per year to set a target range. This single decision cascades through the entire financial system.',
      effects:['Controls short-term borrowing costs','Signals Fed\'s economic outlook','Anchors all other interest rates','Influences USD strength globally'] },
    treasury: { id:'treasury', label:'Treasury Yields', sub:'Government bond rates across all maturities', icon:'📜', c:'#8b5cf6', cL:'#ede9fe', tier:1,
      desc:'Treasury yields represent the return on U.S. government debt. They serve as the risk-free benchmark that all other rates are priced against.',
      mech:'When the Fed raises rates, short-term Treasury yields rise almost immediately. Longer-term yields respond to growth and inflation expectations.',
      effects:['Benchmark for all debt pricing','Reflects inflation expectations','Drives bond market valuations','Shapes the yield curve'] },
    mortgages: { id:'mortgages', label:'Mortgages', sub:'Home loan interest rates', icon:'🏠', c:'#10b981', cL:'#d1fae5', tier:2, impact:'Housing', impactIcon:'🏘️',
      desc:'Mortgage rates are closely tied to the 10-year Treasury yield. Even small rate changes dramatically affect monthly payments and home affordability.',
      mech:'Lenders price mortgages as a spread above Treasury yields. The spread typically ranges from 1.5–2.5%.',
      effects:['Determines monthly payment amounts','Drives housing affordability','Affects home prices & demand','Impacts construction activity'] },
    corpBonds: { id:'corpBonds', label:'Corp Bonds', sub:'Corporate debt interest rates', icon:'🏢', c:'#f97316', cL:'#ffedd5', tier:2, impact:'Stocks', impactIcon:'📊',
      desc:'Corporate bond yields equal the Treasury rate plus a credit spread. Higher rates increase borrowing costs, squeezing profit margins.',
      mech:'Companies issue bonds to fund operations. Higher yields mean higher debt servicing costs, which flow directly to earnings and stock valuations.',
      effects:['Increases corporate borrowing costs','Pressures profit margins','Affects stock valuations (DCF)','Influences M&A activity'] },
    savings: { id:'savings', label:'Savings / CDs', sub:'Deposit and certificate rates', icon:'💰', c:'#eab308', cL:'#fef9c3', tier:2, impact:'$ Return', impactIcon:'💵',
      desc:'Banks set savings and CD rates based on the fed funds rate. Higher rates mean savers earn more, but banks may lag in passing along increases.',
      mech:'Banks profit from the spread between what they pay depositors and what they charge borrowers. Deposit rates typically trail the fed funds rate.',
      effects:['Determines savings account APY','Affects CD and money market rates','Influences consumer spending vs saving','Drives deposit flows between banks'] },
  };
  let act = null;

  function buildNode(node) {
    const isAct = act === node.id;
    return `<div class="rf-node" data-id="${node.id}" style="display:flex;flex-direction:column;align-items:center;gap:0.35rem;cursor:pointer">
      <div style="background:linear-gradient(135deg,${node.c},${node.c}dd);border-radius:14px;padding:0.75rem 1.4rem;text-align:center;min-width:130px;box-shadow:${isAct?`0 4px 20px ${node.c}35,0 0 0 3px ${node.c}25`:`0 2px 8px ${node.c}20`};transition:box-shadow 0.3s">
        <div style="font-size:0.72rem;margin-bottom:0.1rem">${node.icon}</div>
        <div style="color:white;font-weight:700;font-size:${node.tier===0?'1rem':'0.88rem'};font-family:'DM Sans',sans-serif">${node.label}</div>
      </div>
      ${node.impact ? `<div style="display:flex;align-items:center;gap:0.25rem"><span style="font-size:0.82rem">${node.impactIcon}</span><span style="font-size:0.74rem;color:#64748b;font-weight:500">${node.impact}</span></div>` : ''}
    </div>`;
  }

  function buildDiagram() {
    return `<div style="background:white;border-radius:24px;padding:2rem 1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <div style="display:flex;justify-content:center;margin-bottom:0">${buildNode(NODES.fed)}</div>
      <div style="display:flex;justify-content:center;padding:0.5rem 0">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.2rem">
          <div style="width:2px;height:26px;background:linear-gradient(to bottom,#3b82f6,#8b5cf6);border-radius:1px"></div>
          <svg width="12" height="8"><path d="M 1 1 L 6 6 L 11 1" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div style="display:flex;justify-content:center;margin-bottom:0">${buildNode(NODES.treasury)}</div>
      <div style="display:flex;justify-content:center;padding:0.4rem 0 0.2rem">
        <svg width="340" height="38" viewBox="0 0 340 38" style="overflow:visible">
          <path d="M 170 0 L 170 12 Q 170 20 162 23 L 50 36" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 170 0 L 170 33" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 170 0 L 170 12 Q 170 20 178 23 L 290 36" fill="none" stroke="#eab308" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;padding:0 0.25rem">
        ${buildNode(NODES.mortgages)}${buildNode(NODES.corpBonds)}${buildNode(NODES.savings)}
      </div>
      <p style="text-align:center;font-size:0.74rem;color:#94a3b8;font-style:italic;margin-top:1.2rem;padding-top:0.8rem;border-top:1px solid #f1f5f9">Rate changes ripple through the entire economy</p>
    </div>`;
  }

  function buildDetail() {
    if (!act) return `<div style="background:white;border-radius:18px;padding:2rem;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <div style="font-size:2rem;margin-bottom:0.6rem;opacity:0.5">🏛️</div>
      <p style="font-size:0.88rem;font-weight:600;color:#334155;margin-bottom:0.3rem">Explore the flow</p>
      <p style="font-size:0.79rem;color:#94a3b8;line-height:1.6;margin-bottom:1.2rem">Click any node to learn how that rate connects to the broader economy.</p>
      <div style="padding:0.8rem;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;text-align:left">
        ${overline('Transmission Chain')}
        ${[{i:'🏛️',l:'Fed sets rate'},{i:'📜',l:'Treasuries adjust'},{i:'📡',l:'Markets reprice'},{i:'🌍',l:'Economy responds'}]
          .map(s => `<div style="display:flex;align-items:center;gap:0.45rem;padding:0.3rem 0"><span style="font-size:0.85rem">${s.i}</span><span style="font-size:0.76rem;color:#475569;font-weight:500">${s.l}</span></div>`).join('')}
      </div>
    </div>`;
    const n = NODES[act];
    return `<div style="background:white;border-radius:18px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid ${n.c}18;${fadeAnim()}">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <span style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${n.cL};border-radius:12px">${n.icon}</span>
        <div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;color:${n.c};margin:0">${n.label}</h3>
          <span style="font-size:0.67rem;color:#94a3b8;font-weight:500">${n.sub}</span>
        </div>
      </div>
      <p style="font-size:0.82rem;color:#475569;line-height:1.7;margin-bottom:0.8rem">${n.desc}</p>
      <div style="background:${n.c}08;border:1px solid ${n.c}15;border-radius:12px;padding:0.75rem;margin-bottom:0.8rem">
        ${overline('How it works')}
        <p style="font-size:0.78rem;color:#475569;line-height:1.65">${n.mech}</p>
      </div>
      ${overline('Key Effects')}
      <div style="display:flex;flex-direction:column;gap:0.28rem">${n.effects.map(e => factRow(e, n.c)).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div style="display:flex;gap:2rem;align-items:center;justify-content:center;flex-wrap:wrap">
      <div id="rf-diagram" style="flex:1 1 440px;max-width:520px">${buildDiagram()}</div>
      <div style="flex:1 1 280px;max-width:340px"><div id="rf-detail">${buildDetail()}</div></div>
    </div>`;

  function toggle(id) {
    act = act === id ? null : id;
    document.getElementById('rf-diagram').innerHTML = buildDiagram();
    document.getElementById('rf-detail').innerHTML = buildDetail();
    bindNodes();
  }
  function bindNodes() { container.querySelectorAll('.rf-node').forEach(n => n.addEventListener('click', () => toggle(n.dataset.id))); }
  bindNodes();
};

// ─── CHEAT SHEET 4: DUAL MANDATE ──────────────────────────────────────────────

CS_RENDERERS.dualMandate = function(container) {
  const MANDATES = {
    employment: {
      id:'employment', label:'Employment', sub:'Maximum Jobs', icon:'👷', c:'#10b981', cL:'#d1fae5', cD:'#059669',
      target:'Maximum sustainable employment',
      desc:'The Fed aims to foster labor market conditions at the highest level consistent with price stability. This doesn\'t mean zero unemployment — some friction is natural.',
      tools:['Lower interest rates to stimulate hiring','Quantitative easing to boost lending','Forward guidance to build confidence'],
      tradeoff:'Pushing employment too high can overheat the economy, driving wages and prices up in an inflationary spiral.',
      metrics:['Unemployment rate','Labor force participation','Job openings (JOLTS)','Wage growth'],
    },
    inflation: {
      id:'inflation', label:'Inflation', sub:'Stable Prices', icon:'📊', c:'#f97316', cL:'#ffedd5', cD:'#ea580c',
      target:'2% annual inflation (PCE)',
      desc:'The Fed targets 2% inflation as measured by the PCE index. This rate is optimal — high enough to avoid deflation, low enough to preserve purchasing power.',
      tools:['Raise interest rates to cool demand','Quantitative tightening to reduce liquidity','Hawkish communication to anchor expectations'],
      tradeoff:'Aggressive inflation-fighting via rate hikes can slow growth and increase unemployment, potentially triggering a recession.',
      metrics:['Core PCE index','CPI (headline & core)','Inflation expectations','Producer prices (PPI)'],
    },
  };
  let act = null, tilt = 0, tiltDir = 1, tiltInterval = null;

  function effectiveTilt() {
    if (act === 'employment') return -7;
    if (act === 'inflation') return 7;
    return tilt;
  }

  function buildScale() {
    const t = effectiveTilt();
    return `<div style="background:white;border-radius:24px;padding:1.8rem 1.5rem 1.2rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <div style="text-align:center;margin-bottom:1.2rem">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;border-radius:12px;padding:0.5rem 1rem">
          <span style="font-family:'JetBrains Mono',monospace;font-size:1.2rem;font-weight:700;color:#2563eb">2%</span>
          <div style="text-align:left"><div style="font-size:0.7rem;font-weight:600;color:#1e40af">Inflation Target</div><div style="font-size:0.6rem;color:#60a5fa">Price Stability Anchor</div></div>
        </div>
      </div>
      <svg viewBox="0 0 500 280" width="100%" style="display:block;overflow:visible">
        <defs>
          <linearGradient id="dm-pillar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#334155"/></linearGradient>
          <linearGradient id="dm-fed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>
        </defs>
        <rect x="200" y="228" width="100" height="7" rx="3.5" fill="#cbd5e1"/>
        <rect x="235" y="224" width="30" height="4" rx="2" fill="#94a3b8"/>
        <rect x="240" y="115" width="20" height="113" rx="4" fill="url(#dm-pillar)"/>
        <rect x="222" y="94" width="56" height="29" rx="9" fill="url(#dm-fed)" style="cursor:pointer" onclick=""/>
        <text x="250" y="113" text-anchor="middle" style="font-size:0.77rem;font-weight:700;fill:white;font-family:'DM Sans',sans-serif;pointer-events:none">The Fed</text>
        <g id="dm-beam" style="transform-origin:250px 115px;transform:rotate(${t}deg);transition:${act?'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)':'none'}">
          <rect x="40" y="111" width="420" height="8" rx="4" fill="#475569"/>
          <line x1="90" y1="119" x2="90" y2="158" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3"/>
          <line x1="410" y1="119" x2="410" y2="158" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3"/>
          <g class="dm-plate" data-id="employment" style="cursor:pointer">
            <ellipse cx="90" cy="167" rx="62" ry="16" fill="${act==='employment'?'#d1fae5':'#f0fdf4'}" stroke="#10b981" stroke-width="${act==='employment'?2.5:1.5}" style="transition:all 0.3s"/>
            <text x="90" y="165" text-anchor="middle" style="font-size:0.68rem;font-weight:700;fill:#059669;pointer-events:none">👷 Employment</text>
            <text x="90" y="179" text-anchor="middle" style="font-size:0.52rem;font-weight:500;fill:#64748b;text-transform:uppercase;letter-spacing:0.08em;pointer-events:none">Max Jobs</text>
          </g>
          <g class="dm-plate" data-id="inflation" style="cursor:pointer">
            <ellipse cx="410" cy="167" rx="62" ry="16" fill="${act==='inflation'?'#ffedd5':'#fffbeb'}" stroke="#f97316" stroke-width="${act==='inflation'?2.5:1.5}" style="transition:all 0.3s"/>
            <text x="410" y="165" text-anchor="middle" style="font-size:0.68rem;font-weight:700;fill:#ea580c;pointer-events:none">📊 Inflation</text>
            <text x="410" y="179" text-anchor="middle" style="font-size:0.52rem;font-weight:500;fill:#64748b;text-transform:uppercase;letter-spacing:0.08em;pointer-events:none">Stable Prices</text>
          </g>
          <polygon points="250,111 242,100 258,100" fill="#475569"/>
        </g>
      </svg>
      <p style="text-align:center;font-size:0.7rem;color:#94a3b8;font-style:italic;margin:0.5rem 0 0.8rem">⚖️ These goals often conflict — that's why the Fed's job is hard</p>
      <div style="display:flex;justify-content:center;gap:0.7rem;padding-top:0.8rem;border-top:1px solid #f1f5f9">
        ${Object.values(MANDATES).map(m => `<button class="dm-btn" data-id="${m.id}" style="display:flex;align-items:center;gap:0.35rem;padding:0.48rem 0.9rem;border-radius:9px;border:${act===m.id?`2px solid ${m.c}`:'2px solid transparent'};background:${act===m.id?m.cL:'#f8fafc'};cursor:pointer">
          <span style="font-size:0.82rem">${m.icon}</span>
          <span style="font-size:0.78rem;font-weight:600;color:${act===m.id?m.cD:'#64748b'}">${m.label}</span>
        </button>`).join('')}
      </div>
    </div>`;
  }

  function buildDetail() {
    if (!act) return `<div style="background:white;border-radius:18px;padding:2rem;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <div style="font-size:2rem;margin-bottom:0.6rem;opacity:0.5">⚖️</div>
      <p style="font-size:0.88rem;font-weight:600;color:#334155;margin-bottom:0.3rem">A delicate balance</p>
      <p style="font-size:0.79rem;color:#94a3b8;line-height:1.6;margin-bottom:1.2rem">Click either side of the scale to explore how the Fed navigates its two competing mandates.</p>
      <div style="display:flex;gap:0.5rem;justify-content:center">
        ${Object.values(MANDATES).map(m => `<div style="flex:1;padding:0.75rem;border-radius:12px;background:${m.cL};border:1px solid ${m.c}30;text-align:center">
          <div style="font-size:1.3rem;margin-bottom:0.3rem">${m.icon}</div>
          <div style="font-size:0.76rem;font-weight:700;color:${m.cD}">${m.label}</div>
          <div style="font-size:0.64rem;color:#64748b;margin-top:0.1rem">${m.sub}</div>
        </div>`).join('')}
      </div>
      <p style="font-size:0.74rem;color:#64748b;line-height:1.6;margin-top:0.8rem;padding:0.6rem;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">When the Fed lowers rates to boost jobs, it risks inflation. When it raises rates to fight inflation, it risks unemployment.</p>
    </div>`;
    const m = MANDATES[act];
    return `<div style="background:white;border-radius:18px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid ${m.c}18;${fadeAnim()}">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <span style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${m.cL};border-radius:12px">${m.icon}</span>
        <div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;color:${m.c};margin:0">${m.label}</h3>
          <span style="font-size:0.63rem;font-family:'JetBrains Mono',monospace;color:${m.cD};font-weight:500;background:${m.cL};padding:0.1rem 0.4rem;border-radius:5px">Target: ${m.target}</span>
        </div>
      </div>
      <p style="font-size:0.82rem;color:#475569;line-height:1.7;margin-bottom:0.8rem">${m.desc}</p>
      <div style="background:${m.c}08;border:1px solid ${m.c}15;border-radius:12px;padding:0.75rem;margin-bottom:0.8rem">
        ${overline("Fed's Tools")}
        ${m.tools.map(t => `<div style="display:flex;align-items:center;gap:0.35rem;padding:0.18rem 0"><span style="width:4px;height:4px;border-radius:50%;background:${m.c};flex-shrink:0;display:inline-block"></span><span style="font-size:0.75rem;color:#475569">${t}</span></div>`).join('')}
      </div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:0.75rem;margin-bottom:0.8rem">
        <p style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#dc2626;margin-bottom:0.3rem">⚠️ The Tradeoff</p>
        <p style="font-size:0.75rem;color:#7f1d1d;line-height:1.6">${m.tradeoff}</p>
      </div>
      ${overline('Key Metrics')}
      <div style="display:flex;flex-wrap:wrap;gap:0.28rem">${m.metrics.map(x => pillTag(x, '#475569', '#f8fafc')).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div style="display:flex;gap:2rem;align-items:center;justify-content:center;flex-wrap:wrap">
      <div id="dm-scale" style="flex:1 1 460px;max-width:540px">${buildScale()}</div>
      <div style="flex:1 1 280px;max-width:340px"><div id="dm-detail">${buildDetail()}</div></div>
    </div>`;

  function startTilt() {
    tiltInterval = setInterval(() => {
      if (act) return;
      tilt += 0.12 * tiltDir;
      if (tilt > 3.5) tiltDir = -1;
      if (tilt < -3.5) tiltDir = 1;
      const beam = document.getElementById('dm-beam');
      if (beam) beam.style.transform = `rotate(${tilt}deg)`;
    }, 50);
  }

  function toggle(id) {
    act = act === id ? null : id;
    clearInterval(tiltInterval);
    document.getElementById('dm-scale').innerHTML = buildScale();
    document.getElementById('dm-detail').innerHTML = buildDetail();
    if (!act) startTilt();
    bindAll();
  }
  function bindAll() {
    container.querySelectorAll('.dm-plate, .dm-btn').forEach(el => el.addEventListener('click', () => toggle(el.dataset.id)));
  }
  bindAll();
  startTilt();
};

// ─── CHEAT SHEET 5: RATE TIMELINE ─────────────────────────────────────────────

CS_RENDERERS.rateTimeline = function(container) {
  const PH = [
    { id:'spring', n:'Spring', s:'Cutting', icon:'🌱', c:'#10b981', dk:'#059669', cL:'#d1fae5',
      desc:'The Fed cuts rates aggressively to stimulate a slowing economy. Borrowing becomes cheaper, laying the groundwork for recovery.',
      rateAction:'Cutting rates', rateRange:'Heading toward cycle lows',
      env:['Economy weakening or in recession','Unemployment rising','Inflation falling or low','Risk aversion high'],
      strat:['Lock in long-term bonds at high yields','Accumulate equities at depressed prices','Extend fixed-rate debt duration','Overweight growth-sensitive sectors'] },
    { id:'summer', n:'Summer', s:'Peak Low', icon:'☀️', c:'#eab308', dk:'#ca8a04', cL:'#fef9c3',
      desc:'Rates reach their cycle bottom. Accommodative policy fuels recovery — credit flows freely, asset prices rise, and confidence rebuilds.',
      rateAction:'Holding at lows', rateRange:'Near zero or cycle floor',
      env:['Early expansion phase','Easy monetary conditions','Credit flowing freely','Asset prices rising sharply'],
      strat:['Maximize equity exposure','Favor cyclical over defensive','Use low rates to refinance debt','Real estate becomes attractive'] },
    { id:'autumn', n:'Autumn', s:'Hiking', icon:'🍂', c:'#f97316', dk:'#ea580c', cL:'#ffedd5',
      desc:'The Fed begins raising rates to prevent the economy from overheating. Tightening policy puts pressure on rate-sensitive assets.',
      rateAction:'Hiking rates', rateRange:'Moving through neutral',
      env:['Strong GDP growth','Inflation accelerating','Full or near-full employment','Fed turning hawkish'],
      strat:['Reduce duration in bond portfolios','Shift to value and quality stocks','Floating-rate debt becomes expensive','Cash and short-term bonds gain appeal'] },
    { id:'winter', n:'Winter', s:'Peak High', icon:'❄️', c:'#3b82f6', dk:'#2563eb', cL:'#dbeafe',
      desc:'Rates reach their cycle peak. Tight policy has cooled inflation but economic momentum is fading. The market begins pricing in future cuts.',
      rateAction:'Holding at highs', rateRange:'Restrictive territory',
      env:['Growth decelerating','Inflation easing from peaks','Credit conditions tightening','Yield curve likely inverted'],
      strat:['Lock in high yields on long bonds','Defensive equity positioning','Prepare for rate-cut beneficiaries','Watch for credit stress signals'] },
  ];
  const SW=580, SH=300, CX=50, CY=35, CW=490, CH=220;
  const toSvg = (px, py) => ({ x: CX+px*CW, y: CY+CH-py*CH });
  const pathPts = [
    {px:-0.02,py:0.28},{px:0.08,py:0.28},{px:0.22,py:0.65},{px:0.35,py:0.85},
    {px:0.48,py:0.72},{px:0.60,py:0.55},{px:0.72,py:0.42},{px:0.82,py:0.32},
    {px:0.95,py:0.28},{px:1.02,py:0.28},
  ];
  const svgPts = pathPts.map(p => toSvg(p.px, p.py));
  let pathD = `M ${svgPts[0].x} ${svgPts[0].y}`;
  for (let i=0; i<svgPts.length-1; i++) {
    const cpx = (svgPts[i].x + svgPts[i+1].x)/2;
    pathD += ` C ${cpx} ${svgPts[i].y}, ${cpx} ${svgPts[i+1].y}, ${svgPts[i+1].x} ${svgPts[i+1].y}`;
  }
  const phaseDots = [toSvg(0.08,0.28), toSvg(0.35,0.85), toSvg(0.60,0.55), toSvg(0.82,0.32)];
  const neutralY = CY + CH - 0.47*CH;
  let act = null;

  function buildChart() {
    const dots = PH.map((p,i) => {
      const pos = phaseDots[i];
      const isAct = act === i;
      const dim = act !== null && !isAct;
      const labelAbove = i === 1;
      const ly = labelAbove ? pos.y-22 : pos.y+22;
      const sy = labelAbove ? pos.y-10 : pos.y+34;
      return `<g class="rt-dot" data-i="${i}" style="cursor:pointer;opacity:${dim?0.2:1};transition:opacity 0.3s">
        ${isAct ? `<circle cx="${pos.x}" cy="${pos.y}" r="14" fill="none" stroke="${p.c}" stroke-width="2" opacity="0.35"/>` : ''}
        <rect x="${pos.x-50}" y="${labelAbove?pos.y-38:pos.y+6}" width="100" height="38" rx="10" fill="white" fill-opacity="0.88" stroke="${isAct?p.c:'transparent'}" stroke-width="1.5"/>
        <text x="${pos.x}" y="${ly}" text-anchor="middle" style="font-size:0.8rem;font-weight:700;fill:${p.dk};font-family:'DM Sans',sans-serif">${p.icon} ${p.n}</text>
        <text x="${pos.x}" y="${sy}" text-anchor="middle" style="font-size:0.58rem;font-weight:600;fill:${p.c};text-transform:uppercase;letter-spacing:0.08em">${p.s}</text>
        <circle cx="${pos.x}" cy="${pos.y}" r="${isAct?8:6}" fill="${p.c}" stroke="white" stroke-width="2.5"/>
      </g>`;
    }).join('');
    return `<div style="background:white;border-radius:24px;padding:1.2rem 1.2rem 0.6rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <svg viewBox="0 0 ${SW} ${SH}" width="100%" style="display:block;overflow:visible">
        <defs>
          <linearGradient id="rtGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#10b981"/><stop offset="33%" stop-color="#eab308"/>
            <stop offset="66%" stop-color="#f97316"/><stop offset="100%" stop-color="#3b82f6"/>
          </linearGradient>
          <clipPath id="rtClip"><rect x="${CX}" y="${CY-10}" width="${CW}" height="${CH+20}"/></clipPath>
        </defs>
        ${[0.25,0.5,0.75].map(v => `<line x1="${CX}" y1="${CY+CH-v*CH}" x2="${CX+CW}" y2="${CY+CH-v*CH}" stroke="#f1f5f9" stroke-width="1"/>`).join('')}
        <line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY+CH}" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${CX-8}" y="${CY+14}" text-anchor="end" style="font-size:0.62rem;fill:#94a3b8">Low</text>
        <text x="${CX-8}" y="${CY+CH-4}" text-anchor="end" style="font-size:0.62rem;fill:#94a3b8">High</text>
        <text x="12" y="${CY+CH/2}" text-anchor="middle" transform="rotate(-90,12,${CY+CH/2})" style="font-size:0.58rem;fill:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Fed Funds</text>
        <line x1="${CX}" y1="${neutralY}" x2="${CX+CW}" y2="${neutralY}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.5"/>
        <rect x="${CX+CW+4}" y="${neutralY-12}" width="48" height="20" rx="5" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${CX+CW+28}" y="${neutralY-4}" text-anchor="middle" style="font-size:0.47rem;fill:#94a3b8;font-weight:600;text-transform:uppercase">Neutral</text>
        <text x="${CX+CW+28}" y="${neutralY+6}" text-anchor="middle" style="font-size:0.58rem;fill:#64748b;font-family:'JetBrains Mono',monospace">~2.5%</text>
        <g clip-path="url(#rtClip)">
          <path d="${pathD}" fill="none" stroke="url(#rtGrad)" stroke-width="3" stroke-linecap="round"/>
        </g>
        ${dots}
      </svg>
      <div style="display:flex;justify-content:center;gap:0.5rem;margin-top:0.3rem;padding-top:0.6rem;border-top:1px solid #f1f5f9;flex-wrap:wrap">
        ${PH.map((p,i) => `<button class="rt-btn" data-i="${i}" style="display:flex;align-items:center;gap:0.3rem;padding:0.38rem 0.7rem;border-radius:7px;border:${act===i?`2px solid ${p.c}`:'2px solid transparent'};background:${act===i?p.cL:'transparent'};cursor:pointer">
          <span style="font-size:0.72rem">${p.icon}</span>
          <span style="font-size:0.74rem;font-weight:600;color:${act===i?p.dk:'#64748b'}">${p.n}</span>
        </button>`).join('')}
      </div>
      <p style="text-align:center;font-size:0.7rem;color:#94a3b8;font-style:italic;margin-top:0.5rem">Rates cycle between low (spring) and high (winter)</p>
    </div>`;
  }

  function buildDetail() {
    if (act === null) return placeholder('📈','Explore each phase','Click on any point along the rate cycle to see the environment and investment strategy.');
    const p = PH[act];
    return `<div style="background:white;border-radius:18px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid ${p.c}18;${fadeAnim()}">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <span style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${p.cL};border-radius:12px">${p.icon}</span>
        <div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;color:${p.c};margin:0">${p.n}</h3>
          <span style="font-size:0.62rem;font-family:'JetBrains Mono',monospace;color:${p.dk};font-weight:500;background:${p.cL};padding:0.1rem 0.4rem;border-radius:5px">${p.rateAction}</span>
        </div>
      </div>
      <p style="font-size:0.82rem;color:#475569;line-height:1.7;margin-bottom:0.8rem">${p.desc}</p>
      <div style="background:${p.c}08;border:1px solid ${p.c}15;border-radius:10px;padding:0.5rem 0.65rem;margin-bottom:0.8rem;display:flex;align-items:center;gap:0.45rem">
        <span style="font-size:0.82rem">📍</span>
        <div>
          <span style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${p.c}">Rate Position</span>
          <div style="font-size:0.76rem;color:#475569;font-weight:500">${p.rateRange}</div>
        </div>
      </div>
      ${overline('Environment')}
      <div style="display:flex;flex-wrap:wrap;gap:0.28rem;margin-bottom:0.8rem">${p.env.map(e => pillTag(e, p.dk, p.cL)).join('')}</div>
      ${overline('Strategy Playbook')}
      <div style="display:flex;flex-direction:column;gap:0.25rem">${p.strat.map(s => factRow(s, p.c)).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div style="display:flex;gap:2rem;align-items:center;justify-content:center;flex-wrap:wrap">
      <div id="rt-chart" style="flex:1 1 520px;max-width:640px">${buildChart()}</div>
      <div style="flex:1 1 280px;max-width:340px"><div id="rt-detail">${buildDetail()}</div></div>
    </div>`;

  function toggle(i) {
    act = act === i ? null : i;
    document.getElementById('rt-chart').innerHTML = buildChart();
    document.getElementById('rt-detail').innerHTML = buildDetail();
    bindAll();
  }
  function bindAll() {
    container.querySelectorAll('.rt-dot').forEach(d => d.addEventListener('click', () => toggle(+d.dataset.i)));
    container.querySelectorAll('.rt-btn').forEach(b => b.addEventListener('click', () => toggle(+b.dataset.i)));
  }
  bindAll();
};

// ─── CHEAT SHEET 6: CREDIT SPREAD ─────────────────────────────────────────────

CS_RENDERERS.creditSpread = function(container) {
  const SCENARIOS = [
    { id:'normal', label:'Normal Market', treasury:4.5, spread:3.5, c:'#64748b', cL:'#f1f5f9', icon:'📊',
      desc:'Typical market conditions with moderate risk appetite. Credit spreads are at historical averages, reflecting balanced growth expectations.', sentiment:'Neutral' },
    { id:'riskon', label:'Risk-ON', sub:'Spread Narrow', treasury:4.5, spread:1.5, c:'#10b981', cL:'#d1fae5', cD:'#059669', icon:'🟢',
      desc:'Investors are confident and reaching for yield. Spreads compress as demand for corporate bonds surges, pushing risk premiums to cycle lows.', sentiment:'Bullish',
      env:['Strong economic growth','Low default rates','Abundant liquidity','High investor confidence'],
      sigs:['Spreads below historical average','High-yield bond inflows rising','VIX at low levels','Credit default swaps tightening'] },
    { id:'riskoff', label:'Risk-OFF', sub:'Spread Wide', treasury:4.5, spread:6.5, c:'#ef4444', cL:'#fee2e2', cD:'#dc2626', icon:'🔴',
      desc:'Fear dominates. Investors flee corporate bonds for the safety of Treasuries, causing spreads to blow out as risk premiums spike dramatically.', sentiment:'Bearish',
      env:['Economic slowdown or recession','Rising default expectations','Liquidity drying up','Flight to quality'],
      sigs:['Spreads above historical average','High-yield bond outflows','VIX elevated','Credit default swaps widening'] },
  ];
  const COMPS = {
    treasury: { id:'treasury', label:'Treasury', icon:'🏛️', c:'#3b82f6', cL:'#dbeafe', cD:'#2563eb', sub:'Risk-Free Rate',
      desc:'The baseline return on lending to the U.S. government — considered the safest investment in the world. All other yields are built on top of this foundation.',
      factors:['Fed funds rate','Inflation expectations','Global demand for safety','Government debt supply'] },
    spread: { id:'spread', label:'Risk Premium', icon:'⚡', c:'#f97316', cL:'#ffedd5', cD:'#ea580c', sub:'Credit Spread',
      desc:'The extra yield investors demand for taking on the risk that a corporation might default. This spread widens and narrows based on market confidence.',
      factors:['Credit quality of issuer','Market risk appetite','Default probability','Liquidity conditions'] },
    corp: { id:'corp', label:'Corp Bond', icon:'🏢', c:'#6366f1', cL:'#e0e7ff', cD:'#4f46e5', sub:'Total Yield',
      desc:'The total return an investor earns from a corporate bond — the sum of the risk-free Treasury rate and the credit spread.',
      factors:['Treasury yield (base)','Credit spread (risk)','Bond maturity/duration','Issuer credit rating'] },
  };
  let actSc = 0, actComp = null, curSpread = 3.5, curTreasury = 4.5, animId = null;

  function animateTo(targetSpread, targetTreasury) {
    if (animId) cancelAnimationFrame(animId);
    const startS = curSpread, startT = curTreasury;
    const dur = 600; let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts-start)/dur, 1);
      const ease = 1 - Math.pow(1-p, 3);
      curSpread = startS + (targetSpread-startS)*ease;
      curTreasury = startT + (targetTreasury-startT)*ease;
      updateBars();
      if (p < 1) animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
  }

  function updateBars() {
    const maxRate = 12;
    const tW = (curTreasury/maxRate)*100;
    const sW = (curSpread/maxRate)*100;
    const sc = SCENARIOS[actSc];
    const sColor = sc.id==='riskoff' ? '#ef4444' : sc.id==='riskon' ? '#10b981' : '#f97316';
    const els = {
      tbar: document.getElementById('cs-tbar'), sbar: document.getElementById('cs-sbar'),
      tlbl: document.getElementById('cs-tlabel'), slbl: document.getElementById('cs-slabel'),
      tval: document.getElementById('cs-tval'), sval: document.getElementById('cs-sval'), cval: document.getElementById('cs-cval'),
    };
    if (els.tbar) { els.tbar.style.width = tW+'%'; if (els.tlbl) els.tlbl.textContent = curTreasury.toFixed(1)+'%'; }
    if (els.sbar) {
      els.sbar.style.width = sW+'%';
      els.sbar.style.background = `linear-gradient(135deg,${sColor},${sColor}cc)`;
      if (els.slbl) els.slbl.textContent = curSpread.toFixed(1)+'%';
    }
    if (els.tval) els.tval.textContent = curTreasury.toFixed(1)+'%';
    if (els.sval) els.sval.textContent = curSpread.toFixed(1)+'%';
    if (els.cval) els.cval.textContent = (curTreasury+curSpread).toFixed(1)+'%';
  }

  function buildDiagram() {
    const sc = SCENARIOS[actSc];
    const maxRate = 12;
    const tW = (curTreasury/maxRate)*100, sW = (curSpread/maxRate)*100;
    const sColor = sc.id==='riskoff' ? '#ef4444' : sc.id==='riskon' ? '#10b981' : '#f97316';
    return `<div style="background:white;border-radius:24px;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <div style="display:flex;align-items:center;justify-content:center;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <div class="cs-card" data-id="treasury" style="cursor:pointer;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:14px;padding:1rem 1.4rem;text-align:center;min-width:118px;box-shadow:0 4px 12px rgba(59,130,246,0.25);transition:transform 0.2s;transform:${actComp==='treasury'?'scale(1.05)':'scale(1)'}">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:0.1rem">🏛️ Treasury</div>
          <div id="cs-tval" style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:white">${curTreasury.toFixed(1)}%</div>
        </div>
        <div style="width:32px;height:32px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#94a3b8;flex-shrink:0">+</div>
        <div class="cs-card" data-id="spread" style="cursor:pointer;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:14px;padding:1rem 1.4rem;text-align:center;min-width:118px;box-shadow:0 4px 12px rgba(249,115,22,0.25);transition:transform 0.2s;transform:${actComp==='spread'?'scale(1.05)':'scale(1)'}">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:0.1rem">⚡ Risk Premium</div>
          <div id="cs-sval" style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:white">${curSpread.toFixed(1)}%</div>
        </div>
        <div style="width:32px;height:32px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#94a3b8;flex-shrink:0">=</div>
        <div class="cs-card" data-id="corp" style="cursor:pointer;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:14px;padding:1rem 1.4rem;text-align:center;min-width:118px;box-shadow:0 4px 12px rgba(99,102,241,0.25);transition:transform 0.2s;transform:${actComp==='corp'?'scale(1.05)':'scale(1)'}">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:0.1rem">🏢 Corp Bond</div>
          <div id="cs-cval" style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:white">${(curTreasury+curSpread).toFixed(1)}%</div>
        </div>
      </div>
      <div style="margin-bottom:1.4rem;padding:0 0.25rem">
        <div style="display:flex;height:40px;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;background:#f8fafc">
          <div id="cs-tbar" style="width:${tW}%;background:linear-gradient(135deg,#3b82f6,#60a5fa);display:flex;align-items:center;justify-content:center;transition:width 0.6s cubic-bezier(0.4,0,0.2,1)">
            <span id="cs-tlabel" style="font-size:0.7rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace">${curTreasury.toFixed(1)}%</span>
          </div>
          <div id="cs-sbar" style="width:${sW}%;background:linear-gradient(135deg,${sColor},${sColor}cc);display:flex;align-items:center;justify-content:center;border-left:2px solid rgba(255,255,255,0.3);transition:width 0.6s cubic-bezier(0.4,0,0.2,1),background 0.6s ease">
            <span id="cs-slabel" style="font-size:0.7rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace">${curSpread.toFixed(1)}%</span>
          </div>
        </div>
        <div style="display:flex;margin-top:0.3rem">
          <div style="width:${tW}%;text-align:center;transition:width 0.6s;font-size:0.6rem;color:#3b82f6;font-weight:600">Treasury</div>
          <div style="width:${sW}%;text-align:center;transition:width 0.6s;font-size:0.6rem;color:${sColor};font-weight:600">Spread</div>
        </div>
      </div>
      <div style="display:flex;gap:0.45rem;justify-content:center;flex-wrap:wrap;margin-bottom:0.8rem">
        ${SCENARIOS.map((s,i) => `<button class="cs-sc-btn" data-i="${i}" style="display:flex;align-items:center;gap:0.35rem;padding:0.5rem 0.9rem;border-radius:9px;border:${actSc===i?`2px solid ${s.c}`:'2px solid #e2e8f0'};background:${actSc===i?s.cL:'white'};cursor:pointer;transition:all 0.2s">
          <span style="font-size:0.78rem">${s.icon}</span>
          <div style="text-align:left">
            <div style="font-size:0.76rem;font-weight:700;color:${actSc===i?(s.cD||s.c):'#334155'}">${s.label}</div>
            ${s.sub ? `<div style="font-size:0.6rem;color:${actSc===i?(s.cD||s.c):'#94a3b8'};font-weight:500">${s.sub}</div>` : ''}
          </div>
        </button>`).join('')}
      </div>
      <p style="text-align:center;font-size:0.7rem;color:#94a3b8;font-style:italic">Wider = market fears defaults · Narrow = confidence is high</p>
    </div>`;
  }

  function buildDetail() {
    if (actComp) {
      const c = COMPS[actComp];
      return `<div style="background:white;border-radius:18px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid ${c.c}18;${fadeAnim()}">
        <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
          <span style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${c.cL};border-radius:12px">${c.icon}</span>
          <div>
            <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;color:${c.c};margin:0">${c.label}</h3>
            <span style="font-size:0.65rem;color:#94a3b8;font-weight:500">${c.sub}</span>
          </div>
        </div>
        <p style="font-size:0.82rem;color:#475569;line-height:1.7;margin-bottom:0.8rem">${c.desc}</p>
        ${overline('Key Drivers')}
        <div style="display:flex;flex-direction:column;gap:0.25rem">${c.factors.map(f => factRow(f, c.c)).join('')}</div>
      </div>`;
    }
    const sc = SCENARIOS[actSc];
    if (sc.id === 'normal') return `<div style="background:white;border-radius:18px;padding:2rem;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid #e2e8f0">
      <div style="font-size:2rem;margin-bottom:0.6rem;opacity:0.5">💳</div>
      <p style="font-size:0.88rem;font-weight:600;color:#334155;margin-bottom:0.3rem">Explore the spread</p>
      <p style="font-size:0.79rem;color:#94a3b8;line-height:1.6;margin-bottom:1.2rem">Click any card in the equation to learn about each component, or toggle between scenarios to see how spreads react.</p>
      <div style="padding:0.85rem;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;text-align:left">
        ${overline('The Formula')}
        <div style="display:flex;align-items:center;gap:0.35rem;justify-content:center;padding:0.3rem 0">
          <span style="font-size:0.76rem;font-weight:600;color:#3b82f6">🏛️ Treasury</span>
          <span style="color:#cbd5e1">+</span>
          <span style="font-size:0.76rem;font-weight:600;color:#f97316">⚡ Spread</span>
          <span style="color:#cbd5e1">=</span>
          <span style="font-size:0.76rem;font-weight:600;color:#6366f1">🏢 Corp Yield</span>
        </div>
        <div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid #e2e8f0">
          <div style="display:flex;justify-content:space-between;padding:0.2rem 0"><span style="font-size:0.7rem;color:#64748b">🟢 Risk-ON</span><span style="font-size:0.7rem;color:#10b981;font-weight:600">Spreads narrow</span></div>
          <div style="display:flex;justify-content:space-between;padding:0.2rem 0"><span style="font-size:0.7rem;color:#64748b">🔴 Risk-OFF</span><span style="font-size:0.7rem;color:#ef4444;font-weight:600">Spreads widen</span></div>
        </div>
      </div>
    </div>`;
    return `<div style="background:white;border-radius:18px;padding:1.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 28px rgba(0,0,0,0.06);border:1px solid ${sc.c}18;${fadeAnim()}">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <span style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:${sc.cL};border-radius:12px">${sc.icon}</span>
        <div>
          <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;color:${sc.c};margin:0">${sc.label}</h3>
          <span style="font-size:0.62rem;font-family:'JetBrains Mono',monospace;color:${sc.cD};font-weight:500;background:${sc.cL};padding:0.1rem 0.4rem;border-radius:5px">Spread: ${sc.spread.toFixed(1)}% · ${sc.sentiment}</span>
        </div>
      </div>
      <p style="font-size:0.82rem;color:#475569;line-height:1.7;margin-bottom:0.8rem">${sc.desc}</p>
      ${overline('Environment')}
      <div style="display:flex;flex-wrap:wrap;gap:0.28rem;margin-bottom:0.8rem">${sc.env.map(e => pillTag(e, sc.cD, sc.cL)).join('')}</div>
      ${overline('What to Watch')}
      <div style="display:flex;flex-direction:column;gap:0.25rem">${sc.sigs.map(s => factRow(s, sc.c)).join('')}</div>
    </div>`;
  }

  function rerender() {
    document.getElementById('cs-diagram').innerHTML = buildDiagram();
    document.getElementById('cs-detail').innerHTML = buildDetail();
    bindAll();
    animateTo(SCENARIOS[actSc].spread, SCENARIOS[actSc].treasury);
  }

  container.innerHTML = `${FADE_STYLE}
    <div style="display:flex;gap:2rem;align-items:center;justify-content:center;flex-wrap:wrap">
      <div id="cs-diagram" style="flex:1 1 480px;max-width:580px">${buildDiagram()}</div>
      <div style="flex:1 1 280px;max-width:340px"><div id="cs-detail">${buildDetail()}</div></div>
    </div>`;

  function bindAll() {
    container.querySelectorAll('.cs-sc-btn').forEach(b => b.addEventListener('click', () => {
      actSc = +b.dataset.i; actComp = null; rerender();
    }));
    container.querySelectorAll('.cs-card').forEach(c => c.addEventListener('click', () => {
      actComp = actComp === c.dataset.id ? null : c.dataset.id;
      document.getElementById('cs-detail').innerHTML = buildDetail();
      // re-bind since we only updated detail
      container.querySelectorAll('.cs-sc-btn').forEach(b2 => b2.addEventListener('click', () => {
        actSc = +b2.dataset.i; actComp = null; rerender();
      }));
    }));
  }
  bindAll();
};

// ─── INDICATOR EXPLAINERS ─────────────────────────────────────────────────────

function renderIndicators() {
  const grid = document.getElementById('indicators-grid');
  if (!grid) return;
  const INDS = [
    { name:'Yield Curve (T10Y2Y)', icon:'📐', color:'#3b82f6', bg:'#eff6ff',
      what:'The difference between 10-year and 2-year Treasury yields. Measures market expectations for growth vs. short-term policy.',
      how:[{r:'> +0.5%', m:'Normal — healthy expansion, banks profit from lending'},
           {r:'0% to +0.5%', m:'Flat — uncertainty, potential inflection point'},
           {r:'< 0%', m:'Inverted — recession warning, historically very reliable signal'}],
      signals:'Spring/Summer', redFlag:'< -0.5% for 3+ months' },
    { name:'Fed Funds Rate', icon:'🏛️', color:'#8b5cf6', bg:'#f5f3ff',
      what:'The overnight interbank lending rate set by the FOMC at 8 meetings per year. Anchors the entire rate structure.',
      how:[{r:'Cutting cycle', m:'Spring — policy loosening, economy needs stimulus'},
           {r:'At cycle low', m:'Late Spring/Summer — max accommodation, recovery underway'},
           {r:'Hiking cycle', m:'Autumn — tightening, fighting inflation, strong economy'},
           {r:'At cycle high', m:'Late Autumn/Winter — restrictive, cooling demand'}],
      signals:'All seasons', redFlag:'3+ hikes of 50+ bps (aggressive tightening)' },
    { name:'CPI / PCE Inflation', icon:'📈', color:'#f97316', bg:'#fff7ed',
      what:'Consumer Price Index (CPI) and Personal Consumption Expenditures (PCE) measure how fast prices are rising across the economy.',
      how:[{r:'< 2%', m:'Below target — deflationary pressure, accommodative Fed likely'},
           {r:'2% ± 0.5%', m:'On target — Goldilocks zone, stable policy possible'},
           {r:'2.5–4%', m:'Elevated — Fed attention, potential hikes ahead'},
           {r:'> 4%', m:'Hot — aggressive Fed response, Summer/Autumn environment'}],
      signals:'Summer → Autumn transition', redFlag:'Core PCE > 4% with rising expectations' },
    { name:'NFP / Unemployment', icon:'👷', color:'#10b981', bg:'#f0fdf4',
      what:'Nonfarm Payrolls (NFP) shows monthly job additions. Unemployment rate shows % of labor force actively seeking work.',
      how:[{r:'NFP > +200K/mo', m:'Strong — Summer indicator, economy running hot'},
           {r:'NFP +100–200K', m:'Healthy — sustainable growth pace'},
           {r:'NFP < 0', m:'Job losses — Winter/Spring signal, recession warning'},
           {r:'UNRATE > 5%', m:'Rising unemployment — Spring or Winter signal'}],
      signals:'Winter → Spring transition', redFlag:'NFP negative for 2+ consecutive months' },
    { name:'High-Yield Spread (BAMLH)', icon:'⚡', color:'#eab308', bg:'#fefce8',
      what:'The extra yield HY bonds pay vs. Treasuries. Measures market confidence and credit risk appetite in real time.',
      how:[{r:'< 300 bps', m:'Risk-ON — Summer, tight spreads, credit confidence high'},
           {r:'300–450 bps', m:'Normal range — moderate credit conditions'},
           {r:'450–600 bps', m:'Widening — Autumn warning, stress emerging'},
           {r:'> 600 bps', m:'Wide — Winter crisis mode, default fears rising'}],
      signals:'Autumn → Winter stress', redFlag:'Rapid +200 bps widening in < 2 months' },
    { name:'Fed Balance Sheet (WALCL)', icon:'📋', color:'#64748b', bg:'#f8fafc',
      what:'Total assets held by the Federal Reserve — primarily Treasury bonds and MBS. Reflects the QE/QT cycle of money supply management.',
      how:[{r:'Expanding (QE)', m:'Spring/Winter — stimulus mode, money supply growing'},
           {r:'Stable', m:'Neutral — maintenance mode, no major policy shift'},
           {r:'Shrinking (QT)', m:'Autumn — tightening, draining liquidity from system'}],
      signals:'Policy direction confirmation', redFlag:'Rapid contraction > $100B/month' },
  ];
  grid.innerHTML = INDS.map(ind => `<div style="background:white;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden">
    <div style="background:${ind.bg};padding:0.85rem 1.2rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:0.6rem">
      <span style="font-size:1.3rem">${ind.icon}</span>
      <h3 style="font-size:0.93rem;font-weight:700;color:#0f172a;margin:0;font-family:'DM Sans',sans-serif">${ind.name}</h3>
    </div>
    <div style="padding:1rem 1.2rem">
      <p style="font-size:0.77rem;color:#64748b;margin-bottom:0.8rem;line-height:1.5">${ind.what}</p>
      <p style="font-size:0.62rem;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin-bottom:0.4rem">How to Read It</p>
      <div style="display:flex;flex-direction:column;gap:0.22rem;margin-bottom:0.8rem">
        ${ind.how.map(h => `<div style="display:flex;align-items:flex-start;gap:0.5rem">
          <span style="font-size:0.64rem;font-family:'JetBrains Mono',monospace;font-weight:600;color:${ind.color};background:${ind.bg};padding:0.15rem 0.4rem;border-radius:5px;white-space:nowrap;flex-shrink:0">${h.r}</span>
          <span style="font-size:0.73rem;color:#475569;line-height:1.4">${h.m}</span>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:0.3rem">
          <span style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">Signals:</span>
          <span style="font-size:0.68rem;font-weight:600;color:${ind.color}">${ind.signals}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.3rem">
          <span style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">🚨</span>
          <span style="font-size:0.68rem;color:#ef4444">${ind.redFlag}</span>
        </div>
      </div>
    </div>
  </div>`).join('');
}

// ─── 8 PHASES GRID ────────────────────────────────────────────────────────────

async function renderPhases(currentSeasonData) {
  const grid = document.getElementById('phases-grid');
  if (!grid) return;
  let phases = null;
  try {
    const res = await fetch('/api/phases');
    const data = await res.json();
    phases = data.phases;
  } catch (e) {
    console.error('Failed to load phases:', e);
  }
  if (!phases) {
    grid.innerHTML = '<div style="grid-column:span 2;text-align:center;color:#94a3b8;padding:2rem">Could not load phase data.</div>';
    return;
  }
  const SC = { spring:'#10b981', summer:'#eab308', autumn:'#f97316', winter:'#3b82f6' };
  const BG = { spring:'#ecfdf5', summer:'#fefce8', autumn:'#fff7ed', winter:'#eff6ff' };
  const ICON = { spring:'🌱', summer:'☀️', autumn:'🍂', winter:'❄️' };
  const currentKey = currentSeasonData ? `${currentSeasonData.season}-${currentSeasonData.phase}` : null;
  grid.innerHTML = phases.map(p => {
    const c = SC[p.season] || '#64748b';
    const bg = BG[p.season] || '#f8fafc';
    const icon = ICON[p.season] || '📊';
    const isCurrent = currentKey === `${p.season}-${p.phase}`;
    const topSectors = (p.sectors||[]).filter(s => s.weight === 'overweight').slice(0,3);
    return `<div style="background:white;border-radius:16px;border:${isCurrent?`2px solid ${c}`:'1px solid #e2e8f0'};box-shadow:0 1px 3px rgba(0,0,0,0.04)${isCurrent?`,0 0 0 4px ${c}12`:''};overflow:hidden">
      <div style="background:${c};padding:0.85rem 1.2rem;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="font-size:1.2rem">${icon}</span>
          <div>
            <div style="font-size:0.9rem;font-weight:700;color:white;font-family:'Playfair Display',Georgia,serif">${p.phase.charAt(0).toUpperCase()+p.phase.slice(1)} ${p.season.charAt(0).toUpperCase()+p.season.slice(1)}</div>
            <div style="font-size:0.62rem;color:rgba(255,255,255,0.8);font-weight:500">${p.setup||''}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.22rem">
          ${isCurrent ? `<span style="background:white;color:${c};font-size:0.58rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:20px;letter-spacing:0.08em">CURRENT</span>` : ''}
          <span style="background:rgba(0,0,0,0.18);color:white;font-size:0.58rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:20px">${p.riskLevel||''}</span>
        </div>
      </div>
      <div style="padding:1rem 1.2rem">
        <p style="font-size:0.77rem;color:#475569;line-height:1.5;margin-bottom:0.75rem">${p.setupDescription||''}</p>
        <p style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin-bottom:0.35rem">Top Sectors</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.6rem">${topSectors.length ? topSectors.map(s => `<span style="padding:0.18rem 0.5rem;border-radius:20px;font-size:0.67rem;font-weight:500;background:${bg};color:${c}">${s.name}</span>`).join('') : '<span style="font-size:0.7rem;color:#94a3b8">—</span>'}</div>
        <div style="display:flex;gap:0.35rem;align-items:center;flex-wrap:wrap">
          <span style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">Analog:</span>
          <span style="font-size:0.67rem;color:#64748b">${p.historicalAnalog||'—'}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ─── ALLOCATIONS GRID ─────────────────────────────────────────────────────────

async function renderAllocations() {
  const grid = document.getElementById('allocations-grid');
  if (!grid) return;
  let phases = null;
  try {
    const res = await fetch('/api/phases');
    const data = await res.json();
    phases = data.phases;
  } catch {}
  if (!phases) {
    grid.innerHTML = '<div style="grid-column:span 2;text-align:center;color:#94a3b8;padding:2rem">Could not load allocation data.</div>';
    return;
  }
  const SC = { spring:'#10b981', summer:'#eab308', autumn:'#f97316', winter:'#3b82f6' };
  grid.innerHTML = phases.map(p => {
    const c = SC[p.season] || '#64748b';
    const alloc = p.allocation || {};
    const bars = [
      { label:'Equities', pct: alloc.equities?.pct || 0, detail: alloc.equities?.detail || '', c:'#3b82f6' },
      { label:'Bonds',    pct: alloc.bonds?.pct    || 0, detail: alloc.bonds?.detail    || '', c:'#10b981' },
      { label:'Cash',     pct: alloc.cash?.pct     || 0, detail: alloc.cash?.detail     || '', c:'#eab308' },
      { label:'Alts',     pct: alloc.alts?.pct     || 0, detail: alloc.alts?.detail     || '', c:'#8b5cf6' },
    ];
    return `<div style="background:white;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden">
      <div style="padding:0.75rem 1.2rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:0.88rem;font-weight:700;color:#0f172a">${p.phase.charAt(0).toUpperCase()+p.phase.slice(1)} ${p.season.charAt(0).toUpperCase()+p.season.slice(1)}</div>
        <span style="font-size:0.65rem;font-weight:600;color:${c};background:${c}15;padding:0.15rem 0.45rem;border-radius:20px">${p.riskLevel||''}</span>
      </div>
      <div style="padding:0.85rem 1.2rem">
        <div style="display:flex;height:26px;border-radius:7px;overflow:hidden;margin-bottom:0.55rem">
          ${bars.filter(b => b.pct > 0).map(b => `<div style="width:${b.pct}%;background:${b.c};display:flex;align-items:center;justify-content:center" title="${b.label}: ${b.pct}%">
            ${b.pct >= 12 ? `<span style="font-size:0.58rem;font-weight:700;color:white">${b.pct}%</span>` : ''}
          </div>`).join('')}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.45rem;margin-bottom:0.65rem">
          ${bars.filter(b => b.pct > 0).map(b => `<div style="display:flex;align-items:center;gap:0.25rem">
            <span style="width:8px;height:8px;border-radius:2px;background:${b.c};display:inline-block"></span>
            <span style="font-size:0.67rem;color:#64748b;font-weight:500">${b.label} <strong style="color:#334155">${b.pct}%</strong></span>
          </div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.22rem">
          ${bars.filter(b => b.pct > 0 && b.detail).map(b => `<div style="font-size:0.67rem;color:#64748b;line-height:1.4"><strong style="color:${b.c}">${b.label}:</strong> ${b.detail}</div>`).join('')}
        </div>
        ${p.equityStyle ? `<div style="margin-top:0.5rem;padding:0.38rem 0.6rem;background:#f8fafc;border-radius:7px;font-size:0.67rem;color:#475569"><strong>Style:</strong> ${p.equityStyle}</div>` : ''}
        ${p.bondDuration ? `<div style="margin-top:0.22rem;padding:0.38rem 0.6rem;background:#f8fafc;border-radius:7px;font-size:0.67rem;color:#475569"><strong>Duration:</strong> ${p.bondDuration}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ─── HISTORICAL EXAMPLES ──────────────────────────────────────────────────────

function renderHistory() {
  const grid = document.getElementById('history-grid');
  if (!grid) return;
  const EXAMPLES = [
    { title:'1994–1996: Insurance Cuts', icon:'🛡️', color:'#22c55e', bg:'#f0fdf4',
      timeline:[{y:'1994',s:'autumn',l:'Autumn'},{y:'1995',s:'winter',l:'Winter'},{y:'1995–96',s:'spring',l:'Spring'}],
      stats:[{k:'Rate cuts',v:'75 bps (3 cuts)'},{k:'GDP',v:'+2.5% (no recession)'},{k:'S&P 500',v:'+34% (2 yrs)'},{k:'UNRATE',v:'6.1% → 5.4%'}],
      lesson:'The Fed can cut rates as "insurance" against slowdown without a recession. When it works, equities soar. The 1995 soft landing remains the gold standard of monetary policy.' },
    { title:'2000–2003: Dot-com Bust', icon:'💻', color:'#f97316', bg:'#fff7ed',
      timeline:[{y:'1999–00',s:'autumn',l:'Late Autumn'},{y:'2001',s:'winter',l:'Winter'},{y:'2001–02',s:'spring',l:'Spring'}],
      stats:[{k:'Nasdaq peak-to-trough',v:'-78%'},{k:'Rate cuts',v:'-550 bps (3 yrs)'},{k:'Unemployment',v:'3.8% → 6.3%'},{k:'Recession',v:'8 months (2001)'}],
      lesson:'Valuations matter more than rates in a true bubble bust. Aggressive cuts helped eventually, but the damage to equity multiples took years to heal. Quality and defensives dramatically outperformed growth.' },
    { title:'2008–2009: Global Financial Crisis', icon:'🏦', color:'#3b82f6', bg:'#eff6ff',
      timeline:[{y:'2007–08',s:'autumn',l:'Late Autumn'},{y:'2008–09',s:'winter',l:'Deep Winter'},{y:'2009+',s:'spring',l:'Spring'}],
      stats:[{k:'S&P 500 decline',v:'-57% peak to trough'},{k:'Rate cuts',v:'0.25% (near zero)'},{k:'Unemployment peak',v:'10%'},{k:'QE launched',v:'$1.75T (QE1)'}],
      lesson:'Credit crises are different from recessions — the financial system itself breaks. Zero interest rate policy plus QE was needed. Those who bought equities in March 2009 saw 400%+ gains over the next decade.' },
    { title:'2020–2022: COVID Shock & Inflation', icon:'🦠', color:'#8b5cf6', bg:'#f5f3ff',
      timeline:[{y:'2020 Q1',s:'winter',l:'Winter'},{y:'2020 Q2',s:'spring',l:'Spring'},{y:'2021',s:'summer',l:'Summer'},{y:'2022',s:'autumn',l:'Autumn'}],
      stats:[{k:'Rate range',v:'0.25% → 5.5% in 2 yrs'},{k:'CPI peak',v:'9.1% (Jun 2022)'},{k:'QE peak',v:'$9T balance sheet'},{k:'S&P 2020–21',v:'+116% from trough'}],
      lesson:'The fastest rate hiking cycle since the 1980s followed the most extreme stimulus ever deployed. V-shape recoveries reward aggressive risk-taking early. The inflation lag from fiscal + monetary policy was badly underestimated.' },
  ];
  const SC = { spring:'#10b981', summer:'#eab308', autumn:'#f97316', winter:'#3b82f6' };
  grid.innerHTML = EXAMPLES.map(ex => `<div style="background:white;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden">
    <div style="background:${ex.color};padding:0.85rem 1.2rem;display:flex;align-items:center;gap:0.5rem">
      <span style="font-size:1.3rem">${ex.icon}</span>
      <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:0.95rem;font-weight:700;color:white;margin:0">${ex.title}</h3>
    </div>
    <div style="padding:1rem 1.2rem">
      <div style="display:flex;gap:0.22rem;margin-bottom:0.9rem;align-items:center;flex-wrap:wrap">
        ${ex.timeline.map((t,i) => `${i>0?'<span style="color:#e2e8f0;font-size:0.7rem">→</span>':''}<div style="flex:1;min-width:52px;background:${SC[t.s]||'#94a3b8'};border-radius:5px;padding:0.2rem 0.3rem;text-align:center">
          <div style="font-size:0.55rem;color:rgba(255,255,255,0.85);font-weight:600;white-space:nowrap">${t.y}</div>
          <div style="font-size:0.52rem;color:white;font-weight:700;white-space:nowrap">${t.l}</div>
        </div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.32rem;margin-bottom:0.8rem">
        ${ex.stats.map(s => `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.38rem 0.6rem">
          <div style="font-size:0.57rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">${s.k}</div>
          <div style="font-size:0.76rem;font-weight:700;color:#0f172a;font-family:'JetBrains Mono',monospace">${s.v}</div>
        </div>`).join('')}
      </div>
      <div style="background:${ex.bg};border-radius:10px;padding:0.65rem 0.8rem;border:1px solid ${ex.color}22">
        <p style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${ex.color};margin-bottom:0.3rem">💡 Key Lesson</p>
        <p style="font-size:0.75rem;color:#475569;line-height:1.55">${ex.lesson}</p>
      </div>
    </div>
  </div>`).join('');
}

// ─── GLOSSARY ─────────────────────────────────────────────────────────────────

async function loadGlossary() {
  console.log('[Learn] Fetching /api/glossary…');
  try {
    const res = await fetch('/api/glossary');
    const data = await res.json();
    console.log('[Learn] Glossary loaded:', data.terms?.length, 'terms');
    renderGlossary(data.terms);
  } catch (e) {
    console.error('[Learn] Glossary fetch failed:', e);
    const el = document.getElementById('glossary-container');
    if (el) el.innerHTML = '<div class="p-4 text-red-500 text-sm">Failed to load glossary — server may not be running.</div>';
  }
}

function renderGlossary(terms) {
  const container = document.getElementById('glossary-container');
  if (!container) return;
  container.innerHTML = terms.map(term => `
    <div class="accordion-item">
      <div class="accordion-header px-5 py-3">
        <div class="font-semibold text-gray-800 text-sm">${term.term}</div>
        <svg class="accordion-icon w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      <div class="accordion-content px-5 py-3 bg-gray-50 text-sm space-y-2">
        <p class="text-gray-700 leading-relaxed">${term.definition}</p>
        <div class="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
          <span class="text-amber-500 flex-shrink-0 text-base">💡</span>
          <p class="text-amber-900 text-sm leading-relaxed"><em>${term.analogy}</em></p>
        </div>
      </div>
    </div>
  `).join('');
  setupAccordion(container);
}

// ─── IN-PAGE NAV SCROLL TRACKING ──────────────────────────────────────────────

function setupScrollNav() {
  const links = document.querySelectorAll('#learn-nav .learn-nav-link');
  if (!links.length) return;
  const sections = ['section-cheatsheets','section-indicators','section-phases','section-allocations','section-history','section-glossary'];
  function updateActive() {
    const scrollY = window.scrollY + 220;
    let current = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) current = id;
    }
    links.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

// ─── THEME LOADER ─────────────────────────────────────────────────────────────

async function loadTheme() {
  console.log('[Learn] Fetching /api/data for theme…');
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log('[Learn] Theme data:', data.season?.season, data.season?.phase);
    applyTheme(data.season.season, data.season.phase);
    return data.season;
  } catch (e) {
    console.warn('[Learn] Could not load theme from server (server may be offline):', e.message);
    return null;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Learn] Initializing…');
  buildHeader('learn');
  buildKeyBar(document.getElementById('phase-pills'));
  setupScrollNav();
  renderIndicators();
  console.log('[Learn] Indicators rendered');
  renderHistory();
  console.log('[Learn] History rendered');
  const season = await loadTheme();
  renderPhases(season);
  renderAllocations();
  loadGlossary();
  console.log('[Learn] Init complete. Cheat sheets load on accordion click.');
});

})();
