import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Shield, AlertCircle, DollarSign, Download, ArrowRight, ArrowLeft, Plus, Trash2, Edit, Zap, Info, X, CreditCard, Settings, ChevronDown, ChevronUp, BookOpen, BarChart3, HelpCircle, Sparkles, AlertTriangle, CheckCircle, Moon, Sun, RotateCcw } from 'lucide-react';

/*
 * ═══════════════════════════════════════════════════════════
 *  DHANRAKSHA (धनरक्षा) — Financial Goal Planning Calculator
 *  SEBI-Compliant · Privacy-First · Professional-Grade
 * ═══════════════════════════════════════════════════════════
 *  NOT investment advice. Educational calculator only.
 *  Does not recommend specific mutual funds or platforms.
 *  Consult a SEBI-registered Investment Adviser (RIA).
 * ═══════════════════════════════════════════════════════════
 */

const BRAND = 'DhanRaksha';

const FinancialGoalPlanner = () => {
  // ═══ STATE ═══════════════════════════════════════════
  const [step, setStep] = useState('landing');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [animReady, setAnimReady] = useState(false);

  const [profile, setProfile] = useState({
    name: '', age: '', monthlyIncome: '', monthlyExpenses: '',
    emergencyTarget: 6, emergencyFund: '0',
    hasDebts: null, debts: [],
    riskTolerance: 'moderate',
    taxRegime: 'new',
  });
  const [goals, setGoals] = useState([]);

  // ═══ THEME ══════════════════════════════════════════
  const T = darkMode ? {
    bg: '#0f172a', card: '#1e293b', cardAlt: '#334155', text: '#f1f5f9',
    muted: '#94a3b8', border: '#475569', accent: '#14b8a6', accentH: '#0d9488',
    danger: '#ef4444', warn: '#f59e0b', ok: '#22c55e',
  } : {
    bg: '#f8fafc', card: '#ffffff', cardAlt: '#f1f5f9', text: '#0f172a',
    muted: '#64748b', border: '#e2e8f0', accent: '#0d9488', accentH: '#0f766e',
    danger: '#dc2626', warn: '#d97706', ok: '#16a34a',
  };

  // ═══ ASSET CLASSES (SEBI-compliant: generic only, NO fund/platform names) ═══
  const ASSETS = {
    largeCap:  { name: 'Large Cap Equity',    avg: 11.5, risk: 'Moderate',   taxType: 'equity' },
    midCap:    { name: 'Mid Cap Equity',      avg: 14.5, risk: 'High',       taxType: 'equity' },
    smallCap:  { name: 'Small Cap Equity',    avg: 16,   risk: 'Very High',  taxType: 'equity' },
    debtFund:  { name: 'Debt Mutual Funds',   avg: 7,    risk: 'Low',        taxType: 'slab' },
    elss:      { name: 'ELSS (Tax Saver)',    avg: 12,   risk: 'Mod-High',   taxType: 'equity', tax80C: true },
    ppf:       { name: 'PPF',                 avg: 7.1,  risk: 'Sovereign',  taxType: 'exempt', tax80C: true },
    nps:       { name: 'NPS',                 avg: 10,   risk: 'Moderate',   taxType: 'partial', tax80CCD: true },
    fd:        { name: 'Fixed Deposit',       avg: 6.5,  risk: 'Low',        taxType: 'slab' },
  };

  const GOALS_TPL = {
    retirement: { name: 'Retirement Corpus', icon: '🏖️', color: '#2563eb', infl: 6, yrs: 25, amt: 10000000 },
    education:  { name: "Child's Education",  icon: '🎓', color: '#7c3aed', infl: 10, yrs: 15, amt: 2500000 },
    house:      { name: 'Home Down Payment',   icon: '🏡', color: '#059669', infl: 8,  yrs: 10, amt: 5000000 },
    wedding:    { name: 'Wedding Fund',        icon: '💍', color: '#dc2626', infl: 7,  yrs: 5,  amt: 1500000 },
    travel:     { name: 'Dream Vacation',      icon: '✈️', color: '#0891b2', infl: 5,  yrs: 3,  amt: 300000 },
    car:        { name: 'New Vehicle',         icon: '🚗', color: '#4f46e5', infl: 5,  yrs: 4,  amt: 800000 },
    custom:     { name: 'Custom Goal',         icon: '🎯', color: '#6366f1', infl: 6,  yrs: 5,  amt: 1000000 },
  };

  const RISK = {
    conservative: { label: 'Conservative', emoji: '🐢', desc: 'Capital preservation. Lower returns, minimal ups and downs.', eqMax: 30 },
    moderate:     { label: 'Moderate',     emoji: '⚖️', desc: 'Balanced. Some volatility for better growth.',              eqMax: 60 },
    aggressive:   { label: 'Aggressive',   emoji: '🚀', desc: 'Max growth. Comfortable with big market swings.',           eqMax: 85 },
  };

  // ═══ PERSISTENCE ════════════════════════════════════
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage?.get('dhanraksha');
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.profile) setProfile(p => ({ ...p, ...d.profile }));
          if (d.goals) setGoals(d.goals);
          if (d.profile?.monthlyIncome) setStep('dashboard');
        }
      } catch (e) { /* first load or no storage */ }
    })();
  }, []);

  useEffect(() => {
    try { window.storage?.set('dhanraksha', JSON.stringify({ profile, goals })); } catch (e) {}
  }, [profile, goals]);

  useEffect(() => { setAnimReady(false); requestAnimationFrame(() => setAnimReady(true)); }, [step, onboardingStep]);

  // ═══ TOAST ══════════════════════════════════════════
  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 3000); };

  // ═══ VALIDATION ═════════════════════════════════════
  const valProfile = () => {
    const e = {};
    const inc = parseFloat(profile.monthlyIncome), exp = parseFloat(profile.monthlyExpenses);
    if (!inc || inc <= 0) e.income = 'Enter valid income';
    if (exp === undefined || exp === '' || exp < 0) e.expenses = 'Enter valid expenses';
    if (inc > 0 && exp >= inc) e.expenses = 'Expenses must be less than income';
    if (profile.age && (parseInt(profile.age) < 18 || parseInt(profile.age) > 80)) e.age = 'Age: 18-80';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const valGoal = (f) => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Required';
    const a = parseFloat(f.targetAmount);
    if (!a || a < 1000) e.amount = 'Min ₹1,000';
    if (a > 5000000000) e.amount = 'Unrealistically high';
    const y = parseInt(f.years);
    if (!y || y < 1) e.years = 'Min 1 year';
    if (y > 50) e.years = 'Max 50 years';
    const inf = parseFloat(f.inflationRate);
    if (isNaN(inf) || inf < 0 || inf > 20) e.infl = '0-20%';
    const ret = parseFloat(f.expectedReturn);
    if (isNaN(ret) || ret < 1 || ret > 30) e.ret = '1-30%';
    setErrors(e); return Object.keys(e).length === 0;
  };

  // ═══ CORE CALCULATIONS ═════════════════════════════
  const calc = useCallback((goal) => {
    const target = parseFloat(goal.targetAmount) || 0;
    const years = Math.max(1, parseInt(goal.years) || 1);
    const infl = (parseFloat(goal.inflationRate) || 6) / 100;
    const ret = (parseFloat(goal.expectedReturn) || 12) / 100;
    const cur = parseFloat(goal.currentSavings) || 0;
    const stepUp = (parseFloat(goal.annualStepUp) || 0) / 100;

    const futureVal = target * Math.pow(1 + infl, years);
    const curFV = cur * Math.pow(1 + ret, years);
    const remaining = Math.max(0, futureVal - curFV);

    const mr = ret / 12;
    const months = years * 12;

    let sip;
    if (stepUp > 0 && years > 1) {
      let corpus = 0, testSIP = 1;
      for (let yr = 0; yr < years; yr++) {
        const s = testSIP * Math.pow(1 + stepUp, yr);
        for (let m = 0; m < 12; m++) corpus = (corpus + s) * (1 + mr);
      }
      sip = corpus > 0 ? remaining / corpus : 0;
    } else {
      sip = remaining > 0 ? (remaining * mr) / ((Math.pow(1 + mr, months) - 1) * (1 + mr)) : 0;
    }

    // Projection
    const proj = [];
    let invested = cur, corpusV = cur, curSIP = sip;
    for (let yr = 0; yr <= years; yr++) {
      proj.push({ year: `Yr ${yr}`, invested: Math.round(invested), corpus: Math.round(corpusV) });
      if (yr < years) {
        invested += curSIP * 12;
        for (let m = 0; m < 12; m++) corpusV = (corpusV + curSIP) * (1 + mr);
        if (stepUp > 0) curSIP *= (1 + stepUp);
      }
    }

    return { futureVal, sip, remaining, curFV, total: sip * months + cur, proj, months };
  }, []);

  // ═══ POST-TAX RETURN (per instrument, not blanket) ═══
  const postTaxRet = useCallback((asset) => {
    const info = ASSETS[asset];
    if (!info) return 0;
    if (info.taxType === 'exempt') return info.avg; // PPF: fully exempt
    if (info.taxType === 'equity') return info.avg * 0.92; // ~8% effective LTCG drag (12.5% above ₹1.25L)
    if (info.taxType === 'partial') return info.avg * 0.92; // NPS: 60% tax-free
    if (info.taxType === 'slab') {
      const annual = parseFloat(profile.monthlyIncome) * 12 || 0;
      const rate = annual > 1500000 ? 0.30 : annual > 1000000 ? 0.20 : annual > 500000 ? 0.10 : 0;
      return info.avg * (1 - rate);
    }
    return info.avg;
  }, [profile.monthlyIncome]);

  // ═══ RISK-AWARE ASSET ALLOCATION ════════════════════
  const getAlloc = useCallback((goal) => {
    const years = Math.max(1, parseInt(goal.years) || 5);
    const rp = RISK[profile.riskTolerance] || RISK.moderate;
    const age = parseInt(profile.age) || 30;

    let eq, dt, ts;
    if (years <= 2) { eq = Math.min(20, rp.eqMax * 0.3); dt = 70; ts = 10; }
    else if (years <= 5) { eq = Math.min(rp.eqMax * 0.6, 50); dt = Math.max(25, 65 - eq); ts = 100 - eq - dt; }
    else if (years <= 10) { eq = Math.min(rp.eqMax * 0.85, 70); dt = Math.max(15, 85 - eq); ts = 100 - eq - dt; }
    else { eq = rp.eqMax; dt = Math.max(10, 90 - eq); ts = 100 - eq - dt; }

    // Age adjustment: reduce equity 1%/yr over 45
    if (age > 45) { const r = Math.min(20, age - 45); eq = Math.max(10, eq - r); dt += r; }

    const a = [];
    const sipAmt = calc(goal).sip;
    const risk = profile.riskTolerance;

    // Equity split
    if (eq > 0) {
      if (risk === 'conservative') {
        a.push({ k: 'largeCap', pct: eq });
      } else if (risk === 'moderate') {
        a.push({ k: 'largeCap', pct: Math.round(eq * 0.55) });
        a.push({ k: 'midCap', pct: Math.round(eq * 0.35) });
        if (eq > 40) a.push({ k: 'smallCap', pct: Math.round(eq * 0.10) });
      } else {
        a.push({ k: 'largeCap', pct: Math.round(eq * 0.35) });
        a.push({ k: 'midCap', pct: Math.round(eq * 0.35) });
        a.push({ k: 'smallCap', pct: Math.round(eq * 0.30) });
      }
    }
    if (dt > 0) {
      if (years <= 3) { a.push({ k: 'fd', pct: Math.round(dt * 0.6) }); a.push({ k: 'debtFund', pct: Math.round(dt * 0.4) }); }
      else a.push({ k: 'debtFund', pct: dt });
    }
    if (ts > 0) {
      if (profile.taxRegime === 'old') {
        a.push({ k: 'elss', pct: Math.round(ts * 0.6) }); a.push({ k: 'ppf', pct: Math.round(ts * 0.4) });
      } else {
        a.push({ k: 'nps', pct: Math.round(ts * 0.5) }); a.push({ k: 'ppf', pct: Math.round(ts * 0.5) });
      }
    }

    // Normalize
    const tot = a.reduce((s, x) => s + x.pct, 0);
    if (tot !== 100 && a.length > 0) a[0].pct += (100 - tot);

    return a.filter(x => x.pct > 0).map(x => ({
      ...x, info: ASSETS[x.k], monthly: (sipAmt * x.pct) / 100, postTax: postTaxRet(x.k).toFixed(1),
    }));
  }, [profile, calc, postTaxRet]);

  // ═══ HEALTH CHECK ═══════════════════════════════════
  const health = useMemo(() => {
    const inc = parseFloat(profile.monthlyIncome) || 0;
    const exp = parseFloat(profile.monthlyExpenses) || 0;
    const emi = profile.debts.reduce((s, d) => s + (parseFloat(d.emi) || 0), 0);
    const eReq = (exp + emi) * profile.emergencyTarget; // includes EMIs!
    const eCur = parseFloat(profile.emergencyFund) || 0;
    const surplus = inc - exp - emi;
    const totalSIP = goals.reduce((s, g) => s + (calc(g).sip || 0), 0);
    const hiDebt = profile.debts.filter(d => parseFloat(d.interest) > 15).sort((a, b) => parseFloat(b.interest) - parseFloat(a.interest));

    let score = 50;
    if (eCur >= eReq) score += 15; else score -= 10;
    if (surplus > inc * 0.2) score += 15; else if (surplus > 0) score += 5; else score -= 20;
    if (inc > 0 && emi / inc < 0.2) score += 10; else if (inc > 0 && emi / inc > 0.4) score -= 15;
    if (hiDebt.length === 0) score += 10; else score -= 10;
    if (totalSIP > 0 && totalSIP <= surplus * 0.8) score += 10;
    score = Math.max(0, Math.min(100, score));

    return {
      inc, exp, surplus, eReq, eCur,
      ePct: eReq > 0 ? (eCur / eReq) * 100 : 0,
      sipPct: surplus > 0 ? (totalSIP / surplus) * 100 : 0,
      totalSIP, emi,
      debtRatio: inc > 0 ? (emi / inc) * 100 : 0,
      hiDebt, score,
      saveRate: inc > 0 ? ((inc - exp) / inc * 100) : 0,
    };
  }, [profile, goals, calc]);

  // ═══ SCENARIO ANALYSIS ═════════════════════════════
  const scenario = useCallback((goal, type) => {
    const base = calc(goal);
    let mod;
    switch (type) {
      case 'miss6':
        const missed = base.sip * 6;
        const mr = (parseFloat(goal.expectedReturn) / 100) / 12;
        const nm = (parseInt(goal.years) * 12) - 6;
        const ns = nm > 0 ? ((base.remaining + missed * Math.pow(1 + mr, nm)) * mr) / ((Math.pow(1 + mr, nm) - 1) * (1 + mr)) : base.sip;
        return { label: 'Miss 6 months SIP', impact: ns - base.sip, msg: `SIP increases by ${fmt(ns - base.sip)}/mo to compensate.` };
      case 'crash':
        mod = { ...goal, expectedReturn: String(Math.max(4, parseFloat(goal.expectedReturn) - 5)) };
        const cc = calc(mod);
        return { label: 'Returns drop 5%', impact: cc.sip - base.sip, msg: `You'd need ${fmt(cc.sip - base.sip)}/mo more.` };
      case 'early':
        mod = { ...goal, years: String(Math.max(1, parseInt(goal.years) - 2)) };
        const ec = calc(mod);
        return { label: 'Need money 2yr early', impact: ec.sip - base.sip, msg: `Shortening adds ${fmt(ec.sip - base.sip)}/mo.` };
      case 'inflation':
        mod = { ...goal, inflationRate: String(parseFloat(goal.inflationRate) + 2) };
        const ic = calc(mod);
        return { label: 'Inflation +2%', impact: ic.sip - base.sip, msg: `Extra ${fmt(ic.sip - base.sip)}/mo needed.` };
      default: return null;
    }
  }, [calc]);

  // ═══ FORMAT HELPERS ═════════════════════════════════
  const fmt = (n) => {
    if (n === undefined || n === null || isNaN(n)) return '₹0';
    const abs = Math.abs(n), sign = n < 0 ? '-' : '';
    if (abs < 1000) return `${sign}₹${Math.round(abs)}`;
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  };
  const fmtFull = (n) => `₹${Math.round(parseFloat(n) || 0).toLocaleString('en-IN')}`;

  // Debt helpers
  const addDebt = () => setProfile({ ...profile, debts: [...profile.debts, { name: '', type: 'credit-card', amount: '', interest: '', emi: '' }] });
  const updDebt = (i, k, v) => { const d = [...profile.debts]; d[i] = { ...d[i], [k]: v }; setProfile({ ...profile, debts: d }); };
  const rmDebt = (i) => setProfile({ ...profile, debts: profile.debts.filter((_, j) => j !== i) });

  // ═══ EXPORT (readable text, not raw JSON) ══════════
  const exportPlan = () => {
    let r = `${'═'.repeat(50)}\n  ${BRAND} — Your Financial Plan\n  ${new Date().toLocaleDateString('en-IN')}\n${'═'.repeat(50)}\n\n`;
    r += `PROFILE\n  Income: ${fmtFull(profile.monthlyIncome)}/mo\n  Expenses: ${fmtFull(profile.monthlyExpenses)}/mo\n  Surplus: ${fmtFull(health.surplus)}/mo\n  Risk: ${profile.riskTolerance}\n  Health Score: ${health.score}/100\n\n`;
    r += `EMERGENCY FUND\n  Target: ${fmtFull(health.eReq)} (${profile.emergencyTarget} months incl. EMIs)\n  Current: ${fmtFull(health.eCur)}\n  Status: ${health.ePct >= 100 ? 'FUNDED ✓' : `${health.ePct.toFixed(0)}% — Gap: ${fmtFull(health.eReq - health.eCur)}`}\n\n`;
    if (profile.debts.length > 0) {
      r += `DEBTS\n`;
      profile.debts.forEach(d => { r += `  ${d.name || d.type}: ${fmtFull(d.amount)} at ${d.interest}% — EMI ${fmtFull(d.emi)}\n`; });
      r += `  Debt-to-Income: ${health.debtRatio.toFixed(1)}%\n\n`;
    }
    r += `GOALS\n`;
    goals.forEach(g => {
      const c = calc(g);
      r += `\n  ${g.name}\n    Target: ${fmtFull(g.targetAmount)} → ${fmtFull(c.futureVal)} (inflation-adjusted)\n    Timeline: ${g.years}yr | Return: ${g.expectedReturn}% | Inflation: ${g.inflationRate}%\n    SIP: ${fmtFull(c.sip)}/mo${g.annualStepUp ? ` (${g.annualStepUp}% annual increase)` : ''}\n`;
    });
    r += `\n${'═'.repeat(50)}\n  Total Monthly SIP: ${fmtFull(health.totalSIP)}\n${'═'.repeat(50)}\n\n`;
    r += `DISCLAIMER: Educational calculator only. NOT investment\nadvice under SEBI regulations. Consult a SEBI-registered\nInvestment Adviser before investing. Past performance\ndoes not guarantee future returns.\n`;

    const blob = new Blob([r], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `DhanRaksha-Plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Plan exported! ✓');
  };

  // ═══ REUSABLE STYLES ════════════════════════════════
  const S = {
    card: { background: T.card, borderRadius: 16, padding: 24, border: `1px solid ${T.border}`, boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' },
    input: { width: '100%', padding: '12px 16px', border: `2px solid ${T.border}`, borderRadius: 12, fontSize: 16, background: T.card, color: T.text, outline: 'none', boxSizing: 'border-box' },
    btn: { padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 },
    pri: { background: T.accent, color: '#fff' },
    sec: { background: T.cardAlt, color: T.text },
    lbl: { display: 'block', fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' },
    err: { fontSize: 12, color: T.danger, marginTop: 4 },
  };

  // Input component
  const Inp = ({ label, value, onChange, type = 'text', placeholder, error, help, prefix }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={S.lbl}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.muted, fontWeight: 700, fontSize: 15 }}>{prefix}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ ...S.input, ...(prefix ? { paddingLeft: 30 } : {}), ...(error ? { borderColor: T.danger } : {}) }}
          onFocus={e => { if (!error) e.target.style.borderColor = T.accent; }}
          onBlur={e => { if (!error) e.target.style.borderColor = T.border; }} />
      </div>
      {error && <p style={S.err}>{error}</p>}
      {help && !error && <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{help}</p>}
    </div>
  );

  // Score ring SVG
  const ScoreRing = ({ score }) => {
    const c = 2 * Math.PI * 38, off = c - (score / 100) * c;
    const col = score >= 70 ? T.ok : score >= 40 ? T.warn : T.danger;
    return (
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="38" stroke={T.border} strokeWidth="7" fill="none" />
        <circle cx="45" cy="45" r="38" stroke={col} strokeWidth="7" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 45 45)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="45" y="42" textAnchor="middle" fontSize="20" fontWeight="800" fill={T.text}>{score}</text>
        <text x="45" y="56" textAnchor="middle" fontSize="9" fill={T.muted}>/ 100</text>
      </svg>
    );
  };

  // ═══════════════════════════════════════════════════
  // LANDING PAGE
  // ═══════════════════════════════════════════════════
  const Landing = () => (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'linear-gradient(145deg, #0f172a, #064e3b 60%, #0f172a)', minHeight: '100vh', color: '#f1f5f9' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '56px 20px', position: 'relative' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56, opacity: animReady ? 1 : 0, transform: animReady ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', padding: '7px 18px', borderRadius: 24, marginBottom: 28, fontSize: 12, color: '#5eead4', fontWeight: 600, letterSpacing: '0.04em' }}>
            <Shield style={{ width: 13, height: 13 }} /> SEBI-Compliant Educational Tool • Privacy-First
          </div>
          <h1 style={{ fontSize: 'clamp(34px,6vw,52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 14, letterSpacing: '-0.03em' }}>
            {BRAND} <span style={{ fontSize: 'clamp(16px,2vw,20px)', color: '#5eead4', fontWeight: 500 }}>धनरक्षा</span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Professional-grade financial goal calculator. Plan retirement, education, home — everything. Your data never leaves your device.
          </p>
          <button onClick={() => { setStep('onboarding'); setOnboardingStep(1); }} style={{ ...S.btn, ...S.pri, padding: '16px 36px', fontSize: 17, borderRadius: 14, boxShadow: '0 4px 20px rgba(20,184,166,0.35)' }}>
            Start Planning — Free <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 14 }}>No signup • No email • No tracking • 100% on-device</p>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 44, opacity: animReady ? 1 : 0, transform: animReady ? 'none' : 'translateY(30px)', transition: 'all 0.7s ease 0.12s' }}>
          {[
            { icon: <Shield size={24} color="#14b8a6" />, t: 'Privacy First', d: 'Zero cloud storage. Data stays on your device.' },
            { icon: <BarChart3 size={24} color="#14b8a6" />, t: 'Scenario Analysis', d: '"What if I miss SIPs?" See real impact.' },
            { icon: <Target size={24} color="#14b8a6" />, t: 'Risk-Adjusted Plans', d: 'Allocation based on your risk profile & age.' },
            { icon: <BookOpen size={24} color="#14b8a6" />, t: 'SEBI Compliant', d: 'Generic asset classes. No specific fund advice.' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 22 }}>
              <div style={{ marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.t}</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{f.d}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 32, marginBottom: 36, opacity: animReady ? 1 : 0, transition: 'all 0.7s ease 0.24s' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
            {['Enter basics', 'Set goals', 'Get your plan', 'Run scenarios'].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(20,184,166,0.15)', border: '1.5px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 16, fontWeight: 700, color: '#14b8a6' }}>{i + 1}</div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEBI Disclaimer */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 18, display: 'flex', gap: 12, alignItems: 'flex-start', opacity: animReady ? 1 : 0, transition: 'all 0.7s ease 0.36s' }}>
          <AlertTriangle style={{ width: 18, height: 18, color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: '#d4a574', lineHeight: 1.6 }}>
            <strong style={{ color: '#fbbf24' }}>Disclaimer:</strong> {BRAND} is an educational financial planning calculator. It does NOT constitute investment advice under SEBI (Investment Advisers) Regulations, 2013. 
            Allocations shown are generic educational illustrations — we do not recommend specific mutual funds, stocks, or platforms. 
            Please consult a SEBI-registered Investment Adviser (RIA) before making investment decisions. Past performance does not guarantee future returns.
          </p>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // ONBOARDING (4 steps: Profile, Risk, Emergency, Debt)
  // ═══════════════════════════════════════════════════
  const Onboarding = () => {
    const totalSteps = 4;
    const animStyle = { opacity: animReady ? 1 : 0, transform: animReady ? 'none' : 'translateX(16px)', transition: 'all 0.4s ease' };

    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: darkMode ? T.bg : 'linear-gradient(135deg, #f0fdfa, #e0f2fe)', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ ...S.card, padding: 32 }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} style={{ width: i + 1 === onboardingStep ? 28 : 10, height: 8, borderRadius: 4, background: i + 1 <= onboardingStep ? T.accent : T.border, transition: 'all 0.3s' }} />
              ))}
              <span style={{ marginLeft: 10, fontSize: 12, color: T.muted, fontWeight: 700 }}>{onboardingStep}/{totalSteps}</span>
            </div>

            {/* STEP 1: Profile */}
            {onboardingStep === 1 && (
              <div style={animStyle}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Let's begin</h2>
                <p style={{ color: T.muted, marginBottom: 24, fontSize: 14 }}>Basic details to calculate your capacity.</p>
                <Inp label="Name (optional)" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="What should we call you?" />
                <Inp label="Age" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} type="number" placeholder="e.g., 28" error={errors.age} help="Tailors allocation to your life stage" />
                <Inp label="Monthly Income (take-home)" value={profile.monthlyIncome} onChange={e => setProfile({ ...profile, monthlyIncome: e.target.value })} type="number" placeholder="e.g., 100000" prefix="₹" error={errors.income} />
                <Inp label="Monthly Expenses" value={profile.monthlyExpenses} onChange={e => setProfile({ ...profile, monthlyExpenses: e.target.value })} type="number" placeholder="e.g., 60000" prefix="₹" error={errors.expenses} />

                {profile.monthlyIncome && profile.monthlyExpenses && parseFloat(profile.monthlyIncome) > parseFloat(profile.monthlyExpenses) && (
                  <div style={{ background: `${T.ok}12`, border: `1px solid ${T.ok}35`, borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} color={T.ok} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.ok }}>Surplus: {fmt(parseFloat(profile.monthlyIncome) - parseFloat(profile.monthlyExpenses))}/mo ({((1 - parseFloat(profile.monthlyExpenses) / parseFloat(profile.monthlyIncome)) * 100).toFixed(0)}% savings rate)</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setStep('landing')} style={{ ...S.btn, ...S.sec }}><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => { if (valProfile()) setOnboardingStep(2); }} style={{ ...S.btn, ...S.pri, flex: 1, justifyContent: 'center' }}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* STEP 2: Risk */}
            {onboardingStep === 2 && (
              <div style={animStyle}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Risk Appetite</h2>
                <p style={{ color: T.muted, marginBottom: 24, fontSize: 14 }}>How you handle market volatility shapes your plan.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {Object.entries(RISK).map(([k, r]) => (
                    <button key={k} onClick={() => setProfile({ ...profile, riskTolerance: k })}
                      style={{ ...S.card, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', border: profile.riskTolerance === k ? `2px solid ${T.accent}` : `2px solid ${T.border}`, background: profile.riskTolerance === k ? `${T.accent}10` : T.card }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 26 }}>{r.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{r.label}</div>
                          <div style={{ fontSize: 13, color: T.muted }}>{r.desc}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>≤{r.eqMax}% equity</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={S.lbl}>Tax Regime</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[{ k: 'new', l: 'New Regime', d: 'Lower rates, fewer deductions' }, { k: 'old', l: 'Old Regime', d: '80C, 80D, HRA deductions' }].map(r => (
                      <button key={r.k} onClick={() => setProfile({ ...profile, taxRegime: r.k })}
                        style={{ ...S.card, padding: 14, cursor: 'pointer', textAlign: 'center', border: profile.taxRegime === r.k ? `2px solid ${T.accent}` : `2px solid ${T.border}`, background: profile.taxRegime === r.k ? `${T.accent}10` : T.card }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.l}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{r.d}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setOnboardingStep(1)} style={{ ...S.btn, ...S.sec }}><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setOnboardingStep(3)} style={{ ...S.btn, ...S.pri, flex: 1, justifyContent: 'center' }}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* STEP 3: Emergency */}
            {onboardingStep === 3 && (
              <div style={animStyle}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Emergency Fund</h2>
                <p style={{ color: T.muted, marginBottom: 16, fontSize: 14 }}>Your safety net for medical, job loss, or urgent needs.</p>

                <div style={{ background: `${T.ok}08`, border: `1px solid ${T.ok}25`, borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                  <strong style={{ color: T.text }}>Why this matters:</strong> Without an emergency fund, unexpected expenses force you to break investments early — locking in losses and tax penalties. Standard: 6 months of expenses + EMIs.
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={S.lbl}>Target (months of expenses + EMIs)</label>
                  <select value={profile.emergencyTarget} onChange={e => setProfile({ ...profile, emergencyTarget: parseInt(e.target.value) })} style={S.input}>
                    <option value={3}>3 months (Minimum)</option>
                    <option value={6}>6 months (Recommended)</option>
                    <option value={9}>9 months (Cautious)</option>
                    <option value={12}>12 months (Very Conservative)</option>
                  </select>
                </div>

                <Inp label="Current Emergency Savings" value={profile.emergencyFund} onChange={e => setProfile({ ...profile, emergencyFund: e.target.value })} type="number" placeholder="0" prefix="₹" />

                {health.eReq > 0 && (
                  <div style={{ background: T.cardAlt, borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                      <span style={{ color: T.muted }}>Target (incl. EMIs):</span><span style={{ fontWeight: 700 }}>{fmtFull(health.eReq)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                      <span style={{ color: T.muted }}>Current:</span><span style={{ fontWeight: 700 }}>{fmtFull(health.eCur)}</span>
                    </div>
                    <div style={{ height: 7, background: T.border, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, health.ePct)}%`, background: health.ePct >= 100 ? T.ok : T.warn, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 6, textAlign: 'right' }}>{health.ePct.toFixed(0)}% funded</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setOnboardingStep(2)} style={{ ...S.btn, ...S.sec }}><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setOnboardingStep(4)} style={{ ...S.btn, ...S.pri, flex: 1, justifyContent: 'center' }}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* STEP 4: Debt */}
            {onboardingStep === 4 && (
              <div style={animStyle}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Debt Check</h2>
                <p style={{ color: T.muted, marginBottom: 20, fontSize: 14 }}>High-interest debt silently eats your wealth.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => setProfile({ ...profile, hasDebts: true })}
                    style={{ ...S.card, padding: 18, cursor: 'pointer', textAlign: 'center', border: profile.hasDebts === true ? `2px solid ${T.warn}` : `2px solid ${T.border}`, background: profile.hasDebts === true ? `${T.warn}10` : T.card }}>
                    <CreditCard size={22} color={T.warn} style={{ margin: '0 auto 6px', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Yes, I have debts</div>
                  </button>
                  <button onClick={() => setProfile({ ...profile, hasDebts: false, debts: [] })}
                    style={{ ...S.card, padding: 18, cursor: 'pointer', textAlign: 'center', border: profile.hasDebts === false ? `2px solid ${T.ok}` : `2px solid ${T.border}`, background: profile.hasDebts === false ? `${T.ok}10` : T.card }}>
                    <CheckCircle size={22} color={T.ok} style={{ margin: '0 auto 6px', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>No debts 🎉</div>
                  </button>
                </div>

                {profile.hasDebts === true && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600 }}>Your Debts</span>
                      <button onClick={addDebt} style={{ ...S.btn, ...S.sec, padding: '6px 14px', fontSize: 13 }}><Plus size={14} /> Add</button>
                    </div>
                    {profile.debts.map((d, i) => (
                      <div key={i} style={{ background: T.cardAlt, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          <input type="text" placeholder="Name" value={d.name} onChange={e => updDebt(i, 'name', e.target.value)} style={{ ...S.input, padding: '10px 12px', fontSize: 14 }} />
                          <select value={d.type} onChange={e => updDebt(i, 'type', e.target.value)} style={{ ...S.input, padding: '10px 12px', fontSize: 14 }}>
                            <option value="credit-card">Credit Card</option>
                            <option value="personal">Personal Loan</option>
                            <option value="car">Car Loan</option>
                            <option value="education">Education Loan</option>
                            <option value="home">Home Loan</option>
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                          <input type="number" placeholder="Amount ₹" value={d.amount} onChange={e => updDebt(i, 'amount', e.target.value)} style={{ ...S.input, padding: '10px 12px', fontSize: 14 }} />
                          <input type="number" placeholder="Interest %" value={d.interest} onChange={e => updDebt(i, 'interest', e.target.value)} style={{ ...S.input, padding: '10px 12px', fontSize: 14 }} />
                          <input type="number" placeholder="EMI ₹" value={d.emi} onChange={e => updDebt(i, 'emi', e.target.value)} style={{ ...S.input, padding: '10px 12px', fontSize: 14 }} />
                        </div>
                        <button onClick={() => rmDebt(i)} style={{ color: T.danger, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, marginTop: 8, fontWeight: 600 }}>✕ Remove</button>
                      </div>
                    ))}

                    {health.hiDebt.length > 0 && (
                      <div style={{ background: `${T.danger}10`, border: `1px solid ${T.danger}30`, borderRadius: 10, padding: 14, marginTop: 10, display: 'flex', gap: 10 }}>
                        <AlertTriangle size={18} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: T.danger, marginBottom: 2 }}>⚡ Pay High-Interest Debt First</p>
                          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
                            {health.hiDebt[0].name || 'Your debt'} at {health.hiDebt[0].interest}% costs more than most investments return. Every ₹1 toward this "earns" you {health.hiDebt[0].interest}% guaranteed. Clear this before investing aggressively.
                          </p>
                        </div>
                      </div>
                    )}

                    {health.debtRatio > 0 && (
                      <div style={{ background: T.cardAlt, borderRadius: 10, padding: 14, marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                          <span style={{ color: T.muted }}>Debt-to-Income:</span>
                          <span style={{ fontWeight: 700, color: health.debtRatio > 40 ? T.danger : health.debtRatio > 25 ? T.warn : T.ok }}>{health.debtRatio.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, health.debtRatio * 2)}%`, background: health.debtRatio > 40 ? T.danger : health.debtRatio > 25 ? T.warn : T.ok, borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{health.debtRatio <= 25 ? 'Healthy ✓' : health.debtRatio <= 40 ? 'Manageable' : '⚠️ High — prioritize repayment'}</p>
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={() => setOnboardingStep(3)} style={{ ...S.btn, ...S.sec }}><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => {
                    if (profile.hasDebts === null) { toast('Select debt status first'); return; }
                    setStep('dashboard'); toast('Welcome! 🎉');
                  }} style={{ ...S.btn, ...S.pri, flex: 1, justifyContent: 'center' }}>
                    View Dashboard <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // GOAL MODAL (with projection, allocation, scenarios)
  // ═══════════════════════════════════════════════════
  const GoalModal = () => {
    const [form, setForm] = useState(editGoal || {
      id: Date.now(), type: 'custom', name: '', targetAmount: '', years: '',
      inflationRate: '6', expectedReturn: '12', currentSavings: '0', annualStepUp: '10',
    });
    const [showAdv, setShowAdv] = useState(false);
    const [scenKey, setScenKey] = useState(null);

    const c = form.years && form.targetAmount && parseFloat(form.targetAmount) > 0 && parseInt(form.years) > 0 ? calc(form) : null;
    const alloc = c ? getAlloc(form) : [];
    const PIE_COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#2563eb', '#dc2626', '#7c3aed', '#059669', '#0891b2'];

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, zIndex: 100 }} onClick={() => { setShowModal(false); setEditGoal(null); }}>
        <div style={{ ...S.card, maxWidth: 680, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: T.card, zIndex: 2, borderRadius: '16px 16px 0 0' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{editGoal ? `Edit: ${editGoal.name}` : 'New Goal'}</h2>
            <button onClick={() => { setShowModal(false); setEditGoal(null); }} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: T.cardAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color={T.muted} />
            </button>
          </div>

          <div style={{ padding: 24 }}>
            {/* Templates */}
            {!editGoal && (
              <div style={{ marginBottom: 20 }}>
                <label style={S.lbl}>Quick Start</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(GOALS_TPL).map(([k, t]) => (
                    <button key={k} onClick={() => setForm({ ...form, type: k, name: t.name, targetAmount: String(t.amt), years: String(t.yrs), inflationRate: String(t.infl) })}
                      style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: form.type === k ? `2px solid ${t.color}` : `1px solid ${T.border}`, background: form.type === k ? `${t.color}12` : T.cardAlt, color: form.type === k ? t.color : T.muted }}>
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={S.lbl}>Goal Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...S.input, ...(errors.name ? { borderColor: T.danger } : {}) }} placeholder="e.g., Retirement" />
                {errors.name && <p style={S.err}>{errors.name}</p>}
              </div>
              <div>
                <label style={S.lbl}>Target Amount (₹ today) *</label>
                <input type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} style={{ ...S.input, ...(errors.amount ? { borderColor: T.danger } : {}) }} placeholder="e.g., 10000000" />
                {errors.amount && <p style={S.err}>{errors.amount}</p>}
                {form.targetAmount && parseFloat(form.targetAmount) >= 1000 && <p style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{fmtFull(form.targetAmount)}</p>}
              </div>
              <div>
                <label style={S.lbl}>Time Horizon (years) *</label>
                <input type="number" value={form.years} onChange={e => setForm({ ...form, years: e.target.value })} style={{ ...S.input, ...(errors.years ? { borderColor: T.danger } : {}) }} placeholder="e.g., 10" />
                {errors.years && <p style={S.err}>{errors.years}</p>}
              </div>
              <div>
                <label style={S.lbl}>Current Savings for This (₹)</label>
                <input type="number" value={form.currentSavings} onChange={e => setForm({ ...form, currentSavings: e.target.value })} style={S.input} placeholder="0" />
              </div>
            </div>

            {/* Inflation warning for education */}
            {form.type === 'education' && parseFloat(form.inflationRate) >= 9 && parseFloat(form.expectedReturn) <= 13 && (
              <div style={{ background: `${T.warn}10`, border: `1px solid ${T.warn}30`, borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: T.muted, display: 'flex', gap: 8 }}>
                <AlertCircle size={16} color={T.warn} style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong style={{ color: T.warn }}>Heads up:</strong> Education inflation ({form.inflationRate}%) nearly matches your expected return ({form.expectedReturn}%). Real growth is very thin. Consider extending the timeline or targeting a higher return via greater equity exposure.</span>
              </div>
            )}

            {/* Advanced */}
            <button onClick={() => setShowAdv(!showAdv)} style={{ background: 'none', border: 'none', color: T.accent, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
              {showAdv ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Advanced Settings
            </button>
            {showAdv && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, background: T.cardAlt, padding: 18, borderRadius: 10 }}>
                <div>
                  <label style={S.lbl}>Inflation %</label>
                  <input type="number" value={form.inflationRate} onChange={e => setForm({ ...form, inflationRate: e.target.value })} style={S.input} step="0.5" />
                  {errors.infl && <p style={S.err}>{errors.infl}</p>}
                </div>
                <div>
                  <label style={S.lbl}>Expected Return %</label>
                  <input type="number" value={form.expectedReturn} onChange={e => setForm({ ...form, expectedReturn: e.target.value })} style={S.input} step="0.5" />
                  {errors.ret && <p style={S.err}>{errors.ret}</p>}
                </div>
                <div>
                  <label style={S.lbl}>Annual SIP Step-Up %</label>
                  <input type="number" value={form.annualStepUp} onChange={e => setForm({ ...form, annualStepUp: e.target.value })} style={S.input} />
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Yearly SIP increase (salary growth)</p>
                </div>
              </div>
            )}

            {/* ── RESULTS ── */}
            {c && (
              <>
                {/* SIP summary */}
                <div style={{ background: `${T.accent}0c`, border: `1px solid ${T.accent}30`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                    <div>
                      <p style={{ fontSize: 11, color: T.muted, marginBottom: 3, fontWeight: 600 }}>INFLATION-ADJUSTED</p>
                      <p style={{ fontSize: 20, fontWeight: 800 }}>{fmt(c.futureVal)}</p>
                    </div>
                    <div style={{ borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>
                      <p style={{ fontSize: 11, color: T.muted, marginBottom: 3, fontWeight: 600 }}>MONTHLY SIP</p>
                      <p style={{ fontSize: 26, fontWeight: 800, color: T.accent }}>{fmt(c.sip)}</p>
                      {form.annualStepUp && parseFloat(form.annualStepUp) > 0 && <p style={{ fontSize: 11, color: T.muted }}>+{form.annualStepUp}%/yr</p>}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: T.muted, marginBottom: 3, fontWeight: 600 }}>TOTAL INVESTED</p>
                      <p style={{ fontSize: 20, fontWeight: 800 }}>{fmt(c.total)}</p>
                    </div>
                  </div>

                  {health.surplus > 0 && c.sip > health.surplus * 0.8 && (
                    <div style={{ marginTop: 14, padding: 10, background: `${T.warn}12`, borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <AlertTriangle size={15} color={T.warn} />
                      <p style={{ fontSize: 12, color: T.warn }}>This is {(c.sip / health.surplus * 100).toFixed(0)}% of your surplus. Consider extending timeline.</p>
                    </div>
                  )}
                </div>

                {/* Chart */}
                <div style={{ marginBottom: 22 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Growth Projection</h3>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer>
                      <AreaChart data={c.proj}>
                        <defs>
                          <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={T.accent} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: T.muted }} />
                        <YAxis tick={{ fontSize: 10, fill: T.muted }} tickFormatter={v => fmt(v)} />
                        <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="corpus" stroke={T.accent} fill="url(#gc)" strokeWidth={2} name="Corpus" />
                        <Area type="monotone" dataKey="invested" stroke="#6366f1" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Invested" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Asset allocation */}
                {alloc.length > 0 && (
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>Suggested Asset Mix</h3>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, background: `${T.accent}12`, padding: '4px 10px', borderRadius: 12 }}>{RISK[profile.riskTolerance]?.emoji} {RISK[profile.riskTolerance]?.label}</span>
                    </div>

                    {/* Allocation bar */}
                    <div style={{ display: 'flex', gap: 2, height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14 }}>
                      {alloc.map((a, i) => <div key={i} style={{ width: `${a.pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />)}
                    </div>

                    {alloc.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < alloc.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], marginRight: 10, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{a.info.name}</p>
                          <p style={{ fontSize: 12, color: T.muted }}>{a.info.risk} risk • {a.info.avg}% avg • ~{a.postTax}% post-tax</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 17, fontWeight: 800, color: PIE_COLORS[i % PIE_COLORS.length] }}>{a.pct}%</p>
                          <p style={{ fontSize: 12, color: T.muted }}>{fmt(a.monthly)}/mo</p>
                        </div>
                      </div>
                    ))}

                    <div style={{ background: `${T.warn}0c`, border: `1px solid ${T.warn}25`, borderRadius: 8, padding: 10, marginTop: 12, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                      <strong style={{ color: T.warn }}>Note:</strong> Generic asset class allocation for educational purposes only. NOT a specific fund recommendation. Consult a SEBI-registered Investment Adviser.
                    </div>
                  </div>
                )}

                {/* Scenarios */}
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>🔮 What-If Scenarios</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { k: 'miss6', l: 'Miss 6 months SIP', i: '⏸️' },
                      { k: 'crash', l: 'Returns drop 5%', i: '📉' },
                      { k: 'early', l: 'Need money 2yr early', i: '⏰' },
                      { k: 'inflation', l: 'Inflation +2%', i: '📈' },
                    ].map(s => {
                      const res = scenKey === s.k ? scenario(form, s.k) : null;
                      return (
                        <button key={s.k} onClick={() => setScenKey(scenKey === s.k ? null : s.k)}
                          style={{ ...S.card, padding: 12, cursor: 'pointer', textAlign: 'left', fontSize: 13, border: scenKey === s.k ? `2px solid ${T.warn}` : `1px solid ${T.border}`, background: scenKey === s.k ? `${T.warn}06` : T.card }}>
                          <div style={{ fontWeight: 600, marginBottom: 3 }}>{s.i} {s.l}</div>
                          {res && <div style={{ color: T.danger, fontWeight: 700, fontSize: 15 }}>+{fmt(Math.abs(res.impact))}/mo<p style={{ fontSize: 11, fontWeight: 400, color: T.muted, marginTop: 3 }}>{res.msg}</p></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Save */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, position: 'sticky', bottom: 0, background: T.card, padding: '12px 0' }}>
              <button onClick={() => { setShowModal(false); setEditGoal(null); }} style={{ ...S.btn, ...S.sec }}>Cancel</button>
              <button onClick={() => {
                if (!valGoal(form)) return;
                if (editGoal) { setGoals(goals.map(g => g.id === form.id ? form : g)); toast('Updated ✓'); }
                else { setGoals([...goals, form]); toast('Goal added 🎯'); }
                setShowModal(false); setEditGoal(null);
              }} style={{ ...S.btn, ...S.pri, flex: 1, justifyContent: 'center' }}>
                {editGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // SETTINGS PANEL (edit profile post-onboarding)
  // ═══════════════════════════════════════════════════
  const SettingsPanel = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }} onClick={() => setShowSettings(false)}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 380, background: T.card, padding: 28, overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Edit Profile</h2>
          <button onClick={() => setShowSettings(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: T.cardAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color={T.muted} /></button>
        </div>
        <Inp label="Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
        <Inp label="Monthly Income ₹" value={profile.monthlyIncome} onChange={e => setProfile({ ...profile, monthlyIncome: e.target.value })} type="number" />
        <Inp label="Monthly Expenses ₹" value={profile.monthlyExpenses} onChange={e => setProfile({ ...profile, monthlyExpenses: e.target.value })} type="number" />
        <Inp label="Emergency Fund ₹" value={profile.emergencyFund} onChange={e => setProfile({ ...profile, emergencyFund: e.target.value })} type="number" />
        <div style={{ marginBottom: 20 }}><label style={S.lbl}>Emergency Target</label>
          <select value={profile.emergencyTarget} onChange={e => setProfile({ ...profile, emergencyTarget: parseInt(e.target.value) })} style={S.input}>
            <option value={3}>3 months</option><option value={6}>6 months</option><option value={9}>9 months</option><option value={12}>12 months</option>
          </select>
        </div>
        <div style={{ marginBottom: 20 }}><label style={S.lbl}>Risk Tolerance</label>
          <select value={profile.riskTolerance} onChange={e => setProfile({ ...profile, riskTolerance: e.target.value })} style={S.input}>
            {Object.entries(RISK).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}><label style={S.lbl}>Tax Regime</label>
          <select value={profile.taxRegime} onChange={e => setProfile({ ...profile, taxRegime: e.target.value })} style={S.input}>
            <option value="new">New Regime</option><option value="old">Old Regime</option>
          </select>
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18, marginTop: 18 }}>
          <button onClick={() => {
            if (window.confirm('Reset everything? This cannot be undone.')) {
              setProfile({ name: '', age: '', monthlyIncome: '', monthlyExpenses: '', emergencyTarget: 6, emergencyFund: '0', hasDebts: null, debts: [], riskTolerance: 'moderate', taxRegime: 'new' });
              setGoals([]); setStep('landing'); setShowSettings(false);
              try { window.storage?.delete('dhanraksha'); } catch (e) {}
            }
          }} style={{ ...S.btn, background: `${T.danger}12`, color: T.danger, width: '100%', justifyContent: 'center' }}>
            <RotateCcw size={16} /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════
  const Dashboard = () => {
    const insights = useMemo(() => {
      const items = [];
      if (health.hiDebt.length > 0)
        items.push({ t: 'danger', title: '⚡ Clear High-Interest Debt', text: `${health.hiDebt[0].name || 'Your debt'} at ${health.hiDebt[0].interest}% costs more than investments return. Pay this first.` });
      if (health.ePct < 100)
        items.push({ t: 'warn', title: '🛡️ Build Emergency Fund', text: `Gap: ${fmtFull(health.eReq - health.eCur)}. Use liquid fund or RD before equity investing.` });
      if (health.totalSIP > health.surplus * 0.9 && goals.length > 0)
        items.push({ t: 'warn', title: '⚠️ SIPs Exceed Capacity', text: `Need ${fmtFull(health.totalSIP)}/mo, surplus is ${fmtFull(health.surplus)}. Extend timelines or prioritize.` });
      if (health.saveRate < 20 && health.inc > 0)
        items.push({ t: 'info', title: '💡 Low Savings Rate', text: `${health.saveRate.toFixed(0)}% — aim for 20-30%. Track discretionary spending.` });
      if (health.saveRate >= 30 && health.inc > 0)
        items.push({ t: 'ok', title: '🌟 Great Savings Rate', text: `${health.saveRate.toFixed(0)}% is excellent. Well-positioned for wealth building.` });
      if (goals.length === 0)
        items.push({ t: 'info', title: '🎯 Add Your First Goal', text: 'Start with what matters most — retirement, education, or home.' });
      if (profile.taxRegime === 'old' && goals.length > 0)
        items.push({ t: 'info', title: '📋 Tax Opportunity', text: 'Old Regime: ELSS for 80C (₹1.5L), NPS for 80CCD(1B) (₹50K extra).' });
      return items;
    }, [health, goals, profile]);

    const tabs = [
      { k: 'overview', l: 'Overview' },
      { k: 'goals', l: `Goals (${goals.length})` },
      { k: 'insights', l: 'Insights' },
    ];

    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bg, color: T.text, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1060, margin: '0 auto', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${T.accent}, #2563eb)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{BRAND}</h1>
                <p style={{ fontSize: 11, color: T.muted }}>Hey {profile.name || 'Friend'} 👋</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ ...S.btn, ...S.sec, padding: '7px 10px' }}>{darkMode ? <Sun size={15} /> : <Moon size={15} />}</button>
              <button onClick={exportPlan} style={{ ...S.btn, ...S.sec, padding: '7px 10px' }}><Download size={15} /></button>
              <button onClick={() => setShowSettings(true)} style={{ ...S.btn, ...S.sec, padding: '7px 10px' }}><Settings size={15} /></button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 18px', display: 'flex', gap: 2 }}>
            {tabs.map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                style={{ padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', color: activeTab === t.k ? T.accent : T.muted, borderBottom: activeTab === t.k ? `2px solid ${T.accent}` : '2px solid transparent' }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '22px 18px' }}>
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginBottom: 22 }}>
                {/* Health */}
                <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <ScoreRing score={health.score} />
                  <div>
                    <p style={{ fontSize: 12, color: T.muted, fontWeight: 700, marginBottom: 2 }}>FINANCIAL HEALTH</p>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{health.score >= 70 ? 'Strong 💪' : health.score >= 40 ? 'Needs Work' : 'At Risk ⚠️'}</p>
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Savings, debt, emergency, goals</p>
                  </div>
                </div>
                {/* Emergency */}
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Shield size={20} color={T.ok} />
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: health.ePct >= 100 ? `${T.ok}15` : `${T.warn}15`, color: health.ePct >= 100 ? T.ok : T.warn }}>{health.ePct >= 100 ? '✓ Funded' : `${health.ePct.toFixed(0)}%`}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>EMERGENCY FUND</p>
                  <p style={{ fontSize: 24, fontWeight: 800, margin: '2px 0' }}>{fmt(health.eCur)}</p>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>of {fmt(health.eReq)} (incl. EMIs)</p>
                  <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, health.ePct)}%`, background: health.ePct >= 100 ? T.ok : T.warn, borderRadius: 3, transition: 'width 0.6s' }} />
                  </div>
                </div>
                {/* Surplus */}
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <DollarSign size={20} color={T.accent} />
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: `${T.accent}15`, color: T.accent }}>{health.sipPct > 0 ? `${health.sipPct.toFixed(0)}% to SIPs` : 'Free'}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>MONTHLY SURPLUS</p>
                  <p style={{ fontSize: 24, fontWeight: 800, margin: '2px 0', color: health.surplus > 0 ? T.text : T.danger }}>{fmt(health.surplus)}</p>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>SIPs: {fmt(health.totalSIP)} • Free: {fmt(Math.max(0, health.surplus - health.totalSIP))}</p>
                  <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, health.sipPct)}%`, background: health.sipPct <= 80 ? T.accent : T.danger, borderRadius: 3, transition: 'width 0.6s' }} />
                  </div>
                </div>
              </div>

              {/* Goal cards */}
              {goals.length > 0 ? (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>Your Goals</h2>
                    <button onClick={() => { setEditGoal(null); setShowModal(true); }} style={{ ...S.btn, ...S.pri, padding: '8px 16px', fontSize: 14 }}><Plus size={14} /> Add</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
                    {goals.map(g => {
                      const c = calc(g);
                      const t = GOALS_TPL[g.type] || GOALS_TPL.custom;
                      return (
                        <div key={g.id} style={{ ...S.card, borderLeft: `4px solid ${t.color}`, cursor: 'pointer' }}
                          onClick={() => { setEditGoal(g); setShowModal(true); }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>{t.icon} {g.name}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={e => { e.stopPropagation(); setEditGoal(g); setShowModal(true); }} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.cardAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={13} color={T.muted} /></button>
                              <button onClick={e => { e.stopPropagation(); if (window.confirm('Delete?')) setGoals(goals.filter(x => x.id !== g.id)); }} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.cardAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color={T.danger} /></button>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                            <div><p style={{ fontSize: 10, color: T.muted }}>Target</p><p style={{ fontWeight: 700, fontSize: 14 }}>{fmt(c.futureVal)}</p></div>
                            <div><p style={{ fontSize: 10, color: T.muted }}>SIP/mo</p><p style={{ fontWeight: 700, fontSize: 14, color: T.accent }}>{fmt(c.sip)}</p></div>
                            <div><p style={{ fontSize: 10, color: T.muted }}>Timeline</p><p style={{ fontWeight: 700, fontSize: 14 }}>{g.years}yr</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ ...S.card, textAlign: 'center', padding: 44 }}>
                  <Target size={40} color={T.border} style={{ margin: '0 auto 14px' }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No goals yet</h3>
                  <p style={{ color: T.muted, marginBottom: 22 }}>Pick a template to start:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                    {Object.entries(GOALS_TPL).map(([k, t]) => (
                      <button key={k} onClick={() => { setEditGoal({ id: Date.now(), type: k, name: t.name, targetAmount: String(t.amt), years: String(t.yrs), inflationRate: String(t.infl), expectedReturn: '12', currentSavings: '0', annualStepUp: '10' }); setShowModal(true); }}
                        style={{ ...S.btn, ...S.sec, flexDirection: 'column', padding: '14px 18px', minWidth: 100 }}>
                        <span style={{ fontSize: 22, marginBottom: 2 }}>{t.icon}</span>
                        <span style={{ fontSize: 12 }}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── GOALS TAB ── */}
          {activeTab === 'goals' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>All Goals</h2>
                <button onClick={() => { setEditGoal(null); setShowModal(true); }} style={{ ...S.btn, ...S.pri }}><Plus size={16} /> New Goal</button>
              </div>

              {goals.length > 0 && (
                <>
                  <div style={{ ...S.card, marginBottom: 16, display: 'flex', justifyContent: 'space-around', textAlign: 'center', padding: 18, flexWrap: 'wrap', gap: 12 }}>
                    <div><p style={{ fontSize: 11, color: T.muted }}>Goals</p><p style={{ fontSize: 22, fontWeight: 800 }}>{goals.length}</p></div>
                    <div><p style={{ fontSize: 11, color: T.muted }}>Total SIP/mo</p><p style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>{fmt(health.totalSIP)}</p></div>
                    <div><p style={{ fontSize: 11, color: T.muted }}>Total Target</p><p style={{ fontSize: 22, fontWeight: 800 }}>{fmt(goals.reduce((s, g) => s + calc(g).futureVal, 0))}</p></div>
                    <div><p style={{ fontSize: 11, color: T.muted }}>After SIPs</p><p style={{ fontSize: 22, fontWeight: 800, color: health.surplus - health.totalSIP >= 0 ? T.ok : T.danger }}>{fmt(health.surplus - health.totalSIP)}</p></div>
                  </div>

                  {health.totalSIP > health.surplus && (
                    <div style={{ background: `${T.danger}0c`, border: `1px solid ${T.danger}25`, borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', gap: 10 }}>
                      <AlertTriangle size={18} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 13, color: T.muted }}><strong style={{ color: T.danger }}>Over capacity!</strong> SIPs ({fmtFull(health.totalSIP)}) exceed surplus ({fmtFull(health.surplus)}). Prioritize time-sensitive goals first.</p>
                    </div>
                  )}

                  {goals.map(g => {
                    const c = calc(g); const t = GOALS_TPL[g.type] || GOALS_TPL.custom;
                    return (
                      <div key={g.id} style={{ ...S.card, marginBottom: 10, borderLeft: `4px solid ${t.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{t.icon}</span>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</h3>
                            <p style={{ fontSize: 12, color: T.muted }}>{g.years}yr • {g.expectedReturn}% • {g.inflationRate}% infl{g.annualStepUp && parseFloat(g.annualStepUp) > 0 ? ` • ${g.annualStepUp}% step-up` : ''}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 18, fontWeight: 800, color: T.accent }}>{fmt(c.sip)}<span style={{ fontSize: 12, fontWeight: 400, color: T.muted }}>/mo</span></p>
                            <p style={{ fontSize: 11, color: T.muted }}>Target: {fmt(c.futureVal)}</p>
                          </div>
                          <button onClick={() => { setEditGoal(g); setShowModal(true); }} style={{ ...S.btn, ...S.sec, padding: '7px 10px' }}><Edit size={14} /></button>
                          <button onClick={() => { if (window.confirm('Delete?')) setGoals(goals.filter(x => x.id !== g.id)); }} style={{ ...S.btn, padding: '7px 10px', background: `${T.danger}0c`, color: T.danger, border: 'none' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {goals.length === 0 && <div style={{ ...S.card, textAlign: 'center', padding: 40 }}><p style={{ color: T.muted }}>No goals yet. Add one to start!</p></div>}
            </>
          )}

          {/* ── INSIGHTS TAB ── */}
          {activeTab === 'insights' && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Personalized Insights</h2>
              <p style={{ color: T.muted, marginBottom: 20, fontSize: 13 }}>Educational recommendations. Consult a SEBI-registered adviser for personalized advice.</p>

              {insights.map((ins, i) => {
                const cols = { danger: T.danger, warn: T.warn, info: '#2563eb', ok: T.ok };
                return (
                  <div key={i} style={{ ...S.card, marginBottom: 10, borderLeft: `4px solid ${cols[ins.t]}` }}>
                    <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{ins.title}</p>
                    <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{ins.text}</p>
                  </div>
                );
              })}

              {/* How to act */}
              <div style={{ ...S.card, marginTop: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>📋 How to Act on Your Plan</h3>
                {[
                  { n: '1', t: 'Build Emergency Fund First', d: 'Keep this in a savings account or liquid mutual fund for instant access. Do NOT invest this in equity.' },
                  { n: '2', t: 'Clear High-Interest Debt', d: 'Any debt above 12-15% interest (credit cards, personal loans) should be cleared before investing.' },
                  { n: '3', t: 'Start SIPs via Any AMFI-Registered Platform', d: 'Choose a platform registered with AMFI/SEBI. Set up auto-debit SIPs for discipline. We deliberately don\'t name platforms to stay unbiased.' },
                  { n: '4', t: 'Review Every 6 Months', d: 'Update your income, expenses, and goal progress. Rebalance if your allocation drifts more than 10% from target.' },
                  { n: '5', t: 'Consult a Professional', d: 'For amounts above ₹50L or complex situations, a SEBI-registered Investment Adviser (RIA) is worth the fee. Find one at sebi.gov.in.' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: T.accent }}>{s.n}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{s.t}</p>
                      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SEBI disclaimer */}
              <div style={{ background: `${T.warn}08`, border: `1px solid ${T.warn}20`, borderRadius: 10, padding: 14, marginTop: 18, display: 'flex', gap: 10 }}>
                <AlertTriangle size={16} color={T.warn} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                  {BRAND} is an educational tool under SEBI guidelines. It shows generic asset classes — NOT specific funds or platforms. This is NOT investment advice. Past returns ≠ future performance. Consult a SEBI-registered RIA.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div>
      {step === 'landing' && <Landing />}
      {step === 'onboarding' && <Onboarding />}
      {step === 'dashboard' && <Dashboard />}
      {showModal && <GoalModal />}
      {showSettings && <SettingsPanel />}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: T.text, color: T.bg, padding: '12px 24px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default FinancialGoalPlanner;
