// app/page.tsx
import Image from "next/image";
import Link from "next/link";
export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          {/* LEFT TEXT */}
          <div className="hero-copy">
            <span className="hero-badge">Pakistan-wide GPS and fleet ops</span>
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

            <div className="hero-actions">
              <Link href="/contact" className="btn btn-primary hero-btn">
                Get a Quote
              </Link>
              <Link href="/packages" className="btn btn-secondary hero-btn">
                View Packages
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>500+</strong>
                <span>Fleets connected</span>
              </div>
              <div className="hero-metric">
                <strong>24/7</strong>
                <span>Monitoring center</span>
              </div>
              <div className="hero-metric">
                <strong>99.9%</strong>
                <span>Uptime SLA</span>
              </div>
            </div>

            <div className="hero-trust">
              <span className="trust-pill">Logistics</span>
              <span className="trust-pill">Cold Chain</span>
              <span className="trust-pill">Construction</span>
              <span className="trust-pill">Public Transport</span>
            </div>
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
              <div className="why-text">
                <span className="why-title">Since 2016</span>
                <span className="why-sub">Field-proven deployments</span>
              </div>
            </div>
            <div className="why-item">
              <span className="tick"></span>
              <div className="why-text">
                <span className="why-title">24/7 Monitoring</span>
                <span className="why-sub">Always-on command center</span>
              </div>
            </div>
            <div className="why-item">
              <span className="tick"></span>
              <div className="why-text">
                <span className="why-title">Pakistan-wide Coverage</span>
                <span className="why-sub">Urban to remote routes</span>
              </div>
            </div>
            <div className="why-item">
              <span className="tick"></span>
              <div className="why-text">
                <span className="why-title">Advanced Technology</span>
                <span className="why-sub">Smart alerts and insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* OUR SERVICES */}
      <section className="services">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Our Services</h2>
            <Link href="/services" className="section-action">
              View all services
            </Link>
          </div>
          <p className="section-lead">
            Full-stack tracking solutions built for logistics, field teams, and high-value assets.
          </p>

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
              <Link href="/services/vehicle-tracking" className="card-link">
                Learn More &gt;
              </Link>
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
              <Link href="/services/asset-tracking" className="card-link">
                Learn More &gt;
              </Link>
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
              <Link href="/services/fleet-management" className="card-link">
                Learn More &gt;
              </Link>
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
              <Link href="/services/cold-chain" className="card-link">
                Learn More &gt;
              </Link>
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
              <Link href="/contact" className="btn btn-primary price-btn">
                Get Started
              </Link>
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
              <Link href="/contact" className="btn btn-primary price-btn">
                Get Started
              </Link>
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
              <Link href="/contact" className="btn btn-primary price-btn">
                Get Started
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <h2 className="cta-title">Ready to optimize your fleet?</h2>
              <p className="cta-text">
                Talk to our team for a tailored tracking plan, installation support, and a demo.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/contact" className="btn btn-primary">
                Book a Demo
              </Link>
              <Link href="/packages" className="btn btn-secondary">
                Compare Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
