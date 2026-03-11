// ─── Shared helpers ────────────────────────────────────────────────────────────

function fadeAnim() { return 'animation:fadeSlideIn 0.3s ease'; }

function pillTag(text: string, fg: string, bg: string): string {
  return `<span class="inline-block px-2 py-0.5 rounded-full text-[0.68rem] font-medium" style="background:${bg};color:${fg}">${text}</span>`;
}

function factRow(text: string, color: string): string {
  return `<div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-gray-200"><span class="w-1 h-1 rounded-full flex-shrink-0 inline-block" style="background:${color}"></span><span class="text-xs text-slate-600 font-medium">${text}</span></div>`;
}

function overline(text: string): string {
  return `<p class="text-[0.62rem] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">${text}</p>`;
}

function placeholder(icon: string, title: string, body: string): string {
  return `<div class="bg-white rounded border border-gray-200 p-8 text-center shadow-sm"><div class="text-3xl mb-2 opacity-50">${icon}</div><p class="text-sm font-semibold text-slate-800 mb-1">${title}</p><p class="text-xs text-slate-400 leading-relaxed">${body}</p></div>`;
}

const FADE_STYLE = `<style>@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style>`;

// ─── Cheat Sheet 1: Cycle Wheel ───────────────────────────────────────────────

function cycleWheel(container: HTMLElement): void {
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
  const toRad = (a: number) => ((a - 90) * Math.PI) / 180;
  const ptOn = (r: number, a: number) => ({ x: C + r * Math.cos(toRad(a)), y: C + r * Math.sin(toRad(a)) });
  function arc(s: number, e: number, or: number, ir: number) {
    const p1=ptOn(or,s), p2=ptOn(or,e), p3=ptOn(ir,e), p4=ptOn(ir,s);
    return `M ${p1.x} ${p1.y} A ${or} ${or} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ir} ${ir} 0 0 0 ${p4.x} ${p4.y} Z`;
  }
  let act: number | null = null;

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
    return `<div class="text-center">
      <svg width="${SZ}" height="${SZ}" viewBox="0 0 ${SZ} ${SZ}" style="max-width:100%">
        <defs>${defs}<filter id="cwsh"><feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.07"/></filter></defs>
        <g filter="url(#cwsh)">${segs}</g>
        ${lbls}
        <circle cx="${C}" cy="${C}" r="${IR}" fill="white" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${C}" y="${C-7}" text-anchor="middle" style="font-size:0.58rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;fill:#94a3b8">Economic</text>
        <text x="${C}" y="${C+10}" text-anchor="middle" style="font-size:0.58rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;fill:#94a3b8">Cycle</text>
      </svg>
      <p class="text-[0.67rem] text-slate-400 mt-2">Spring → Summer → Autumn → Winter →</p>
    </div>`;
  }

  function buildDetail() {
    if (act === null) return placeholder('📊','Explore each phase','Click a segment to see indicators and favored assets for that phase.');
    const p = PH[act];
    return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${p.c}22;${fadeAnim()}">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">${p.icon}</span>
        <div>
          <h3 class="font-bold text-[1.4rem] m-0" style="font-family:'Playfair Display',serif;color:${p.c}">${p.n}</h3>
          <span class="text-[0.63rem] uppercase tracking-widest text-slate-400 font-semibold">${p.s}</span>
        </div>
      </div>
      <p class="text-[0.83rem] text-slate-600 leading-relaxed mb-4">${p.desc}</p>
      ${overline('Key Indicators')}
      <div class="flex flex-wrap gap-1.5 mb-4">${p.ind.map(x => pillTag(x, p.c, p.c+'15')).join('')}</div>
      ${overline('Favored Assets')}
      <div class="flex flex-wrap gap-1.5">${p.ast.map(x => pillTag(x, '#475569', '#f8fafc')).join('')}</div>
    </div>`;
  }

  function buildBtns() {
    return PH.map((p,i) => `<button class="cw-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer" data-i="${i}" style="border:${act===i?`2px solid ${p.c}`:'2px solid transparent'};background:${act===i?p.c+'14':'white'}">
      <span class="w-2 h-2 rounded-full inline-block" style="background:${p.c}"></span>
      <span class="text-[0.78rem] font-semibold text-slate-800">${p.n}</span>
      <span class="text-[0.68rem] text-slate-400">${p.s}</span>
    </button>`).join('');
  }

  container.innerHTML = `${FADE_STYLE}
    <div class="flex gap-8 items-center justify-center flex-wrap">
      <div id="cw-wheel">${buildSVG()}</div>
      <div class="flex-1 basis-72 max-w-sm"><div id="cw-detail">${buildDetail()}</div></div>
    </div>
    <div id="cw-btns" class="flex justify-center gap-3 mt-6 flex-wrap">${buildBtns()}</div>`;

  function toggle(i: number) {
    act = act === i ? null : i;
    document.getElementById('cw-detail')!.innerHTML = buildDetail();
    document.getElementById('cw-btns')!.innerHTML = buildBtns();
    bindBtns();
  }
  function bindBtns() { container.querySelectorAll('.cw-btn').forEach(b => b.addEventListener('click', () => toggle(+(b as HTMLElement).dataset.i!))); }
  container.querySelectorAll('.cw-seg').forEach(s => s.addEventListener('click', () => toggle(+(s as HTMLElement).dataset.i!)));
  bindBtns();
}

// ─── Cheat Sheet 2: Yield Curve ───────────────────────────────────────────────

function yieldCurve(container: HTMLElement): void {
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
  let act: number | null = null;

  function smoothPath(pts: {x:number,y:number}[]) {
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
    const yLbls = [['High',0.85],['Mid',0.5],['Low',0.15]].map(([l,v]) => {
      const y = CY + CH - (v as number)*CH;
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
    return `<div class="bg-white rounded border border-gray-200 shadow-sm pt-4 px-4 pb-2">
      <svg viewBox="0 0 ${SW} ${SH}" width="100%" style="display:block">
        ${grid}
        <line x1="${CX}" y1="${CY}" x2="${CX}" y2="${bottom}" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="${CX}" y1="${bottom}" x2="${CX+CW}" y2="${bottom}" stroke="#cbd5e1" stroke-width="1.5"/>
        ${yLbls}${xLabels}
        <text x="${CX+CW/2}" y="${bottom+38}" text-anchor="middle" style="font-size:0.63rem;fill:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Maturity</text>
        <text x="12" y="${CY+CH/2}" text-anchor="middle" transform="rotate(-90,12,${CY+CH/2})" style="font-size:0.63rem;fill:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Yield</text>
        ${curves}
      </svg>
      <div class="flex justify-center gap-4 py-2 border-t border-slate-100 flex-wrap">
        ${CURVES.map((c,i) => `<button class="yc-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer" data-i="${i}" style="border:${act===i?`2px solid ${c.c}`:'2px solid transparent'};background:${act===i?c.cL:'transparent'}">
          <span class="inline-block w-4 h-0.5 rounded-sm" style="background:${c.c};${c.dash?'border-top:2px dashed '+c.c+';background:none':''}"></span>
          <span class="text-[0.76rem] font-semibold" style="color:${act===i?c.c:'#64748b'}">${c.n}</span>
        </button>`).join('')}
      </div>
    </div>`;
  }

  function buildDetail() {
    if (act === null) return placeholder('📐','Select a curve','Click on any curve or use the legend to explore what each shape signals about the economy.');
    const c = CURVES[act];
    return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${c.c}18;${fadeAnim()}">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl w-11 h-11 flex items-center justify-center rounded" style="background:${c.cL}">${c.icon}</span>
        <div>
          <h3 class="font-bold text-[1.4rem] m-0" style="font-family:'Playfair Display',serif;color:${c.c}">${c.n}</h3>
          <span class="text-[0.66rem] uppercase tracking-widest text-slate-400 font-semibold">${c.sig}</span>
        </div>
      </div>
      <p class="text-[0.83rem] text-slate-600 leading-relaxed mb-4">${c.desc}</p>
      ${overline('Implications')}
      <div class="flex flex-col gap-1.5">${c.impl.map(x => factRow(x, c.c)).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div class="flex gap-8 items-center justify-center flex-wrap">
      <div id="yc-chart" class="flex-1 basis-[520px] max-w-[640px]">${buildChart()}</div>
      <div class="flex-1 basis-72 max-w-sm"><div id="yc-detail">${buildDetail()}</div></div>
    </div>`;

  function toggle(i: number) {
    act = act === i ? null : i;
    document.getElementById('yc-chart')!.innerHTML = buildChart();
    document.getElementById('yc-detail')!.innerHTML = buildDetail();
    bindAll();
  }
  function bindAll() {
    container.querySelectorAll('.yc-curve').forEach(s => s.addEventListener('click', () => toggle(+(s as HTMLElement).dataset.i!)));
    container.querySelectorAll('.yc-btn').forEach(b => b.addEventListener('click', () => toggle(+(b as HTMLElement).dataset.i!)));
  }
  bindAll();
}

