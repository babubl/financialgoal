import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PlusCircle, Trash2, TrendingUp, Target, AlertCircle, DollarSign, Calendar, Percent, Save, Download } from 'lucide-react';

const FinancialGoalPlanner = () => {
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState({
    name: '',
    targetAmount: '',
    years: '',
    inflationRate: '6',
    riskProfile: 'Moderate',
    currentSavings: '0'
  });
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('financialGoals');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever goals change
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('financialGoals', JSON.stringify(goals));
    }
  }, [goals]);

  const riskProfiles = {
    'Conservative': { return: 7.5, equity: 25, debt: 75 },
    'Moderate': { return: 10.5, equity: 55, debt: 45 },
    'Aggressive': { return: 13, equity: 80, debt: 20 }
  };

  const calculateGoalMetrics = (goal) => {
    const inflationRate = parseFloat(goal.inflationRate) / 100;
    const years = parseInt(goal.years);
    const targetAmount = parseFloat(goal.targetAmount);
    const currentSavings = parseFloat(goal.currentSavings) || 0;
    const annualReturn = riskProfiles[goal.riskProfile].return / 100;
    const monthlyReturn = annualReturn / 12;
    const months = years * 12;

    // Inflation-adjusted target
    const inflationAdjustedTarget = targetAmount * Math.pow(1 + inflationRate, years);

    // Future value of current savings
    const futureValueOfSavings = currentSavings * Math.pow(1 + annualReturn, years);

    // Remaining amount needed
    const remainingAmount = inflationAdjustedTarget - futureValueOfSavings;

    // Monthly SIP calculation
    let monthlySIP = 0;
    if (remainingAmount > 0) {
      monthlySIP = (remainingAmount * monthlyReturn) / 
                   ((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn));
    }

    // Total investment
    const totalInvestment = (monthlySIP * months) + currentSavings;

    // Year-wise projection
    const yearlyProjection = [];
    let cumulativeInvestment = currentSavings;
    let cumulativeValue = currentSavings;

    for (let year = 1; year <= years; year++) {
      const yearlyInvestment = monthlySIP * 12;
      cumulativeInvestment += yearlyInvestment;
      
      // Calculate value at end of year
      cumulativeValue = (cumulativeValue + yearlyInvestment) * (1 + annualReturn);
      
      yearlyProjection.push({
        year: year,
        investment: Math.round(cumulativeInvestment),
        value: Math.round(cumulativeValue),
        target: Math.round(targetAmount * Math.pow(1 + inflationRate, year))
      });
    }

    return {
      inflationAdjustedTarget,
      monthlySIP,
      totalInvestment,
      expectedCorpus: inflationAdjustedTarget,
      yearlyProjection,
      futureValueOfSavings,
      remainingAmount: Math.max(0, remainingAmount)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentGoal(prev => ({ ...prev, [name]: value }));
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
      name: '',
      targetAmount: '',
      years: '',
      inflationRate: '6',
      riskProfile: 'Moderate',
      currentSavings: '0'
    });
    setShowForm(false);
  };

  const editGoal = (index) => {
    setCurrentGoal(goals[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const deleteGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTotalMonthlyCommitment = () => {
    return goals.reduce((sum, goal) => {
      const metrics = calculateGoalMetrics(goal);
      return sum + metrics.monthlySIP;
    }, 0);
  };

  const exportData = () => {
    const data = goals.map(goal => {
      const metrics = calculateGoalMetrics(goal);
      return {
        goal: goal.name,
        target: goal.targetAmount,
        years: goal.years,
        inflationAdjustedTarget: metrics.inflationAdjustedTarget.toFixed(2),
        monthlySIP: metrics.monthlySIP.toFixed(2),
        totalInvestment: metrics.totalInvestment.toFixed(2),
        riskProfile: goal.riskProfile
      };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-goals.json';
    a.click();
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all goals?')) {
      setGoals([]);
      localStorage.removeItem('financialGoals');
    }
  };

  const riskColors = {
    'Conservative': 'bg-green-100 text-green-800 border-green-300',
    'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Aggressive': 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Financial Goal Planner</h1>
                <p className="text-gray-600">Plan your financial future with precision</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-5 h-5" />
                Add Goal
              </button>
              {goals.length > 0 && (
                <>
                  <button
                    onClick={exportData}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                  >
                    <Download className="w-5 h-5" />
                    Export
                  </button>
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary Dashboard */}
        {goals.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Portfolio Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Total Goals</div>
                <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-sm text-gray-600 mb-1">Monthly Commitment</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalMonthlyCommitment())}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Total Target Value</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(goals.reduce((sum, goal) => {
                    const metrics = calculateGoalMetrics(goal);
                    return sum + metrics.inflationAdjustedTarget;
                  }, 0))}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <div className="text-sm text-gray-600 mb-1">Avg. Time Horizon</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(goals.reduce((sum, goal) => sum + parseInt(goal.years), 0) / goals.length).toFixed(1)} years
                </div>
              </div>
            </div>
            
            {getTotalMonthlyCommitment() > 100000 && (
              <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800">
                    <strong>High Monthly Commitment:</strong> Your total monthly investment of {formatCurrency(getTotalMonthlyCommitment())} 
                    may be challenging. Consider extending timelines or prioritizing goals.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goal Input Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingIndex !== null ? 'Edit Goal' : 'Add New Goal'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Goal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentGoal.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Retirement, Child Education"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Target Amount (₹) *
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={currentGoal.targetAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 10000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Time Horizon (Years) *
                </label>
                <input
                  type="number"
                  name="years"
                  value={currentGoal.years}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Inflation Rate (%)
                </label>
                <input
                  type="number"
                  name="inflationRate"
                  value={currentGoal.inflationRate}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Profile
                </label>
                <select
                  name="riskProfile"
                  value={currentGoal.riskProfile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Conservative">Conservative (7.5% return)</option>
                  <option value="Moderate">Moderate (10.5% return)</option>
                  <option value="Aggressive">Aggressive (13% return)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Save className="w-4 h-4 inline mr-1" />
                  Current Savings (₹)
                </label>
                <input
                  type="number"
                  name="currentSavings"
                  value={currentGoal.currentSavings}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addOrUpdateGoal}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {editingIndex !== null ? 'Update Goal' : 'Add Goal'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                  setCurrentGoal({
                    name: '',
                    targetAmount: '',
                    years: '',
                    inflationRate: '6',
                    riskProfile: 'Moderate',
                    currentSavings: '0'
                  });
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals Display */}
        {goals.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Goals Yet</h3>
            <p className="text-gray-500 mb-4">Start planning your financial future by adding your first goal</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Your First Goal
            </button>
          </div>
        )}

        {goals.map((goal, index) => {
          const metrics = calculateGoalMetrics(goal);
          const profile = riskProfiles[goal.riskProfile];
          
          const allocationData = [
            { name: 'Equity', value: profile.equity, color: '#4F46E5' },
            { name: 'Debt', value: profile.debt, color: '#10B981' }
          ];

          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {/* Goal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{goal.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${riskColors[goal.riskProfile]}`}>
                      {goal.riskProfile} Risk
                    </span>
                    <span className="text-gray-600">
                      {goal.years} years • {profile.return}% expected return
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editGoal(index)}
                    className="text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded border border-indigo-300 hover:bg-indigo-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteGoal(index)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Original Target</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(parseFloat(goal.targetAmount))}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Inflation Adjusted</div>
                  <div className="text-xl font-bold text-purple-600">{formatCurrency(metrics.inflationAdjustedTarget)}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Monthly SIP Required</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(metrics.monthlySIP)}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Investment</div>
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(metrics.totalInvestment)}</div>
                </div>
              </div>

              {parseFloat(goal.currentSavings) > 0 && (
                <div className="bg-teal-50 border-l-4 border-teal-400 p-4 mb-6 rounded">
                  <p className="text-teal-800">
                    <strong>Current Savings:</strong> {formatCurrency(parseFloat(goal.currentSavings))} will grow to{' '}
                    <strong>{formatCurrency(metrics.futureValueOfSavings)}</strong> by goal date.
                    Additional SIP needed for remaining {formatCurrency(metrics.remainingAmount)}.
                  </p>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded">
                <h4 className="font-semibold text-indigo-900 mb-2">Recommended Asset Allocation</h4>
                <div className="text-indigo-800">
                  <p className="mb-2">
                    <strong>{profile.equity}% Equity</strong> (₹{formatCurrency(metrics.monthlySIP * profile.equity / 100)}/month) 
                    - {goal.riskProfile === 'Conservative' ? 'Index Funds, Large Cap' : 
                       goal.riskProfile === 'Moderate' ? 'Diversified Mutual Funds, Index Funds' : 
                       'Equity Mutual Funds, Mid/Small Cap'}
                  </p>
                  <p>
                    <strong>{profile.debt}% Debt</strong> (₹{formatCurrency(metrics.monthlySIP * profile.debt / 100)}/month) 
                    - {goal.riskProfile === 'Conservative' ? 'Fixed Deposits, Bonds' : 'Debt Funds, Fixed Income'}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Asset Allocation Pie Chart */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Asset Allocation</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Growth Projection Chart */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Growth Projection</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={metrics.yearlyProjection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                      <YAxis 
                        tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                        label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="investment" stroke="#F59E0B" name="Total Investment" strokeWidth={2} />
                      <Line type="monotone" dataKey="value" stroke="#10B981" name="Expected Value" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" stroke="#EF4444" name="Target (Inflation Adj)" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scenario Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">What-If Scenarios</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-600 mb-1">If returns are 2% lower ({(profile.return - 2)}%)</div>
                    <div className="font-semibold text-red-600">
                      Monthly SIP: {formatCurrency(
                        (metrics.remainingAmount * ((profile.return - 2) / 100 / 12)) / 
                        ((Math.pow(1 + (profile.return - 2) / 100 / 12, parseInt(goal.years) * 12) - 1) * 
                        (1 + (profile.return - 2) / 100 / 12))
                      )}
                      <span className="text-xs block text-gray-600">
                        (+{formatCurrency(
                          ((metrics.remainingAmount * ((profile.return - 2) / 100 / 12)) / 
                          ((Math.pow(1 + (profile.return - 2) / 100 / 12, parseInt(goal.years) * 12) - 1) * 
                          (1 + (profile.return - 2) / 100 / 12))) - metrics.monthlySIP
                        )} more)
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-600 mb-1">If you start 2 years later</div>
                    <div className="font-semibold text-red-600">
                      {parseInt(goal.years) > 2 ? (
                        <>
                          Monthly SIP: {formatCurrency(
                            (metrics.remainingAmount * (profile.return / 100 / 12)) / 
                            ((Math.pow(1 + profile.return / 100 / 12, (parseInt(goal.years) - 2) * 12) - 1) * 
                            (1 + profile.return / 100 / 12))
                          )}
                          <span className="text-xs block text-gray-600">
                            (+{formatCurrency(
                              ((metrics.remainingAmount * (profile.return / 100 / 12)) / 
                              ((Math.pow(1 + profile.return / 100 / 12, (parseInt(goal.years) - 2) * 12) - 1) * 
                              (1 + profile.return / 100 / 12))) - metrics.monthlySIP
                            )} more)
                          </span>
                        </>
                      ) : 'Timeline too short'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-600 mb-1">With 10% annual step-up</div>
                    <div className="font-semibold text-green-600">
                      Starting SIP: {formatCurrency(metrics.monthlySIP * 0.75)}
                      <span className="text-xs block text-gray-600">
                        (Reduces initial burden by 25%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Educational Tips */}
        {goals.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Pro Tips for Success</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-400">
                <strong className="text-indigo-600">Power of Compounding:</strong> Starting early makes a huge difference. 
                Even small amounts invested consistently can grow significantly over time.
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-400">
                <strong className="text-green-600">Diversification:</strong> Don't put all eggs in one basket. 
                Mix equity and debt based on your risk profile and time horizon.
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                <strong className="text-purple-600">Review Regularly:</strong> Review your goals annually and rebalance 
                your portfolio as you get closer to your target date.
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-400">
                <strong className="text-orange-600">Step-up SIPs:</strong> Increase your SIP by 10% annually as your 
                income grows to reach goals faster with less initial burden.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialGoalPlanner;
