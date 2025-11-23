export default function PackagesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Packages</h1>
          <p className="page-hero-subtitle">
            Simple, transparent pricing. Choose the plan that matches the size and
            complexity of your fleet.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <p className="packages-note">
              All plans include access to the web dashboard, mobile apps, alerts,
              reports and 24/7 support.
            </p>

            <div className="pricing-grid">
              <article className="price-card">
                <h3 className="price-name">Silver</h3>
                <p className="price-value">
                  R <span>15,000</span>
                  <span className="price-period">/year</span>
                </p>
                <ul className="price-list">
                  <li>Up to 25 vehicles</li>
                  <li>24/7 Monitoring</li>
                  <li>Standard Alerts &amp; Reports</li>
                  <li>Mobile Access</li>
                </ul>
                <a href="#" className="btn btn-primary price-btn">
                  Get Started
                </a>
              </article>

              <article className="price-card price-card-highlight">
                <h3 className="price-name">Gold</h3>
                <p className="price-value">
                  R <span>20,000</span>
                  <span className="price-period">/year</span>
                </p>
                <ul className="price-list">
                  <li>Up to 75 vehicles</li>
                  <li>Advanced Alerts &amp; Geo-fences</li>
                  <li>Driver Behavior Analytics</li>
                  <li>Priority Support</li>
                </ul>
                <a href="#" className="btn btn-primary price-btn">
                  Get Started
                </a>
              </article>

              <article className="price-card">
                <h3 className="price-name">Fleet</h3>
                <p className="price-value">
                  <span>Custom Pricing</span>
                </p>
                <ul className="price-list">
                  <li>100+ vehicles</li>
                  <li>Custom SLAs</li>
                  <li>API &amp; ERP Integration</li>
                  <li>Dedicated Account Manager</li>
                </ul>
                <a href="#" className="btn btn-primary price-btn">
                  Talk to Sales
                </a>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
