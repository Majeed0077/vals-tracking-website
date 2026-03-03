import Link from "next/link";
import { getPublicSiteContent } from "@/lib/siteContent";

function HomeServiceIcon({ index }: { index: number }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#ff2539",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (index === 0) return <svg {...common}><path d="M12 3a4.5 4.5 0 0 0-4.5 4.5c0 3.9 4.5 8.2 4.5 8.2s4.5-4.3 4.5-8.2A4.5 4.5 0 0 0 12 3Z" /><circle cx="12" cy="7.5" r="1.5" /><path d="M3 16h18" /><rect x="5" y="16" width="14" height="4.5" rx="1.8" /></svg>;
  if (index === 1) return <svg {...common}><path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" /><path d="M4 7.5V16.5L12 21l8-4.5V7.5" /><circle cx="12" cy="12" r="3.2" /></svg>;
  if (index === 2) return <svg {...common}><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M7 12V9" /><path d="M10 12V7" /><path d="M13 12v-2" /><circle cx="18.5" cy="16.5" r="2.5" /></svg>;
  return <svg {...common}><path d="M8 5a2 2 0 1 1 4 0v8.3a3.2 3.2 0 1 1-4 0V5Z" /><path d="M10 9V5" /><path d="M17.4 6.2v3.6" /><path d="M15.6 8h3.6" /></svg>;
}

export default async function HomePage() {
  const content = await getPublicSiteContent();
  const heroLines = String(content.home.heroTitle || "").split("\n").filter(Boolean);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">{content.home.heroBadge}</span>
            <h1 className="hero-title">
              {heroLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < heroLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h1>
            <p className="hero-subtitle">{content.home.heroSubtitle}</p>

            <div className="hero-actions">
              <Link href="/contact" className="btn btn-primary hero-btn">Get a Quote</Link>
              <Link href="/packages" className="btn btn-secondary hero-btn">View Packages</Link>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric"><strong>500+</strong><span>Fleets connected</span></div>
              <div className="hero-metric"><strong>24/7</strong><span>Monitoring center</span></div>
              <div className="hero-metric"><strong>99.9%</strong><span>Uptime SLA</span></div>
            </div>

            <div className="hero-trust">
              <span className="trust-pill">Logistics</span>
              <span className="trust-pill">Cold Chain</span>
              <span className="trust-pill">Construction</span>
              <span className="trust-pill">Public Transport</span>
            </div>
          </div>

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
                    <div className="ops-kpi"><span>Total</span><strong>128</strong></div>
                    <div className="ops-kpi ops-kpi--active"><span>Active</span><strong>84</strong></div>
                    <div className="ops-kpi ops-kpi--alert"><span>Alerts</span><strong>6</strong></div>
                  </div>
                  <ul className="ops-alerts">
                    <li className="ops-alert-item ops-alert-item--warn">Truck #21 delayed near M5</li>
                    <li className="ops-alert-item">Van #08 resumed route to KHI</li>
                    <li className="ops-alert-item">Cold chain healthy on 14 units</li>
                  </ul>
                </div>
              </div>
              <div className="ops-footer"><span>Logistics</span><span>Fuel Monitoring</span><span>Driver Safety</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="container">
          <div className="section-head"><h2 className="section-title">{content.home.whyTitle}</h2></div>
          <p className="section-lead">{content.home.whyLead}</p>
          <div className="why-grid home-why-grid">
            {(content.home.whyItems || []).map((item) => (
              <div className="why-item home-why-item" key={item.title}>
                <span className="tick"></span>
                <div className="why-text">
                  <span className="why-title">{item.title}</span>
                  <span className="why-sub">{item.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Our Services</h2>
            <Link href="/services" className="section-action">View all services</Link>
          </div>
          <p className="section-lead">{content.home.servicesLead}</p>

          <div className="cards-grid home-services-grid">
            {(content.home.services || []).slice(0, 4).map((item, index) => (
              <article className="card home-service-card" key={item.title}>
                <div className="card-icon"><HomeServiceIcon index={index} /></div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-text">{item.text}</p>
                <div className="home-service-tags">
                  {(item.tags || []).slice(0, 2).map((tag) => (
                    <span className="home-service-tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <Link href={item.href || "/services"} className="card-link">Learn More &gt;</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plans">
        <div className="container plans-inner">
          <div className="plans-intro">
            <div className="section-head"><h2 className="section-title">Our Plans</h2></div>
            <p className="plans-text">Ready to Transform<br />Your Fleet Management?</p>
          </div>

          <div className="packages-grid home-packages-grid">
            {(content.home.plans || []).slice(0, 3).map((plan, index) => (
              <article
                className={`package-card ${index === 0 ? "package-card--silver" : index === 1 ? "package-card--gold" : "package-card--fleet"}`}
                key={plan.name}
              >
                <div className="package-card-head">
                  <div>
                    <h3 className="package-name">{plan.name}</h3>
                  </div>
                </div>
                <p className="package-price">
                  {plan.price !== "Custom Pricing" ? <span className="package-currency">Rs.</span> : null}
                  <strong>{plan.price}</strong>
                  {plan.period ? <span className="package-period">{plan.period}</span> : null}
                </p>
                <ul className="package-list">
                  {(plan.items || []).map((line) => <li key={line}>{line}</li>)}
                </ul>
                <Link href={plan.href || "/contact"} className="btn btn-primary price-btn package-btn">{plan.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <h2 className="cta-title">Ready to optimize your fleet?</h2>
              <p className="cta-text">Talk to our team for a tailored tracking plan, installation support, and a demo.</p>
            </div>
            <div className="cta-actions">
              <Link href="/contact" className="btn btn-primary">Book a Demo</Link>
              <Link href="/packages" className="btn btn-secondary">Compare Plans</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
