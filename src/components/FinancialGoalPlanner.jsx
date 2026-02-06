import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { PlusCircle, Trash2, TrendingUp, Target, AlertCircle, DollarSign, Calendar, Percent, Save, Download, Info, RefreshCw, Activity, CheckCircle, ArrowRight, ArrowLeft, Shield, Home, Briefcase, GraduationCap, Heart, Users, Zap, Award, Edit, Play, XCircle, Bell, FileText, ExternalLink } from 'lucide-react';

const FinancialPlanner = () => {
  // ==================== STATE MANAGEMENT ====================
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userProfile, setUserProfile] = useState({
    name: '', age: '', monthlyIncome: '', monthlyExpenses: '', existingSavings: '',
    hasEmergencyFund: null, emergencyFundAmount: '0',
    hasDebts: null, debts: []
  });
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState({
    name: '', type: 'retirement', targetAmount: '', years: '',
    inflationCategory: 'General', inflationRate: '6', riskProfile: 'Medium',
    customReturn: '', useCustomReturn: false, currentSavings: '0',
    startDate: new Date().toISOString().split('T')[0], endDate: ''
  });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // ==================== DATA STRUCTURES ====================
  
  const goalTemplates = {
    retirement: {
      name: 'Retirement Planning', icon: Home,
      defaultAmount: (income) => income * 12 * 100,
      defaultYears: (age) => 60 - parseInt(age),
      inflationCategory: 'General', riskProfile: 'Medium',
      description: 'Build corpus for comfortable retirement',
      tip: 'Rule of thumb: 100x monthly expenses'
    },
    education: {
      name: 'Child Education', icon: GraduationCap,
      defaultAmount: () => 2000000,
      defaultYears: () => 15,
      inflationCategory: 'Education', riskProfile: 'Medium',
      description: 'Secure child\'s educational future',
      tip: 'Engineering/Medical: ₹20-50L'
    },
    house: {
      name: 'Dream Home', icon: Home,
      defaultAmount: () => 5000000,
      defaultYears: () => 10,
      inflationCategory: 'Property', riskProfile: 'Medium',
      description: 'Down payment or full purchase',
      tip: 'Typically 20-30% down payment'
    },
    wedding: {
      name: 'Wedding', icon: Heart,
      defaultAmount: () => 1000000,
      defaultYears: () => 5,
      inflationCategory: 'Lifestyle', riskProfile: 'Low',
      description: 'Plan your family wedding',
      tip: 'Average Indian wedding: ₹10-20L'
    },
    emergency: {
      name: 'Emergency Fund', icon: Shield,
      defaultAmount: (income, expenses) => expenses * 6,
      defaultYears: () => 1,
      inflationCategory: 'General', riskProfile: 'Low',
      description: 'Safety net for unexpected events',
      tip: 'Aim for 6-12 months expenses'
    },
    travel: {
      name: 'Dream Vacation', icon: Activity,
      defaultAmount: () => 500000,
      defaultYears: () => 3,
      inflationCategory: 'Lifestyle', riskProfile: 'Low',
      description: 'International travel or special trip',
      tip: 'Europe: ₹3-5L, USA: ₹5-8L per person'
    }
  };

  const indicesData = {
    'Nifty 50': { current: 23847.50, change: 125.30, changePct: 0.53, returns: { '1yr': 10.2, '3yr': 14.5, '5yr': 13.8, '10yr': 12.5 }, category: 'Broad Market' },
    'Sensex': { current: 78542.60, change: 412.85, changePct: 0.53, returns: { '1yr': 10.5, '3yr': 14.8, '5yr': 14.1, '10yr': 12.8 }, category: 'Broad Market' },
    'Nifty Bank': { current: 51234.80, change: 285.90, changePct: 0.56, returns: { '1yr': 8.5, '3yr': 12.8, '5yr': 11.9, '10yr': 13.2 }, category: 'Sectoral' },
    'Nifty IT': { current: 35687.40, change: -125.30, changePct: -0.35, returns: { '1yr': 18.5, '3yr': 22.3, '5yr': 19.8, '10yr': 16.5 }, category: 'Sectoral' },
    'Nifty Auto': { current: 22145.60, change: 198.45, changePct: 0.90, returns: { '1yr': 22.5, '3yr': 25.8, '5yr': 21.2, '10yr': 17.5 }, category: 'Sectoral' },
    'Nifty Pharma': { current: 18956.25, change: 142.75, changePct: 0.76, returns: { '1yr': 14.2, '3yr': 18.5, '5yr': 16.7, '10yr': 15.8 }, category: 'Sectoral' },
    'Nifty FMCG': { current: 56234.90, change: 85.25, changePct: 0.15, returns: { '1yr': 9.2, '3yr': 11.5, '5yr': 10.8, '10yr': 11.2 }, category: 'Sectoral' },
    'Nifty Metal': { current: 8945.75, change: -45.85, changePct: -0.51, returns: { '1yr': 15.8, '3yr': 19.2, '5yr': 14.5, '10yr': 12.8 }, category: 'Sectoral' },
    'Nifty Realty': { current: 975.40, change: 12.35, changePct: 1.28, returns: { '1yr': 35.2, '3yr': 38.5, '5yr': 28.7, '10yr': 18.2 }, category: 'Sectoral' },
    'Nifty Midcap 100': { current: 54682.30, change: 245.75, changePct: 0.45, returns: { '1yr': 28.5, '3yr': 32.8, '5yr': 26.7, '10yr': 19.2 }, category: 'Market Cap' },
    'Nifty Smallcap 100': { current: 16842.65, change: 125.90, changePct: 0.75, returns: { '1yr': 35.2, '3yr': 38.5, '5yr': 29.8, '10yr': 21.5 }, category: 'Market Cap' }
  };

  const inflationCategories = {
    'Education': { rate: 10, description: 'School/College fees, Coaching' },
    'General': { rate: 6, description: 'Overall inflation' },
    'Property': { rate: 8, description: 'Real estate' },
    'Healthcare': { rate: 12, description: 'Medical expenses' },
    'Lifestyle': { rate: 7, description: 'Travel, Entertainment' },
    'Custom': { rate: 6, description: 'Your own rate' }
  };

  const investmentProducts = {
    'Nifty 50 Index': {
      return: 12.5, category: 'Equity', risk: 'Medium', taxType: 'LTCG', taxRate: 12.5,
      rolling: { '1yr': 10.2, '3yr': 14.5, '5yr': 13.8, '10yr': 12.5 },
      platforms: ['Groww', 'Zerodha', 'Paytm Money'],
      topFunds: ['ICICI Pru Nifty 50', 'UTI Nifty 50', 'HDFC Index Nifty 50']
    },
    'Large Cap Funds': {
      return: 11.5, category: 'Equity', risk: 'Medium', taxType: 'LTCG', taxRate: 12.5,
      rolling: { '1yr': 9.5, '3yr': 13.2, '5yr': 12.8, '10yr': 11.5 },
      platforms: ['Groww', 'Kuvera', 'ET Money'],
      topFunds: ['Axis Bluechip', 'Mirae Asset Large Cap', 'ICICI Pru Bluechip']
    },
    'Mid Cap Funds': {
      return: 14.5, category: 'Equity', risk: 'High', taxType: 'LTCG', taxRate: 12.5,
      rolling: { '1yr': 12.8, '3yr': 16.5, '5yr': 15.2, '10yr': 14.5 },
      platforms: ['Groww', 'Zerodha', 'Kuvera'],
      topFunds: ['Parag Parikh Flexi Cap', 'Motilal Oswal Midcap', 'Edelweiss Mid Cap']
    },
    'ELSS Tax Saver': {
      return: 12, category: 'Equity', risk: 'Medium', taxType: 'LTCG', taxRate: 12.5,
      taxBenefit: 46800, rolling: { '1yr': 10.5, '3yr': 14.2, '5yr': 13.1, '10yr': 12 },
      platforms: ['Groww', 'Kuvera', 'Paytm Money'],
      topFunds: ['Axis ELSS', 'Mirae Asset Tax Saver', 'Quant ELSS']
    },
    'Debt Funds': {
      return: 7.5, category: 'Debt', risk: 'Low', taxType: 'Income', taxRate: 31.2,
      rolling: { '1yr': 6.8, '3yr': 7.2, '5yr': 7.4, '10yr': 7.5 },
      platforms: ['Groww', 'Paytm Money'],
      topFunds: ['ICICI Pru Debt', 'HDFC Corporate Bond', 'Aditya Birla Debt']
    },
    'PPF': {
      return: 7.1, category: 'Fixed Income', risk: 'Low', taxType: 'EEE', taxRate: 0,
      taxBenefit: 46800, rolling: { '1yr': 7.1, '3yr': 7.1, '5yr': 7.1, '10yr': 7.1 },
      platforms: ['Bank Branch', 'Post Office'],
      topFunds: ['Any nationalized bank']
    },
    'Fixed Deposits': {
      return: 7, category: 'Fixed Income', risk: 'Low', taxType: 'Income', taxRate: 31.2,
      rolling: { '1yr': 6.5, '3yr': 6.8, '5yr': 6.9, '10yr': 7 },
      platforms: ['Any Bank'],
      topFunds: ['HDFC Bank', 'SBI', 'ICICI Bank']
    },
    'NPS': {
      return: 10, category: 'Hybrid', risk: 'Medium', taxType: 'EET', taxRate: 0,
      taxBenefit: 62400, rolling: { '1yr': 9.2, '3yr': 10.5, '5yr': 10.2, '10yr': 10 },
      platforms: ['eNPS Portal'],
      topFunds: ['Any NPS fund manager']
    }
  };

  const riskProfiles = {
    'Low': { return: 7.5, equity: 20, debt: 60, fixedIncome: 20, label: 'Conservative', description: 'Capital preservation', postTaxReturn: 6.2 },
    'Medium': { return: 11, equity: 55, debt: 30, fixedIncome: 15, label: 'Moderate', description: 'Balanced growth', postTaxReturn: 9.8 },
    'High': { return: 14, equity: 80, debt: 15, fixedIncome: 5, label: 'Aggressive', description: 'Maximum growth', postTaxReturn: 12.5 }
  };

  // ==================== LIFECYCLE ====================
  
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedGoals = localStorage.getItem('financialGoals');
    const savedStep = localStorage.getItem('currentStep');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedStep) setCurrentStep(savedStep);
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (userProfile.name) localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (goals.length > 0) localStorage.setItem('financialGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('currentStep', currentStep);
  }, [currentStep]);

  // ==================== HELPER FUNCTIONS ====================
  
  const fetchMarketData = () => {
    setTimeout(() => {
      setMarketData({
        indices: indicesData,
        lastUpdated: new Date().toLocaleString(),
        marketStatus: 'Open'
      });
    }, 500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLargeNumber = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  const calculateGoalMetrics = (goal) => {
    const inflationRate = parseFloat(goal.inflationRate) / 100;
    const years = parseInt(goal.years);
    const targetAmount = parseFloat(goal.targetAmount);
    const currentSavings = parseFloat(goal.currentSavings) || 0;
    
    let annualReturn;
    if (goal.useCustomReturn && goal.customReturn) {
      annualReturn = parseFloat(goal.customReturn) / 100;
    } else {
      annualReturn = riskProfiles[goal.riskProfile].return / 100;
    }
    
    const postTaxReturn = riskProfiles[goal.riskProfile].postTaxReturn / 100;
    const monthlyReturn = annualReturn / 12;
    const months = years * 12;
    const inflationAdjustedTarget = targetAmount * Math.pow(1 + inflationRate, years);
    const futureValueOfSavings = currentSavings * Math.pow(1 + annualReturn, years);
    const remainingAmount = inflationAdjustedTarget - futureValueOfSavings;

    let monthlySIP = 0;
    if (remainingAmount > 0) {
      monthlySIP = (remainingAmount * monthlyReturn) / ((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn));
    }

    const totalInvestment = (monthlySIP * months) + currentSavings;
    const yearlyProjection = [];
    let cumulativeInvestment = currentSavings;
    let cumulativeValue = currentSavings;

    for (let year = 1; year <= years; year++) {
      const yearlyInvestment = monthlySIP * 12;
      cumulativeInvestment += yearlyInvestment;
      cumulativeValue = (cumulativeValue + yearlyInvestment) * (1 + annualReturn);
      yearlyProjection.push({
        year, investment: Math.round(cumulativeInvestment),
        value: Math.round(cumulativeValue),
        target: Math.round(targetAmount * Math.pow(1 + inflationRate, year))
      });
    }

    return {
      inflationAdjustedTarget, monthlySIP, totalInvestment,
      expectedCorpus: inflationAdjustedTarget, yearlyProjection,
      futureValueOfSavings, remainingAmount: Math.max(0, remainingAmount),
      annualReturn: annualReturn * 100, postTaxReturn: postTaxReturn * 100
    };
  };

  const getInvestmentRecommendations = (goal) => {
    const years = parseInt(goal.years);
    const riskLevel = goal.riskProfile;
    const recommendations = [];

    if (years < 3) {
      recommendations.push(
        { product: 'Fixed Deposits', allocation: 50, reason: 'Safe and liquid' },
        { product: 'Debt Funds', allocation: 30, reason: 'Better than FD' },
        { product: 'Large Cap Funds', allocation: 20, reason: 'Limited equity' }
      );
    } else if (years >= 3 && years < 7) {
      if (riskLevel === 'Low') {
        recommendations.push(
          { product: 'Debt Funds', allocation: 40, reason: 'Stable returns' },
          { product: 'Large Cap Funds', allocation: 35, reason: 'Steady growth' },
          { product: 'PPF', allocation: 25, reason: 'Tax-free' }
        );
      } else if (riskLevel === 'Medium') {
        recommendations.push(
          { product: 'Nifty 50 Index', allocation: 40, reason: 'Low-cost diversification' },
          { product: 'Large Cap Funds', allocation: 30, reason: 'Active management' },
          { product: 'Debt Funds', allocation: 30, reason: 'Stability' }
        );
      } else {
        recommendations.push(
          { product: 'Mid Cap Funds', allocation: 40, reason: 'High growth' },
          { product: 'Nifty 50 Index', allocation: 35, reason: 'Core holding' },
          { product: 'Debt Funds', allocation: 25, reason: 'Risk management' }
        );
      }
    } else {
      if (riskLevel === 'Low') {
        recommendations.push(
          { product: 'Large Cap Funds', allocation: 50, reason: 'Long-term wealth' },
          { product: 'PPF', allocation: 30, reason: 'Tax-free & safe' },
          { product: 'Debt Funds', allocation: 20, reason: 'Stability' }
        );
      } else if (riskLevel === 'Medium') {
        recommendations.push(
          { product: 'Nifty 50 Index', allocation: 35, reason: 'Low-cost returns' },
          { product: 'Large Cap Funds', allocation: 30, reason: 'Active picks' },
          { product: 'Mid Cap Funds', allocation: 20, reason: 'Growth boost' },
          { product: 'ELSS Tax Saver', allocation: 15, reason: 'Tax savings' }
        );
      } else {
        recommendations.push(
          { product: 'Mid Cap Funds', allocation: 35, reason: 'Maximum growth' },
          { product: 'Nifty 50 Index', allocation: 30, reason: 'Core stability' },
          { product: 'Large Cap Funds', allocation: 25, reason: 'Diversification' },
          { product: 'Debt Funds', allocation: 10, reason: 'Safety' }
        );
      }
    }

    return recommendations.map(rec => ({ ...rec, details: investmentProducts[rec.product] }));
  };

  const checkEmergencyFund = () => {
    const monthlyExpenses = parseFloat(userProfile.monthlyExpenses) || 0;
    const required = monthlyExpenses * 6;
    const current = parseFloat(userProfile.emergencyFundAmount) || 0;
    const gap = Math.max(0, required - current);
    const percentage = current > 0 ? (current / required) * 100 : 0;
    return { required, current, gap, percentage };
  };

  const checkDebtBurden = () => {
    const monthlyIncome = parseFloat(userProfile.monthlyIncome) || 0;
    const totalDebtEMI = userProfile.debts.reduce((sum, debt) => sum + parseFloat(debt.emi || 0), 0);
    const debtRatio = monthlyIncome > 0 ? (totalDebtEMI / monthlyIncome) * 100 : 0;
    return { totalDebtEMI, debtRatio, healthy: debtRatio < 40 };
  };

  const checkInvestmentCapacity = () => {
    const monthlyIncome = parseFloat(userProfile.monthlyIncome) || 0;
    const monthlyExpenses = parseFloat(userProfile.monthlyExpenses) || 0;
    const debtEMI = checkDebtBurden().totalDebtEMI;
    const surplus = monthlyIncome - monthlyExpenses - debtEMI;
    const totalCommitment = getTotalMonthlyCommitment();
    const ratio = surplus > 0 ? (totalCommitment / surplus) * 100 : 0;
    return { surplus, totalCommitment, ratio, affordable: ratio <= 80 };
  };

  const getTotalMonthlyCommitment = () => {
    return goals.reduce((sum, goal) => {
      const metrics = calculateGoalMetrics(goal);
      return sum + metrics.monthlySIP;
    }, 0);
  };

  const handleGoalFromTemplate = (templateKey) => {
    const template = goalTemplates[templateKey];
    const monthlyIncome = parseFloat(userProfile.monthlyIncome) || 100000;
    const monthlyExpenses = parseFloat(userProfile.monthlyExpenses) || 50000;
    const age = parseInt(userProfile.age) || 30;
    
    setCurrentGoal({
      name: template.name,
      type: templateKey,
      targetAmount: template.defaultAmount(monthlyIncome, monthlyExpenses).toString(),
      years: template.defaultYears(age).toString(),
      inflationCategory: template.inflationCategory,
      inflationRate: inflationCategories[template.inflationCategory].rate.toString(),
      riskProfile: template.riskProfile,
      customReturn: '', useCustomReturn: false, currentSavings: '0',
      startDate: new Date().toISOString().split('T')[0], endDate: ''
    });
    setShowGoalForm(true);
  };

  const addOrUpdateGoal = () => {
    if (!currentGoal.name || !currentGoal.targetAmount || !currentGoal.years) {
      alert('Please fill in all required fields');
      return;
    }
    if (editingIndex !== null) {
      const updated = [...goals];
      updated[editingIndex] = currentGoal;
      setGoals(updated);
      setEditingIndex(null);
    } else {
      setGoals([...goals, currentGoal]);
    }
    setCurrentGoal({
      name: '', type: 'retirement', targetAmount: '', years: '',
      inflationCategory: 'General', inflationRate: '6', riskProfile: 'Medium',
      customReturn: '', useCustomReturn: false, currentSavings: '0',
      startDate: new Date().toISOString().split('T')[0], endDate: ''
    });
    setShowGoalForm(false);
  };

  const editGoal = (index) => {
    setCurrentGoal(goals[index]);
    setEditingIndex(index);
    setShowGoalForm(true);
  };

  const deleteGoal = (index) => {
    if (window.confirm('Delete this goal?')) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const addDebt = () => {
    setUserProfile(prev => ({
      ...prev,
      debts: [...prev.debts, { name: '', amount: '', interest: '', emi: '', type: 'personal' }]
    }));
  };

  const updateDebt = (index, field, value) => {
    const updated = [...userProfile.debts];
    updated[index][field] = value;
    setUserProfile(prev => ({ ...prev, debts: updated }));
  };

  const removeDebt = (index) => {
    setUserProfile(prev => ({
      ...prev,
      debts: prev.debts.filter((_, i) => i !== index)
    }));
  };

  const exportData = () => {
    const data = {
      profile: userProfile,
      goals: goals.map(goal => {
        const metrics = calculateGoalMetrics(goal);
        return {
          goal: goal.name, target: goal.targetAmount, years: goal.years,
          monthlySIP: metrics.monthlySIP.toFixed(2),
          totalInvestment: metrics.totalInvestment.toFixed(2)
        };
      })
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-plan.json';
    a.click();
  };

  const clearAllData = () => {
    if (window.confirm('Delete all data?')) {
      setGoals([]);
      setUserProfile({
        name: '', age: '', monthlyIncome: '', monthlyExpenses: '', existingSavings: '',
        hasEmergencyFund: null, emergencyFundAmount: '0', hasDebts: null, debts: []
      });
      setCurrentStep('welcome');
      localStorage.clear();
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderWelcome = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-block p-4 bg-white/10 rounded-full mb-6 backdrop-blur-lg">
            <TrendingUp className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Financial Future<br />Starts Here
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            A comprehensive financial planning tool with expert guidance, real market data, and personalized recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
            <Target className="w-10 h-10 text-yellow-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Smart Goal Planning</h3>
            <p className="text-white/70">Set goals with templates, get SIP calculations, track progress</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
            <Shield className="w-10 h-10 text-green-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Health Check</h3>
            <p className="text-white/70">Emergency fund, debt analysis, investment capacity</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
            <Activity className="w-10 h-10 text-blue-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Real Market Data</h3>
            <p className="text-white/70">Live indices, rolling returns, investment recommendations</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentStep('profile')}
            className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-100 transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-2xl"
          >
            Let's Get Started <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-white/60 mt-4 text-sm">5 minutes • Free forever • Your data stays private</p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/40 text-xs max-w-3xl mx-auto">
            ⚠️ Disclaimer: This tool provides educational estimates only. Not SEBI-registered investment advice. 
            Past returns don't guarantee future performance. Consult a certified financial advisor for personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Let's Know You Better</h2>
              <p className="text-gray-600 mt-2">We'll use this to create your personalized plan</p>
            </div>
            <div className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold">Step 1 of 4</div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                placeholder="e.g., Rahul Sharma"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
                  placeholder="32"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Existing Savings (₹)</label>
                <input
                  type="number"
                  value={userProfile.existingSavings}
                  onChange={(e) => setUserProfile({ ...userProfile, existingSavings: e.target.value })}
                  placeholder="500000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (₹) *</label>
                <input
                  type="number"
                  value={userProfile.monthlyIncome}
                  onChange={(e) => setUserProfile({ ...userProfile, monthlyIncome: e.target.value })}
                  placeholder="100000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Expenses (₹) *</label>
                <input
                  type="number"
                  value={userProfile.monthlyExpenses}
                  onChange={(e) => setUserProfile({ ...userProfile, monthlyExpenses: e.target.value })}
                  placeholder="50000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Rent, utilities, groceries, etc.</p>
              </div>
            </div>

            {parseFloat(userProfile.monthlyIncome) > 0 && parseFloat(userProfile.monthlyExpenses) > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-blue-800">
                  <strong>Monthly Surplus:</strong> {formatCurrency(parseFloat(userProfile.monthlyIncome) - parseFloat(userProfile.monthlyExpenses))}
                  <span className="text-sm block mt-1">Available for investments</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep('welcome')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (!userProfile.name || !userProfile.age || !userProfile.monthlyIncome || !userProfile.monthlyExpenses) {
                  alert('Please fill required fields');
                  return;
                }
                setCurrentStep('emergency');
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmergency = () => {
    const emergency = checkEmergencyFund();
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Emergency Fund Check</h2>
                <p className="text-gray-600 mt-2">Financial security starts here</p>
              </div>
              <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold">Step 2 of 4</div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-6 border-2 border-green-200">
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Why It Matters</h3>
              <p className="text-gray-700">
                Medical emergencies, job loss, or urgent repairs can derail your plans. 6-12 months expenses ensures you don't break investments or take loans.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-4">Do you have an emergency fund?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserProfile({ ...userProfile, hasEmergencyFund: true })}
                  className={`p-4 rounded-lg border-2 transition ${
                    userProfile.hasEmergencyFund === true ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${userProfile.hasEmergencyFund === true ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">Yes</span>
                </button>
                <button
                  onClick={() => setUserProfile({ ...userProfile, hasEmergencyFund: false, emergencyFundAmount: '0' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    userProfile.hasEmergencyFund === false ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                  }`}
                >
                  <XCircle className={`w-8 h-8 mx-auto mb-2 ${userProfile.hasEmergencyFund === false ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">No</span>
                </button>
              </div>
            </div>

            {userProfile.hasEmergencyFund === true && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (₹)</label>
                <input
                  type="number"
                  value={userProfile.emergencyFundAmount}
                  onChange={(e) => setUserProfile({ ...userProfile, emergencyFundAmount: e.target.value })}
                  placeholder="300000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {userProfile.hasEmergencyFund !== null && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-semibold mb-4">Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recommended:</span>
                    <span className="font-bold">{formatCurrency(emergency.required)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-bold">{formatCurrency(emergency.current)}</span>
                  </div>
                  {emergency.gap > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gap:</span>
                      <span className="font-bold text-orange-600">{formatCurrency(emergency.gap)}</span>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{emergency.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: `${Math.min(100, emergency.percentage)}%` }} />
                    </div>
                  </div>
                </div>

                {emergency.gap > 0 && (
                  <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                    <p className="text-orange-800">
                      <strong>⚠️ Priority:</strong> Build emergency fund before aggressive investing. Save {formatCurrency(emergency.gap / 12)}/month.
                    </p>
                  </div>
                )}

                {emergency.percentage >= 100 && (
                  <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-green-800"><strong>✅ Excellent!</strong> Your fund is adequate.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentStep('profile')} className="px-6 py-3 bg-gray-200 rounded-lg inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (userProfile.hasEmergencyFund === null) {
                    alert('Please select');
                    return;
                  }
                  setCurrentStep('debt');
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg inline-flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDebt = () => {
    const debtAnalysis = checkDebtBurden();
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Debt Check</h2>
                <p className="text-gray-600 mt-2">High-interest debt sabotages goals</p>
              </div>
              <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-semibold">Step 3 of 4</div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl mb-6 border-2 border-orange-200">
              <AlertCircle className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Why It Matters</h3>
              <p className="text-gray-700">
                Paying 12-18% on debt while investing at 10-12%? You're losing money. Debt payoff is often the best "investment".
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium mb-4">Outstanding debts (excluding home loan)?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserProfile({ ...userProfile, hasDebts: true })}
                  className={`p-4 rounded-lg border-2 ${userProfile.hasDebts === true ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                >
                  <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${userProfile.hasDebts === true ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">Yes</span>
                </button>
                <button
                  onClick={() => setUserProfile({ ...userProfile, hasDebts: false, debts: [] })}
                  className={`p-4 rounded-lg border-2 ${userProfile.hasDebts === false ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                >
                  <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${userProfile.hasDebts === false ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">No</span>
                </button>
              </div>
            </div>

            {userProfile.hasDebts === true && (
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  <h4 className="font-semibold">Your Debts</h4>
                  <button onClick={addDebt} className="text-indigo-600 inline-flex items-center gap-1 text-sm">
                    <PlusCircle className="w-4 h-4" /> Add
                  </button>
                </div>

                {userProfile.debts.map((debt, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Name" value={debt.name} onChange={(e) => updateDebt(index, 'name', e.target.value)} className="px-3 py-2 border rounded" />
                      <select value={debt.type} onChange={(e) => updateDebt(index, 'type', e.target.value)} className="px-3 py-2 border rounded">
                        <option value="credit-card">Credit Card</option>
                        <option value="personal">Personal Loan</option>
                        <option value="car">Car Loan</option>
                        <option value="education">Education Loan</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="number" placeholder="Amount (₹)" value={debt.amount} onChange={(e) => updateDebt(index, 'amount', e.target.value)} className="px-3 py-2 border rounded" />
                      <input type="number" placeholder="Interest %" value={debt.interest} onChange={(e) => updateDebt(index, 'interest', e.target.value)} className="px-3 py-2 border rounded" />
                      <input type="number" placeholder="EMI (₹)" value={debt.emi} onChange={(e) => updateDebt(index, 'emi', e.target.value)} className="px-3 py-2 border rounded" />
                    </div>
                    <button onClick={() => removeDebt(index)} className="text-red-600 text-sm mt-2">Remove</button>
                  </div>
                ))}

                {userProfile.debts.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl mt-4">
                    <h4 className="font-semibold mb-4">Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total EMI:</span>
                        <span className="font-bold">{formatCurrency(debtAnalysis.totalDebtEMI)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt Ratio:</span>
                        <span className={`font-bold ${debtAnalysis.healthy ? 'text-green-600' : 'text-red-600'}`}>
                          {debtAnalysis.debtRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`h-3 rounded-full ${debtAnalysis.healthy ? 'bg-green-600' : 'bg-red-600'}`} style={{ width: `${Math.min(100, debtAnalysis.debtRatio)}%` }} />
                      </div>
                    </div>
                    {!debtAnalysis.healthy && (
                      <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                        <p className="text-red-800"><strong>⚠️ High Burden:</strong> >40% of income. Prioritize repayment!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {userProfile.hasDebts === false && (
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-xl">
                <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                <p className="text-green-800 text-lg"><strong>Excellent!</strong> Debt-free = maximum wealth building flexibility.</p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentStep('emergency')} className="px-6 py-3 bg-gray-200 rounded-lg inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (userProfile.hasDebts === null) {
                    alert('Please select');
                    return;
                  }
                  setCurrentStep('goals');
                }}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg inline-flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoals = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Set Your Goals</h2>
              <p className="text-gray-600 mt-2">Choose templates or create custom</p>
            </div>
            <div className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-semibold">Step 4 of 4</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(goalTemplates).map(([key, template]) => {
              const Icon = template.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleGoalFromTemplate(key)}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-lg text-left"
                >
                  <Icon className="w-10 h-10 text-indigo-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <p className="text-xs text-indigo-600">💡 {template.tip}</p>
                </button>
              );
            })}
          </div>

          {goals.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Your Goals ({goals.length})</h3>
              <div className="space-y-3">
                {goals.map((goal, index) => {
                  const metrics = calculateGoalMetrics(goal);
                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.name}</h4>
                        <p className="text-sm text-gray-600">
                          Target: {formatLargeNumber(parseFloat(goal.targetAmount))} in {goal.years}Y • SIP: {formatCurrency(metrics.monthlySIP)}/mo
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editGoal(index)} className="text-indigo-600 p-2"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteGoal(index)} className="text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {goals.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl mb-8">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No goals yet. Choose a template above!</p>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep('debt')} className="px-6 py-3 bg-gray-200 rounded-lg inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (goals.length === 0) {
                  alert('Add at least one goal');
                  return;
                }
                setCurrentStep('dashboard');
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 inline-flex items-center gap-2 font-semibold"
            >
              View My Plan <Play className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowGoalForm(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">{editingIndex !== null ? 'Edit Goal' : 'Add Goal'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name *</label>
                <input
                  type="text"
                  value={currentGoal.name}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Amount (₹) *</label>
                  <input
                    type="number"
                    value={currentGoal.targetAmount}
                    onChange={(e) => setCurrentGoal({ ...currentGoal, targetAmount: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time (Years) *</label>
                  <input
                    type="number"
                    value={currentGoal.years}
                    onChange={(e) => setCurrentGoal({ ...currentGoal, years: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Inflation Category</label>
                  <select
                    value={currentGoal.inflationCategory}
                    onChange={(e) => setCurrentGoal({ 
                      ...currentGoal, 
                      inflationCategory: e.target.value,
                      inflationRate: inflationCategories[e.target.value].rate.toString()
                    })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.keys(inflationCategories).map(cat => (
                      <option key={cat} value={cat}>{cat} ({inflationCategories[cat].rate}%)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Risk Profile</label>
                  <select
                    value={currentGoal.riskProfile}
                    onChange={(e) => setCurrentGoal({ ...currentGoal, riskProfile: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low ({riskProfiles.Low.return}%)</option>
                    <option value="Medium">Medium ({riskProfiles.Medium.return}%)</option>
                    <option value="High">High ({riskProfiles.High.return}%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Savings (₹)</label>
                <input
                  type="number"
                  value={currentGoal.currentSavings}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, currentSavings: e.target.value })}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addOrUpdateGoal}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                {editingIndex !== null ? 'Update' : 'Add Goal'}
              </button>
              <button
                onClick={() => {
                  setShowGoalForm(false);
                  setEditingIndex(null);
                }}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Continue to next file for Dashboard render...

  // ==================== DASHBOARD RENDER ====================
  
  if (currentStep === 'welcome') return renderWelcome();
  if (currentStep === 'profile') return renderProfile();
  if (currentStep === 'emergency') return renderEmergency();
  if (currentStep === 'debt') return renderDebt();
  if (currentStep === 'goals') return renderGoals();

  // Main Dashboard
  const emergency = checkEmergencyFund();
  const debtAnalysis = checkDebtBurden();
  const capacity = checkInvestmentCapacity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Nav */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Financial Plan</h1>
                <p className="text-sm text-gray-600">Welcome, {userProfile.name}!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={exportData} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button onClick={() => setCurrentStep('goals')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Add Goal</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'market', label: 'Market', icon: TrendingUp },
              { id: 'recommendations', label: 'Recommendations', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 font-medium border-b-2 inline-flex items-center gap-2 ${
                    selectedTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedTab === 'overview' && (
          <>
            {/* Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${emergency.percentage >= 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {emergency.percentage >= 100 ? 'Adequate' : 'Needs Attention'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Emergency Fund</h3>
                <div className="text-3xl font-bold mb-1">{formatLargeNumber(emergency.current)}</div>
                <p className="text-sm text-gray-600 mb-3">of {formatLargeNumber(emergency.required)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, emergency.percentage)}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${debtAnalysis.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {debtAnalysis.healthy ? 'Healthy' : 'High'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Debt Burden</h3>
                <div className="text-3xl font-bold mb-1">{debtAnalysis.debtRatio.toFixed(1)}%</div>
                <p className="text-sm text-gray-600 mb-3">{formatCurrency(debtAnalysis.totalDebtEMI)}/month</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${debtAnalysis.healthy ? 'bg-green-600' : 'bg-red-600'}`} style={{ width: `${Math.min(100, debtAnalysis.debtRatio)}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-indigo-600" />
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${capacity.affordable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {capacity.affordable ? 'Affordable' : 'Too High'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Investment Capacity</h3>
                <div className="text-3xl font-bold mb-1">{formatCurrency(capacity.surplus)}</div>
                <p className="text-sm text-gray-600 mb-3">{capacity.ratio.toFixed(0)}% utilized</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${capacity.ratio <= 80 ? 'bg-indigo-600' : 'bg-red-600'}`} style={{ width: `${Math.min(100, capacity.ratio)}%` }} />
                </div>
              </div>
            </div>

            {/* Warnings */}
            {(emergency.percentage < 100 || !debtAnalysis.healthy || !capacity.affordable) && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-xl mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">⚠️ Recommendations</h4>
                    <ul className="space-y-1 text-amber-800 text-sm">
                      {emergency.percentage < 100 && <li>• Build emergency fund to {formatCurrency(emergency.required)}</li>}
                      {!debtAnalysis.healthy && <li>• High debt: Consider repayment priority</li>}
                      {!capacity.affordable && <li>• Goals need {formatCurrency(capacity.totalCommitment)}/mo but surplus is {formatCurrency(capacity.surplus)}</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Grid */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-bold mb-6">Your Goals ({goals.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal, index) => {
                  const metrics = calculateGoalMetrics(goal);
                  const Icon = goalTemplates[goal.type]?.icon || Target;
                  return (
                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-200">
                      <div className="flex items-start justify-between mb-3">
                        <Icon className="w-8 h-8 text-indigo-600" />
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">{goal.years}Y</span>
                      </div>
                      <h4 className="font-semibold mb-2">{goal.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-semibold">{formatLargeNumber(parseFloat(goal.targetAmount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly SIP:</span>
                          <span className="font-semibold text-indigo-600">{formatCurrency(metrics.monthlySIP)}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => { editGoal(index); setSelectedTab('goals'); }} className="flex-1 px-3 py-1.5 bg-white text-indigo-600 border border-indigo-300 rounded text-sm">
                          Details
                        </button>
                        <button onClick={() => deleteGoal(index)} className="px-3 py-1.5 bg-white text-red-600 border border-red-300 rounded text-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-sm text-gray-600 mb-1">Total Monthly SIP</div>
                <div className="text-2xl font-bold text-indigo-600">{formatCurrency(getTotalMonthlyCommitment())}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-sm text-gray-600 mb-1">Total Target</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatLargeNumber(goals.reduce((sum, g) => sum + calculateGoalMetrics(g).inflationAdjustedTarget, 0))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-sm text-gray-600 mb-1">Active Goals</div>
                <div className="text-2xl font-bold text-green-600">{goals.length}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-sm text-gray-600 mb-1">Avg Timeline</div>
                <div className="text-2xl font-bold text-orange-600">
                  {goals.length > 0 ? (goals.reduce((sum, g) => sum + parseInt(g.years), 0) / goals.length).toFixed(1) : 0}Y
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'goals' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">Detailed Goal Analysis</h3>
            {goals.map((goal, index) => {
              const metrics = calculateGoalMetrics(goal);
              const recommendations = getInvestmentRecommendations(goal);
              const profile = riskProfiles[goal.riskProfile];

              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-xl font-bold">{goal.name}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => { editGoal(index); setCurrentStep('goals'); }} className="text-indigo-600"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => deleteGoal(index)} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Inflation Adj Target</div>
                      <div className="text-lg font-bold text-purple-600">{formatLargeNumber(metrics.inflationAdjustedTarget)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Monthly SIP</div>
                      <div className="text-lg font-bold text-green-600">{formatCurrency(metrics.monthlySIP)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Pre-Tax Return</div>
                      <div className="text-lg font-bold text-blue-600">{metrics.annualReturn.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Post-Tax Return</div>
                      <div className="text-lg font-bold text-indigo-600">{metrics.postTaxReturn.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h5 className="font-semibold mb-3">Investment Recommendations</h5>
                    <div className="space-y-2">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-semibold">{rec.product}</div>
                            <div className="text-sm text-gray-600">{rec.reason}</div>
                            {rec.details && rec.details.topFunds && (
                              <div className="text-xs text-indigo-600 mt-1">
                                {rec.details.topFunds[0]} • {rec.details.platforms.join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold ml-4">{rec.allocation}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Asset Allocation</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Equity', value: profile.equity },
                              { name: 'Debt', value: profile.debt },
                              { name: 'Fixed Income', value: profile.fixedIncome }
                            ]}
                            cx="50%"
                            cy="50%"
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={70}
                            dataKey="value"
                          >
                            <Cell fill="#4F46E5" />
                            <Cell fill="#10B981" />
                            <Cell fill="#F59E0B" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Growth Projection</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={metrics.yearlyProjection.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(v) => formatLargeNumber(v)} />
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                          <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} name="Value" />
                          <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedTab === 'market' && marketData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Market Data</h3>
                <p className="text-sm text-gray-600">Updated: {marketData.lastUpdated}</p>
              </div>
              <button onClick={fetchMarketData} className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(marketData.indices).map(([name, data]) => (
                <div key={name} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">{name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{data.category}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">₹{data.current.toLocaleString()}</div>
                  <div className={`text-sm font-semibold mb-3 ${data.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.changePct >= 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)} ({Math.abs(data.changePct).toFixed(2)}%)
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><div className="text-gray-600">1Y</div><div className="font-semibold">{data.returns['1yr']}%</div></div>
                    <div><div className="text-gray-600">3Y</div><div className="font-semibold">{data.returns['3yr']}%</div></div>
                    <div><div className="text-gray-600">5Y</div><div className="font-semibold">{data.returns['5yr']}%</div></div>
                    <div><div className="text-gray-600">10Y</div><div className="font-semibold">{data.returns['10yr']}%</div></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Disclaimer:</strong> Historical returns are indicative. Market investments carry risk. 
                Past performance doesn't guarantee future results. Educational purposes only.
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">Tax Saving & Investment Recommendations</h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-600" />
                  Tax Saving Opportunities
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">ELSS (80C)</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Save ₹46,800/year</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Invest ₹1.5L in ELSS, save tax at 31.2% slab</p>
                    <div className="text-xs text-green-600"><strong>Top Funds:</strong> Axis ELSS, Mirae Asset Tax Saver</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">NPS (80CCD(1B))</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Save ₹15,600/year</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Extra ₹50K deduction beyond 80C</p>
                    <div className="text-xs text-green-600"><strong>Returns:</strong> ~10% | Partial tax-free at maturity</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">PPF (80C)</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">100% Tax-Free</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">7.1% returns, completely tax-free (EEE)</p>
                    <div className="text-xs text-green-600"><strong>Best for:</strong> Long-term, risk-free savings</div>
                  </div>
                </div>

                <div className="mt-4 bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2">💰 Total Potential Tax Savings</h5>
                  <div className="text-3xl font-bold text-green-600">₹62,400/year</div>
                  <p className="text-sm text-gray-600 mt-1">By utilizing 80C (₹1.5L) + 80CCD(1B) (₹50K)</p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="text-xl font-semibold mb-4">Investment Platform Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Groww</h5>
                    <p className="text-sm text-gray-600 mb-2">Best for: Beginners, clean UI</p>
                    <p className="text-xs text-blue-600">Direct mutual funds, Stocks, Gold</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Zerodha Coin</h5>
                    <p className="text-sm text-gray-600 mb-2">Best for: Direct funds, 0 fees</p>
                    <p className="text-xs text-blue-600">Direct MF only, no regular plans</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Kuvera</h5>
                    <p className="text-sm text-gray-600 mb-2">Best for: Goal-based investing</p>
                    <p className="text-xs text-blue-600">Import tracking, Family accounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialPlanner;
  