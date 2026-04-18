import "../App.css";

function Home() {
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