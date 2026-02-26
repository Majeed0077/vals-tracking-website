// app/page.tsx
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

          {/* RIGHT MEDIA */}
          <div className="hero-media">
            <div className="hero-dashboard-card hero-ops-card" aria-label="Live fleet operations preview">
              <div className="ops-header">
                <span className="ops-dot-icon" aria-hidden="true"></span>
                <div className="ops-title-wrap">
                  <span className="ops-title">Live Fleet Operations</span>
                  <span className="ops-subtitle">Karachi command center</span>
                </div>
                <span className="ops-badge">Realtime</span>
              </div>

              <div className="ops-body">
                <div className="ops-map" aria-hidden="true">
                  <svg viewBox="0 0 420 210" className="ops-route">
                    <path d="M20 180 C90 140, 115 155, 172 108 S282 40, 400 70" />
                    <path d="M20 122 C120 88, 170 146, 242 138 S350 120, 400 170" />
                  </svg>
                  <span className="ops-node node-lahore">Lahore</span>
                  <span className="ops-node node-isl">Islamabad</span>
                  <span className="ops-node node-khi">Karachi</span>
                  <span className="ops-ping ping-1"></span>
                  <span className="ops-ping ping-2"></span>
                  <span className="ops-ping ping-3"></span>
                </div>

                <div className="ops-side">
                  <div className="ops-kpis">
                    <div className="ops-kpi">
                      <span>Total</span>
                      <strong>128</strong>
                    </div>
                    <div className="ops-kpi ops-kpi--active">
                      <span>Active</span>
                      <strong>84</strong>
                    </div>
                    <div className="ops-kpi ops-kpi--alert">
                      <span>Alerts</span>
                      <strong>6</strong>
                    </div>
                  </div>

                  <ul className="ops-alerts">
                    <li className="ops-alert-item ops-alert-item--warn">Truck #21 delayed near M5</li>
                    <li className="ops-alert-item">Van #08 resumed route to KHI</li>
                    <li className="ops-alert-item">Cold chain healthy on 14 units</li>
                  </ul>
                </div>
              </div>

              <div className="ops-footer">
                <span>Logistics</span>
                <span>Fuel Monitoring</span>
                <span>Driver Safety</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* WHY CHOOSE US */}
      <section className="why">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Why Choose Us</h2>
          </div>
          <p className="section-lead">
            Built for reliability, response speed and operational clarity across Pakistan.
          </p>

          <div className="why-grid home-why-grid">
            <div className="why-item home-why-item">
              <span className="tick"></span>
              <div className="why-text">
                <span className="why-title">Since 2016</span>
                <span className="why-sub">Field-proven deployments</span>
              </div>
            </div>
            <div className="why-item home-why-item">
              <span className="tick"></span>
              <div className="why-text">
                <span className="why-title">24/7 Monitoring</span>
                <span className="why-sub">Always-on command center</span>
              </div>
            </div>
            <div className="why-item home-why-item">
              <span className="tick"></span>
              <div className="why-text">
                <span className="why-title">Pakistan-wide Coverage</span>
                <span className="why-sub">Urban to remote routes</span>
              </div>
            </div>
            <div className="why-item home-why-item">
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

          <div className="cards-grid home-services-grid">
            {/* Vehicle Tracking */}
            <article className="card home-service-card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a4.5 4.5 0 0 0-4.5 4.5c0 3.9 4.5 8.2 4.5 8.2s4.5-4.3 4.5-8.2A4.5 4.5 0 0 0 12 3Z"></path>
                  <circle cx="12" cy="7.5" r="1.5"></circle>
                  <path d="M3 16h18"></path>
                  <rect x="5" y="16" width="14" height="4.5" rx="1.8"></rect>
                  <circle cx="8" cy="20.5" r="1"></circle>
                  <circle cx="16" cy="20.5" r="1"></circle>
                </svg>
              </div>
              <h3 className="card-title">Vehicle Tracking</h3>
              <p className="card-text">
                Track and control your vehicles in real-time.
              </p>
              <div className="home-service-tags">
                <span className="home-service-tag">Live trips</span>
                <span className="home-service-tag">Ignition alerts</span>
              </div>
              <Link href="/services/vehicle-tracking" className="card-link">
                Learn More &gt;
              </Link>
            </article>

            {/* Asset Tracking */}
            <article className="card home-service-card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z"></path>
                  <path d="M4 7.5V16.5L12 21l8-4.5V7.5"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                  <path d="M12 7v2"></path>
                  <path d="M12 15v2"></path>
                  <path d="M7 12h2"></path>
                  <path d="M15 12h2"></path>
                </svg>
              </div>
              <h3 className="card-title">Asset Tracking</h3>
              <p className="card-text">
                Monitor valuable assets with precision.
              </p>
              <div className="home-service-tags">
                <span className="home-service-tag">Geo-fencing</span>
                <span className="home-service-tag">Anti-loss</span>
              </div>
              <Link href="/services/asset-tracking" className="card-link">
                Learn More &gt;
              </Link>
            </article>

            {/* Fleet Management */}
            <article className="card home-service-card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="14" height="12" rx="2"></rect>
                  <path d="M7 12V9"></path>
                  <path d="M10 12V7"></path>
                  <path d="M13 12v-2"></path>
                  <circle cx="18.5" cy="16.5" r="2.5"></circle>
                  <path d="M18.5 13.3v1.2"></path>
                  <path d="M18.5 18.5v1.2"></path>
                  <path d="M21.7 16.5h-1.2"></path>
                  <path d="M16.5 16.5h-1.2"></path>
                </svg>
              </div>
              <h3 className="card-title">Fleet Management</h3>
              <p className="card-text">
                Improve efficiency with our fleet management system.
              </p>
              <div className="home-service-tags">
                <span className="home-service-tag">Dashboards</span>
                <span className="home-service-tag">Insights</span>
              </div>
              <Link href="/services/fleet-management" className="card-link">
                Learn More &gt;
              </Link>
            </article>

            {/* Cold Chain Monitoring */}
            <article className="card home-service-card">
              <div className="card-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2539"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 5a2 2 0 1 1 4 0v8.3a3.2 3.2 0 1 1-4 0V5Z"></path>
                  <path d="M10 9V5"></path>
                  <path d="M10 15.5a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"></path>
                  <path d="M17.4 6.2v3.6"></path>
                  <path d="M15.6 8h3.6"></path>
                  <path d="m16.1 6.7 2.6 2.6"></path>
                  <path d="m18.7 6.7-2.6 2.6"></path>
                </svg>
              </div>
              <h3 className="card-title">Cold Chain Monitoring</h3>
              <p className="card-text">
                Ensure the integrity of temperature-sensitive shipments.
              </p>
              <div className="home-service-tags">
                <span className="home-service-tag">Temp logs</span>
                <span className="home-service-tag">Threshold alerts</span>
              </div>
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
            <div className="section-head">
              <h2 className="section-title">Our Plans</h2>
            </div>
            <p className="plans-text">
              Ready to Transform
              <br />
              Your Fleet Management?
            </p>
          </div>

          <div className="packages-grid home-packages-grid">
            <article className="package-card package-card--silver">
              <div className="package-card-head">
                <div>
                  <h3 className="package-name">Silver</h3>
                  <p className="package-subtitle">For growing fleets</p>
                </div>
              </div>
              <p className="package-price">
                <span className="package-currency">Rs.</span>
                <strong>15,000</strong>
                <span className="package-period">/year</span>
              </p>
              <p className="package-coverage">Up to 25 vehicles</p>
              <ul className="package-list">
                <li>24/7 Monitoring</li>
                <li>Real-Time Alerts</li>
                <li>Geo-fencing</li>
                <li>Mobile Access</li>
              </ul>
              <Link href="/contact" className="btn btn-primary price-btn package-btn">
                Get Started
              </Link>
            </article>

            <article className="package-card package-card--gold">
              <div className="package-card-head">
                <div>
                  <h3 className="package-name">Gold</h3>
                  <p className="package-subtitle">Most popular for operations teams</p>
                </div>
                <span className="package-badge">Most Popular</span>
              </div>
              <p className="package-price">
                <span className="package-currency">Rs.</span>
                <strong>20,000</strong>
                <span className="package-period">/year</span>
              </p>
              <p className="package-coverage">Up to 75 vehicles</p>
              <ul className="package-list">
                <li>Advanced Alerts</li>
                <li>Driver Analytics</li>
                <li>Geo-fencing</li>
                <li>Priority Support</li>
              </ul>
              <Link href="/contact" className="btn btn-primary price-btn package-btn">
                Get Started
              </Link>
            </article>

            <article className="package-card package-card--fleet">
              <div className="package-card-head">
                <div>
                  <h3 className="package-name">Fleet</h3>
                  <p className="package-subtitle">Enterprise-grade deployment</p>
                </div>
              </div>
              <p className="package-price">
                <strong>Custom Pricing</strong>
              </p>
              <p className="package-coverage">100+ vehicles</p>
              <ul className="package-list">
                <li>Custom SLAs</li>
                <li>API Integration</li>
                <li>Dedicated Manager</li>
                <li>Onboarding Support</li>
              </ul>
              <Link href="/contact" className="btn btn-primary price-btn package-btn">
                Talk to Sales
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
