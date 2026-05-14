import React, { useEffect, useState } from "react";
import "./DigitalLedger.css";

export default function CropDetails({ crop, onBack }) {

  const [data, setData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("ledger_multi");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const filtered = data.filter(d => d.crop === crop);

  return (
    <div className="page fade">

      <button className="back" onClick={onBack}>← Back</button>

      <h2>{crop} Details</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount ₹</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(item => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>₹ {item.amount}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}