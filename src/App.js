import { useState } from "react";
import "./App.css";

export default function App() {
  const [amount, setAmount] = useState("");
  const [years, setYears] = useState("");
  const [inflation, setInflation] = useState(6);
  const [risk, setRisk] = useState("moderate");
  const [result, setResult] = useState(null);

  function calculate() {
    const fv = amount * Math.pow(1 + inflation / 100, years);

    let returnRate = 0.105;
    if (risk === "conservative") returnRate = 0.075;
    if (risk === "aggressive") returnRate = 0.13;

    const r = returnRate / 12;
    const n = years * 12;

    const sip =
      (fv * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));

    setResult({
      fv: Math.round(fv),
      sip: Math.round(sip),
    });
  }

  return (
    <div className="container">
      <h1>Financial Goal Planner</h1>

      <div className="card">
        <input
          placeholder="Target Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          placeholder="Time Horizon (Years)"
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />

        <input
          placeholder="Inflation %"
          value={inflation}
          onChange={(e) => setInflation(e.target.value)}
        />

        <select value={risk} onChange={(e) => setRisk(e.target.value)}>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <button onClick={calculate}>Calculate</button>
      </div>

      {result && (
        <div className="result">
          <h2>Results</h2>
          <p>Inflation Adjusted Goal: ₹ {result.fv}</p>
          <p>Monthly SIP Needed: ₹ {result.sip}</p>

          <div className="allocation">
            {risk === "conservative" && "20% Equity | 80% Debt"}
            {risk === "moderate" && "60% Equity | 40% Debt"}
            {risk === "aggressive" && "80% Equity | 20% Debt"}
          </div>
        </div>
      )}
    </div>
  );
}
