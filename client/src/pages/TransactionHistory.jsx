import { useState, useEffect } from "react";
import "../App.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/transactions/${userId}`);
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  if (!userId) {
    return <div className="text-center mt-15" style={{ fontSize: "20px", fontWeight: "bold" }}>Please log in to view transactions.</div>;
  }

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <h2 className="transaction-title">📜 Transaction History</h2>
      </div>

      {loading ? (
        <p className="no-task">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="no-task">No transactions found.</p>
      ) : (
        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Related User</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="tx-date">
                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="tx-desc">{tx.description}</td>
                  <td className="tx-user">
                    {tx.relatedUser ? (
                      <div className="related-user-badge">
                        👤 {tx.relatedUser.name}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        tx.type === "credit" ? "accepted" : "rejected"
                      }`}
                    >
                      {tx.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`tx-amount ${tx.type === "credit" ? "credit" : "debit"}`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
