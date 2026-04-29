import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  const role = localStorage.getItem("role");

  if (role === "admin") {
    return (
      <section className="hero" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1>
          Platform <span>Control Center</span>
        </h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '20px auto' }}>
          Welcome, Administrator. Oversee platform operations, manage new user approvals, and monitor system escrows securely to maintain a healthy ecosystem.
        </p>

        <div className="buttons" style={{ marginTop: '40px' }}>
          <Link to="/admin-dashboard">
            <button className="primary" style={{ padding: '15px 30px', fontSize: '18px', borderRadius: '8px' }}>
              Access Admin Dashboard 🛡️
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero">
        <h1>
          Get help. <span>Give help.</span> Get paid.
        </h1>
        <p>
          TaskMate connects people who need help with assignments and projects
          to skilled volunteers — ethically, transparently, and on time.
        </p>

        <div className="buttons">
          <button className="primary">I Need Help</button>
          <button className="secondary">I Want to Help</button>
        </div>
      </section>

      <section className="how">
        <h2>How TaskMate Works</h2>

        <div className="cards">
          <div className="card">
            <h3>1. Post Your Task</h3>
            <p>Upload your assignment and set a deadline.</p>
          </div>

          <div className="card">
            <h3>2. Get Matched</h3>
            <p>Volunteers review your task and offer help.</p>
          </div>

          <div className="card">
            <h3>3. Learn & Complete</h3>
            <p>Receive ethical help and finish on time.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;