// ─── Cheat Sheet 3: Rate Flow ─────────────────────────────────────────────────

function rateFlow(container: HTMLElement): void {
  const NODES: Record<string, {id:string,label:string,sub:string,icon:string,c:string,cL:string,tier:number,impact?:string,impactIcon?:string,desc:string,mech:string,effects:string[]}> = {
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
  let act: string | null = null;

  function buildNode(node: typeof NODES[string]) {
    const isAct = act === node.id;
    return `<div class="rf-node" data-id="${node.id}" style="display:flex;flex-direction:column;align-items:center;gap:0.35rem;cursor:pointer">
      <div style="background:linear-gradient(135deg,${node.c},${node.c}dd);border-radius:5px;padding:0.75rem 1.4rem;text-align:center;min-width:130px;box-shadow:${isAct?`0 4px 20px ${node.c}35,0 0 0 3px ${node.c}25`:`0 2px 8px ${node.c}20`};transition:box-shadow 0.3s">
        <div style="font-size:0.72rem;margin-bottom:0.1rem">${node.icon}</div>
        <div style="color:white;font-weight:700;font-size:${node.tier===0?'1rem':'0.88rem'};font-family:'DM Sans',sans-serif">${node.label}</div>
      </div>
      ${node.impact ? `<div style="display:flex;align-items:center;gap:0.25rem"><span style="font-size:0.82rem">${node.impactIcon}</span><span style="font-size:0.74rem;color:#64748b;font-weight:500">${node.impact}</span></div>` : ''}
    </div>`;
  }

  function buildDiagram() {
    return `<div class="bg-white rounded border border-gray-200 shadow-sm p-8">
      <div class="flex justify-center mb-0">${buildNode(NODES.fed)}</div>
      <div class="flex justify-center py-2">
        <div class="flex flex-col items-center gap-0.5">
          <div class="w-0.5 h-6 rounded" style="background:linear-gradient(to bottom,#3b82f6,#8b5cf6)"></div>
          <svg width="12" height="8"><path d="M 1 1 L 6 6 L 11 1" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="flex justify-center mb-0">${buildNode(NODES.treasury)}</div>
      <div class="flex justify-center py-1">
        <svg width="340" height="38" viewBox="0 0 340 38" style="overflow:visible">
          <path d="M 170 0 L 170 12 Q 170 20 162 23 L 50 36" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 170 0 L 170 33" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 170 0 L 170 12 Q 170 20 178 23 L 290 36" fill="none" stroke="#eab308" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="flex justify-between items-start gap-2 px-1">
        ${buildNode(NODES.mortgages)}${buildNode(NODES.corpBonds)}${buildNode(NODES.savings)}
      </div>
      <p class="text-center text-[0.74rem] text-slate-400 italic mt-4 pt-3 border-t border-slate-100">Rate changes ripple through the entire economy</p>
    </div>`;
  }

  function buildDetail() {
    if (!act) return `<div class="bg-white rounded border border-gray-200 p-8 text-center shadow-sm">
      <div class="text-3xl mb-2 opacity-50">🏛️</div>
      <p class="text-sm font-semibold text-slate-800 mb-1">Explore the flow</p>
      <p class="text-xs text-slate-400 leading-relaxed mb-4">Click any node to learn how that rate connects to the broader economy.</p>
      <div class="px-3 py-2.5 rounded bg-slate-50 border border-gray-200 text-left">
        ${overline('Transmission Chain')}
        ${[{i:'🏛️',l:'Fed sets rate'},{i:'📜',l:'Treasuries adjust'},{i:'📡',l:'Markets reprice'},{i:'🌍',l:'Economy responds'}]
          .map(s => `<div class="flex items-center gap-1.5 py-1"><span class="text-sm">${s.i}</span><span class="text-[0.76rem] text-slate-600 font-medium">${s.l}</span></div>`).join('')}
      </div>
    </div>`;
    const n = NODES[act];
    return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${n.c}18;${fadeAnim()}">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl w-11 h-11 flex items-center justify-center rounded" style="background:${n.cL}">${n.icon}</span>
        <div>
          <h3 class="font-bold text-[1.35rem] m-0" style="font-family:'Playfair Display',serif;color:${n.c}">${n.label}</h3>
          <span class="text-[0.67rem] text-slate-400 font-medium">${n.sub}</span>
        </div>
      </div>
      <p class="text-[0.82rem] text-slate-600 leading-relaxed mb-3">${n.desc}</p>
      <div class="rounded p-3 mb-3" style="background:${n.c}08;border:1px solid ${n.c}15">
        ${overline('How it works')}
        <p class="text-[0.78rem] text-slate-600 leading-relaxed">${n.mech}</p>
      </div>
      ${overline('Key Effects')}
      <div class="flex flex-col gap-1.5">${n.effects.map(e => factRow(e, n.c)).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div class="flex gap-8 items-center justify-center flex-wrap">
      <div id="rf-diagram" class="flex-1 basis-[440px] max-w-[520px]">${buildDiagram()}</div>
      <div class="flex-1 basis-72 max-w-sm"><div id="rf-detail">${buildDetail()}</div></div>
    </div>`;

  function toggle(id: string) {
    act = act === id ? null : id;
    document.getElementById('rf-diagram')!.innerHTML = buildDiagram();
    document.getElementById('rf-detail')!.innerHTML = buildDetail();
    bindNodes();
  }
  function bindNodes() { container.querySelectorAll('.rf-node').forEach(n => n.addEventListener('click', () => toggle((n as HTMLElement).dataset.id!))); }
  bindNodes();
}

// ─── Cheat Sheet 4: Dual Mandate ──────────────────────────────────────────────

function dualMandate(container: HTMLElement): void {
  const MANDATES: Record<string, {id:string,label:string,sub:string,icon:string,c:string,cL:string,cD:string,target:string,desc:string,tools:string[],tradeoff:string,metrics:string[]}> = {
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
  let act: string | null = null;
  let tilt = 0, tiltDir = 1;
  let tiltInterval: number | null = null;

  function effectiveTilt() {
    if (act === 'employment') return -7;
    if (act === 'inflation') return 7;
    return tilt;
  }

  function buildScale() {
    const t = effectiveTilt();
    return `<div class="bg-white rounded border border-gray-200 shadow-sm px-6 pt-7 pb-5">
      <div class="text-center mb-5">
        <div class="inline-flex items-center gap-2 rounded border border-blue-200 px-4 py-2" style="background:linear-gradient(135deg,#eff6ff,#dbeafe)">
          <span class="text-xl font-bold text-blue-700" style="font-family:'JetBrains Mono',monospace">2%</span>
          <div class="text-left"><div class="text-[0.7rem] font-semibold text-blue-900">Inflation Target</div><div class="text-[0.6rem] text-blue-400">Price Stability Anchor</div></div>
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
        <rect x="222" y="94" width="56" height="29" rx="9" fill="url(#dm-fed)"/>
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
      <p class="text-center text-[0.7rem] text-slate-400 italic my-2">⚖️ These goals often conflict — that's why the Fed's job is hard</p>
      <div class="flex justify-center gap-3 pt-3 border-t border-slate-100">
        ${Object.values(MANDATES).map(m => `<button class="dm-btn flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer" data-id="${m.id}" style="border:${act===m.id?`2px solid ${m.c}`:'2px solid transparent'};background:${act===m.id?m.cL:'#f8fafc'}">
          <span class="text-sm">${m.icon}</span>
          <span class="text-[0.78rem] font-semibold" style="color:${act===m.id?m.cD:'#64748b'}">${m.label}</span>
        </button>`).join('')}
      </div>
    </div>`;
  }

  function buildDetail() {
    if (!act) return `<div class="bg-white rounded border border-gray-200 p-8 text-center shadow-sm">
      <div class="text-3xl mb-2 opacity-50">⚖️</div>
      <p class="text-sm font-semibold text-slate-800 mb-1">A delicate balance</p>
      <p class="text-xs text-slate-400 leading-relaxed mb-4">Click either side of the scale to explore how the Fed navigates its two competing mandates.</p>
      <div class="flex gap-2 justify-center">
        ${Object.values(MANDATES).map(m => `<div class="flex-1 p-3 rounded text-center" style="background:${m.cL};border:1px solid ${m.c}30">
          <div class="text-xl mb-1">${m.icon}</div>
          <div class="text-[0.76rem] font-bold" style="color:${m.cD}">${m.label}</div>
          <div class="text-[0.64rem] text-slate-500 mt-0.5">${m.sub}</div>
        </div>`).join('')}
      </div>
      <p class="text-[0.74rem] text-slate-500 leading-relaxed mt-3 px-2.5 py-2.5 bg-slate-50 rounded border border-gray-200">When the Fed lowers rates to boost jobs, it risks inflation. When it raises rates to fight inflation, it risks unemployment.</p>
    </div>`;
    const m = MANDATES[act];
    return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${m.c}18;${fadeAnim()}">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl w-11 h-11 flex items-center justify-center rounded" style="background:${m.cL}">${m.icon}</span>
        <div>
          <h3 class="font-bold text-[1.35rem] m-0" style="font-family:'Playfair Display',serif;color:${m.c}">${m.label}</h3>
          <span class="text-[0.63rem] font-medium px-1.5 py-0.5 rounded" style="font-family:'JetBrains Mono',monospace;color:${m.cD};background:${m.cL}">Target: ${m.target}</span>
        </div>
      </div>
      <p class="text-[0.82rem] text-slate-600 leading-relaxed mb-3">${m.desc}</p>
      <div class="rounded p-3 mb-3" style="background:${m.c}08;border:1px solid ${m.c}15">
        ${overline("Fed's Tools")}
        ${m.tools.map(t => `<div class="flex items-center gap-1.5 py-0.5"><span class="w-1 h-1 rounded-full flex-shrink-0 inline-block" style="background:${m.c}"></span><span class="text-xs text-slate-600">${t}</span></div>`).join('')}
      </div>
      <div class="rounded p-3 mb-3 bg-red-50 border border-red-200">
        <p class="text-[0.6rem] font-semibold uppercase tracking-wider text-red-600 mb-1">⚠️ The Tradeoff</p>
        <p class="text-[0.75rem] text-red-900 leading-relaxed">${m.tradeoff}</p>
      </div>
      ${overline('Key Metrics')}
      <div class="flex flex-wrap gap-1.5">${m.metrics.map(x => pillTag(x, '#475569', '#f8fafc')).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div class="flex gap-8 items-center justify-center flex-wrap">
      <div id="dm-scale" class="flex-1 basis-[460px] max-w-[540px]">${buildScale()}</div>
      <div class="flex-1 basis-72 max-w-sm"><div id="dm-detail">${buildDetail()}</div></div>
    </div>`;

  function startTilt() {
    tiltInterval = window.setInterval(() => {
      if (act) return;
      tilt += 0.12 * tiltDir;
      if (tilt > 3.5) tiltDir = -1;
      if (tilt < -3.5) tiltDir = 1;
      const beam = document.getElementById('dm-beam');
      if (beam) beam.style.transform = `rotate(${tilt}deg)`;
    }, 50);
  }

  function toggle(id: string) {
    act = act === id ? null : id;
    if (tiltInterval !== null) clearInterval(tiltInterval);
    document.getElementById('dm-scale')!.innerHTML = buildScale();
    document.getElementById('dm-detail')!.innerHTML = buildDetail();
    if (!act) startTilt();
    bindAll();
  }
  function bindAll() {
    container.querySelectorAll('.dm-plate, .dm-btn').forEach(el => el.addEventListener('click', () => toggle((el as HTMLElement).dataset.id!)));
  }
  bindAll();
  startTilt();
}

// ─── Cheat Sheet 5: Rate Timeline ─────────────────────────────────────────────

function rateTimeline(container: HTMLElement): void {
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
  const toSvg = (px: number, py: number) => ({ x: CX+px*CW, y: CY+CH-py*CH });
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
  let act: number | null = null;

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
    return `<div class="bg-white rounded border border-gray-200 shadow-sm pt-4 px-4 pb-2">
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
      <div class="flex justify-center gap-2 mt-1 pt-2 border-t border-slate-100 flex-wrap">
        ${PH.map((p,i) => `<button class="rt-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer" data-i="${i}" style="border:${act===i?`2px solid ${p.c}`:'2px solid transparent'};background:${act===i?p.cL:'transparent'}">
          <span class="text-sm">${p.icon}</span>
          <span class="text-[0.74rem] font-semibold" style="color:${act===i?p.dk:'#64748b'}">${p.n}</span>
        </button>`).join('')}
      </div>
      <p class="text-center text-[0.7rem] text-slate-400 italic mt-2">Rates cycle between low (spring) and high (winter)</p>
    </div>`;
  }

  function buildDetail() {
    if (act === null) return placeholder('📈','Explore each phase','Click on any point along the rate cycle to see the environment and investment strategy.');
    const p = PH[act];
    return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${p.c}18;${fadeAnim()}">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl w-11 h-11 flex items-center justify-center rounded" style="background:${p.cL}">${p.icon}</span>
        <div>
          <h3 class="font-bold text-[1.35rem] m-0" style="font-family:'Playfair Display',serif;color:${p.c}">${p.n}</h3>
          <span class="text-[0.62rem] font-medium px-1.5 py-0.5 rounded" style="font-family:'JetBrains Mono',monospace;color:${p.dk};background:${p.cL}">${p.rateAction}</span>
        </div>
      </div>
      <p class="text-[0.82rem] text-slate-600 leading-relaxed mb-3">${p.desc}</p>
      <div class="rounded-lg p-2.5 mb-3 flex items-center gap-2" style="background:${p.c}08;border:1px solid ${p.c}15">
        <span class="text-sm">📍</span>
        <div>
          <span class="text-[0.6rem] font-semibold uppercase tracking-wider" style="color:${p.c}">Rate Position</span>
          <div class="text-[0.76rem] text-slate-600 font-medium">${p.rateRange}</div>
        </div>
      </div>
      ${overline('Environment')}
      <div class="flex flex-wrap gap-1.5 mb-3">${p.env.map(e => pillTag(e, p.dk, p.cL)).join('')}</div>
      ${overline('Strategy Playbook')}
      <div class="flex flex-col gap-1.5">${p.strat.map(s => factRow(s, p.c)).join('')}</div>
    </div>`;
  }

  container.innerHTML = `${FADE_STYLE}
    <div class="flex gap-8 items-center justify-center flex-wrap">
      <div id="rt-chart" class="flex-1 basis-[520px] max-w-[640px]">${buildChart()}</div>
      <div class="flex-1 basis-72 max-w-sm"><div id="rt-detail">${buildDetail()}</div></div>
    </div>`;

  function toggle(i: number) {
    act = act === i ? null : i;
    document.getElementById('rt-chart')!.innerHTML = buildChart();
    document.getElementById('rt-detail')!.innerHTML = buildDetail();
    bindAll();
  }
  function bindAll() {
    container.querySelectorAll('.rt-dot').forEach(d => d.addEventListener('click', () => toggle(+(d as HTMLElement).dataset.i!)));
    container.querySelectorAll('.rt-btn').forEach(b => b.addEventListener('click', () => toggle(+(b as HTMLElement).dataset.i!)));
  }
  bindAll();
}

// ─── Cheat Sheet 6: Credit Spread ─────────────────────────────────────────────

function creditSpread(container: HTMLElement): void {
  const SCENARIOS = [
    { id:'normal', label:'Normal Market', treasury:4.5, spread:3.5, c:'#64748b', cL:'#f1f5f9', cD:'#475569', icon:'📊',
      desc:'Typical market conditions with moderate risk appetite. Credit spreads are at historical averages, reflecting balanced growth expectations.', sentiment:'Neutral',
      env:[] as string[], sigs:[] as string[] },
    { id:'riskon', label:'Risk-ON', sub:'Spread Narrow', treasury:4.5, spread:1.5, c:'#10b981', cL:'#d1fae5', cD:'#059669', icon:'🟢',
      desc:'Investors are confident and reaching for yield. Spreads compress as demand for corporate bonds surges, pushing risk premiums to cycle lows.', sentiment:'Bullish',
      env:['Strong economic growth','Low default rates','Abundant liquidity','High investor confidence'],
      sigs:['Spreads below historical average','High-yield bond inflows rising','VIX at low levels','Credit default swaps tightening'] },
    { id:'riskoff', label:'Risk-OFF', sub:'Spread Wide', treasury:4.5, spread:6.5, c:'#ef4444', cL:'#fee2e2', cD:'#dc2626', icon:'🔴',
      desc:'Fear dominates. Investors flee corporate bonds for the safety of Treasuries, causing spreads to blow out as risk premiums spike dramatically.', sentiment:'Bearish',
      env:['Economic slowdown or recession','Rising default expectations','Liquidity drying up','Flight to quality'],
      sigs:['Spreads above historical average','High-yield bond outflows','VIX elevated','Credit default swaps widening'] },
  ];
  const COMPS: Record<string, {id:string,label:string,icon:string,c:string,cL:string,cD:string,sub:string,desc:string,factors:string[]}> = {
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
  let actSc = 0, actComp: string | null = null;
  let curSpread = 3.5, curTreasury = 4.5;
  let animId: number | null = null;

  function animateTo(targetSpread: number, targetTreasury: number) {
    if (animId !== null) cancelAnimationFrame(animId);
    const startS = curSpread, startT = curTreasury;
    const dur = 600; let start: number | null = null;
    function step(ts: number) {
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
    const tbar = document.getElementById('cs-tbar') as HTMLElement | null;
    const sbar = document.getElementById('cs-sbar') as HTMLElement | null;
    const tlbl = document.getElementById('cs-tlabel');
    const slbl = document.getElementById('cs-slabel');
    const tval = document.getElementById('cs-tval');
    const sval = document.getElementById('cs-sval');
    const cval = document.getElementById('cs-cval');
    if (tbar) { tbar.style.width = tW+'%'; if (tlbl) tlbl.textContent = curTreasury.toFixed(1)+'%'; }
    if (sbar) {
      sbar.style.width = sW+'%';
      sbar.style.background = `linear-gradient(135deg,${sColor},${sColor}cc)`;
      if (slbl) slbl.textContent = curSpread.toFixed(1)+'%';
    }
    if (tval) tval.textContent = curTreasury.toFixed(1)+'%';
    if (sval) sval.textContent = curSpread.toFixed(1)+'%';
    if (cval) cval.textContent = (curTreasury+curSpread).toFixed(1)+'%';
  }

  function buildDiagram() {
    const sc = SCENARIOS[actSc];
    const maxRate = 12;
    const tW = (curTreasury/maxRate)*100, sW = (curSpread/maxRate)*100;
    const sColor = sc.id==='riskoff' ? '#ef4444' : sc.id==='riskon' ? '#10b981' : '#f97316';
    return `<div class="bg-white rounded border border-gray-200 shadow-sm p-8">
      <div class="flex items-center justify-center gap-3 mb-6 flex-wrap">
        <div class="cs-card" data-id="treasury" style="cursor:pointer;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:5px;padding:1rem 1.4rem;text-align:center;min-width:118px;box-shadow:0 4px 12px rgba(59,130,246,0.25);transition:transform 0.2s;transform:${actComp==='treasury'?'scale(1.05)':'scale(1)'}">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:0.1rem">🏛️ Treasury</div>
          <div id="cs-tval" style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:white">${curTreasury.toFixed(1)}%</div>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base font-bold text-slate-400 flex-shrink-0">+</div>
        <div class="cs-card" data-id="spread" style="cursor:pointer;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:5px;padding:1rem 1.4rem;text-align:center;min-width:118px;box-shadow:0 4px 12px rgba(249,115,22,0.25);transition:transform 0.2s;transform:${actComp==='spread'?'scale(1.05)':'scale(1)'}">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:0.1rem">⚡ Risk Premium</div>
          <div id="cs-sval" style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:white">${curSpread.toFixed(1)}%</div>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base font-bold text-slate-400 flex-shrink-0">=</div>
        <div class="cs-card" data-id="corp" style="cursor:pointer;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:5px;padding:1rem 1.4rem;text-align:center;min-width:118px;box-shadow:0 4px 12px rgba(99,102,241,0.25);transition:transform 0.2s;transform:${actComp==='corp'?'scale(1.05)':'scale(1)'}">
          <div style="font-size:0.72rem;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:0.1rem">🏢 Corp Bond</div>
          <div id="cs-cval" style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;color:white">${(curTreasury+curSpread).toFixed(1)}%</div>
        </div>
      </div>
      <div class="mb-5 px-1">
        <div style="display:flex;height:40px;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;background:#f8fafc">
          <div id="cs-tbar" style="width:${tW}%;background:linear-gradient(135deg,#3b82f6,#60a5fa);display:flex;align-items:center;justify-content:center;transition:width 0.6s cubic-bezier(0.4,0,0.2,1)">
            <span id="cs-tlabel" style="font-size:0.7rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace">${curTreasury.toFixed(1)}%</span>
          </div>
          <div id="cs-sbar" style="width:${sW}%;background:linear-gradient(135deg,${sColor},${sColor}cc);display:flex;align-items:center;justify-content:center;border-left:2px solid rgba(255,255,255,0.3);transition:width 0.6s cubic-bezier(0.4,0,0.2,1),background 0.6s ease">
            <span id="cs-slabel" style="font-size:0.7rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace">${curSpread.toFixed(1)}%</span>
          </div>
        </div>
        <div class="flex mt-1">
          <div class="text-center text-[0.6rem] text-blue-500 font-semibold transition-all" style="width:${tW}%">Treasury</div>
          <div class="text-center text-[0.6rem] font-semibold transition-all" style="width:${sW}%;color:${sColor}">Spread</div>
        </div>
      </div>
      <div class="flex gap-2 justify-center flex-wrap mb-3">
        ${SCENARIOS.map((s,i) => `<button class="cs-sc-btn flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all" data-i="${i}" style="border:${actSc===i?`2px solid ${s.c}`:'2px solid #e2e8f0'};background:${actSc===i?s.cL:'white'}">
          <span class="text-sm">${s.icon}</span>
          <div class="text-left">
            <div class="text-[0.76rem] font-bold" style="color:${actSc===i?(s.cD):'#334155'}">${s.label}</div>
            ${'sub' in s && s.sub ? `<div class="text-[0.6rem] font-medium" style="color:${actSc===i?(s.cD):'#94a3b8'}">${s.sub}</div>` : ''}
          </div>
        </button>`).join('')}
      </div>
      <p class="text-center text-[0.7rem] text-slate-400 italic">Wider = market fears defaults · Narrow = confidence is high</p>
    </div>`;
  }

  function buildDetail() {
    if (actComp) {
      const c = COMPS[actComp];
      return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${c.c}18;${fadeAnim()}">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl w-11 h-11 flex items-center justify-center rounded" style="background:${c.cL}">${c.icon}</span>
          <div>
            <h3 class="font-bold text-[1.35rem] m-0" style="font-family:'Playfair Display',serif;color:${c.c}">${c.label}</h3>
            <span class="text-[0.65rem] text-slate-400 font-medium">${c.sub}</span>
          </div>
        </div>
        <p class="text-[0.82rem] text-slate-600 leading-relaxed mb-3">${c.desc}</p>
        ${overline('Key Drivers')}
        <div class="flex flex-col gap-1.5">${c.factors.map(f => factRow(f, c.c)).join('')}</div>
      </div>`;
    }
    const sc = SCENARIOS[actSc];
    if (sc.id === 'normal') return `<div class="bg-white rounded border border-gray-200 p-8 text-center shadow-sm">
      <div class="text-3xl mb-2 opacity-50">💳</div>
      <p class="text-sm font-semibold text-slate-800 mb-1">Explore the spread</p>
      <p class="text-xs text-slate-400 leading-relaxed mb-4">Click any card in the equation to learn about each component, or toggle between scenarios to see how spreads react.</p>
      <div class="px-3 py-2.5 rounded bg-slate-50 border border-gray-200 text-left">
        ${overline('The Formula')}
        <div class="flex items-center gap-1.5 justify-center py-1">
          <span class="text-[0.76rem] font-semibold text-blue-500">🏛️ Treasury</span>
          <span class="text-gray-300">+</span>
          <span class="text-[0.76rem] font-semibold text-orange-500">⚡ Spread</span>
          <span class="text-gray-300">=</span>
          <span class="text-[0.76rem] font-semibold text-indigo-500">🏢 Corp Yield</span>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-200">
          <div class="flex justify-between py-0.5"><span class="text-[0.7rem] text-slate-500">🟢 Risk-ON</span><span class="text-[0.7rem] text-emerald-500 font-semibold">Spreads narrow</span></div>
          <div class="flex justify-between py-0.5"><span class="text-[0.7rem] text-slate-500">🔴 Risk-OFF</span><span class="text-[0.7rem] text-red-500 font-semibold">Spreads widen</span></div>
        </div>
      </div>
    </div>`;
    return `<div class="bg-white rounded p-7 shadow-md border" style="border-color:${sc.c}18;${fadeAnim()}">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl w-11 h-11 flex items-center justify-center rounded" style="background:${sc.cL}">${sc.icon}</span>
        <div>
          <h3 class="font-bold text-[1.35rem] m-0" style="font-family:'Playfair Display',serif;color:${sc.c}">${sc.label}</h3>
          <span class="text-[0.62rem] font-medium px-1.5 py-0.5 rounded" style="font-family:'JetBrains Mono',monospace;color:${sc.cD};background:${sc.cL}">Spread: ${sc.spread.toFixed(1)}% · ${sc.sentiment}</span>
        </div>
      </div>
      <p class="text-[0.82rem] text-slate-600 leading-relaxed mb-3">${sc.desc}</p>
      ${overline('Environment')}
      <div class="flex flex-wrap gap-1.5 mb-3">${sc.env.map(e => pillTag(e, sc.cD, sc.cL)).join('')}</div>
      ${overline('What to Watch')}
      <div class="flex flex-col gap-1.5">${sc.sigs.map(s => factRow(s, sc.c)).join('')}</div>
    </div>`;
  }

  function rerender() {
    document.getElementById('cs-diagram')!.innerHTML = buildDiagram();
    document.getElementById('cs-detail')!.innerHTML = buildDetail();
    bindAll();
    animateTo(SCENARIOS[actSc].spread, SCENARIOS[actSc].treasury);
  }

  container.innerHTML = `${FADE_STYLE}
    <div class="flex gap-8 items-center justify-center flex-wrap">
      <div id="cs-diagram" class="flex-1 basis-[480px] max-w-[580px]">${buildDiagram()}</div>
      <div class="flex-1 basis-72 max-w-sm"><div id="cs-detail">${buildDetail()}</div></div>
    </div>`;

  function bindAll() {
    container.querySelectorAll('.cs-sc-btn').forEach(b => b.addEventListener('click', () => {
      actSc = +(b as HTMLElement).dataset.i!; actComp = null; rerender();
    }));
    container.querySelectorAll('.cs-card').forEach(c => c.addEventListener('click', () => {
      const id = (c as HTMLElement).dataset.id!;
      actComp = actComp === id ? null : id;
      document.getElementById('cs-detail')!.innerHTML = buildDetail();
      container.querySelectorAll('.cs-sc-btn').forEach(b2 => b2.addEventListener('click', () => {
        actSc = +(b2 as HTMLElement).dataset.i!; actComp = null; rerender();
      }));
    }));
  }
  bindAll();
}

// ─── Export ────────────────────────────────────────────────────────────────────

export const CS_RENDERERS: Record<string, (container: HTMLElement) => void> = {
  cycleWheel,
  yieldCurve,
  rateFlow,
  dualMandate,
  rateTimeline,
  creditSpread,
};
