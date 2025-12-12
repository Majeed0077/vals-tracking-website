// app/page.tsx
import Image from "next/image";
export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          {/* LEFT TEXT */}
          <div className="hero-copy">
            <h1 className="hero-title">
              RELIABLE FLEET
              <br />
              TRACKING &amp;
              <br />
              MANAGEMENT
              <br />
              IN PAKISTAN
            </h1>
            <p className="hero-subtitle">
              Optimize your fleet operations with real-time GPS tracking
              and comprehensive management solutions.
            </p>

            <a href="#" className="btn btn-primary hero-btn">
              Get a Quote
            </a>
          </div>

          {/* RIGHT MEDIA – dashboard only */}
          <div className="hero-media">
            <div className="hero-dashboard-card">
              <Image
                src="/images/dashboard.png"
                alt="Tracking dashboard"
                width={700}       // apni image ka width daal do
                height={420}      // apni image ka height daal do
                className="hero-dashboard"
              />

            </div>
          </div>
        </div>
      </section>
      {/* WHY CHOOSE US */}
      <section className="why">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>

          <div className="why-grid">
            <div className="why-item">
              <span className="tick"></span>
              <span>Since 2016</span>
            </div>
            <div className="why-item">
              <span className="tick"></span>
              <span>24/7 Monitoring</span>
            </div>
            <div className="why-item">
              <span className="tick"></span>
              <span>Pakistan-wide Coverage</span>
            </div>
            <div className="why-item">
              <span className="tick"></span>
              <span>Advanced Technology</span>
            </div>
          </div>
        </div>
      </section>
      {/* OUR SERVICES */}
      <section className="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>

          <div className="cards-grid">
            {/* Vehicle Tracking */}
            <article className="card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="6" rx="2" ry="2"></rect>
                  <circle cx="7.5" cy="17" r="1.5"></circle>
                  <circle cx="16.5" cy="17" r="1.5"></circle>
                </svg>
              </div>
              <h3 className="card-title">Vehicle Tracking</h3>
              <p className="card-text">
                Track and control your vehicles in real-time.
              </p>
              <a href="#" className="card-link">
                Learn More &gt;
              </a>
            </article>

            {/* Asset Tracking */}
            <article className="card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="card-title">Asset Tracking</h3>
              <p className="card-text">
                Monitor valuable assets with precision.
              </p>
              <a href="#" className="card-link">
                Learn More &gt;
              </a>
            </article>

            {/* Fleet Management */}
            <article className="card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="11" x2="22" y2="11"></line>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="card-title">Fleet Management</h3>
              <p className="card-text">
                Improve efficiency with our fleet management system.
              </p>
              <a href="#" className="card-link">
                Learn More &gt;
              </a>
            </article>

            {/* Cold Chain Monitoring */}
            <article className="card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20"></path>
                  <path d="M4.93 4.93l14.14 14.14"></path>
                  <path d="M19.07 4.93L4.93 19.07"></path>
                  <path d="M2 12h20"></path>
                </svg>
              </div>
              <h3 className="card-title">Cold Chain Monitoring</h3>
              <p className="card-text">
                Ensure the integrity of temperature-sensitive shipments.
              </p>
              <a href="#" className="card-link">
                Learn More &gt;
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* OUR PLANS */}
      <section className="plans">
        <div className="container plans-inner">
          <div className="plans-intro">
            <h2 className="section-title">Our Plans</h2>
            <p className="plans-text">
              Ready to Transform
              <br />
              Your Fleet Management?
            </p>
          </div>

          <div className="pricing-grid">
            <article className="price-card">
              <h3 className="price-name">Silver</h3>
              <p className="price-value">
                R <span>15,000</span>
                <span className="price-period">/year</span>
              </p>
              <ul className="price-list">
                <li>24/7 Monitoring</li>
                <li>Real-Time Alerts</li>
                <li>Geofencing</li>
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
                <li>24/7 Monitoring</li>
                <li>Real-Time Alerts</li>
                <li>Geofencing</li>
                <li>Mobile Access</li>
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
                <li>24/7 Monitoring</li>
                <li>Real-Time Alerts</li>
                <li>Geofencing</li>
                <li>Mobile Access</li>
              </ul>
              <a href="#" className="btn btn-primary price-btn">
                Get Started
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
