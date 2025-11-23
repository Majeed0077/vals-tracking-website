export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">About Us</h1>
          <p className="page-hero-subtitle">
            VALS Tracking Pvt Ltd delivers reliable fleet tracking and security
            solutions for businesses across Pakistan.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container about-grid">
            <div>
              <p className="about-text">
                Since 2016, we have been helping transporters, logistics companies
                and enterprise fleets improve visibility, safety and efficiency.
                Our platform connects vehicles, drivers and assets on a single,
                easy-to-use dashboard.
              </p>
              <ul className="about-list">
                <li>✔ ISO-certified tracking devices and infrastructure</li>
                <li>✔ 24/7 control room monitoring and alerts</li>
                <li>✔ Local support teams across major cities</li>
                <li>✔ Scalable solutions from small fleets to nationwide networks</li>
              </ul>
            </div>

            <div className="about-stat-box">
              <div className="about-stat-label">Vehicles Tracked</div>
              <div className="about-stat-value">5,000+</div>
              <div className="about-stat-label" style={{ marginTop: 14 }}>
                Clients
              </div>
              <div className="about-stat-value">300+</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
