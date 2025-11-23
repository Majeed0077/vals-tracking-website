export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Services</h1>
          <p className="page-hero-subtitle">
            End-to-end fleet tracking, management and monitoring solutions designed
            for transport companies, logistics teams and asset owners.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <div className="services-detail-grid">
              <article className="service-detail-card">
                <h3 className="service-detail-title">Vehicle Tracking</h3>
                <p className="service-detail-text">
                  Real-time GPS tracking, live location, trip history, ignition status
                  and speed monitoring for every vehicle in your fleet.
                </p>
              </article>

              <article className="service-detail-card">
                <h3 className="service-detail-title">Asset Tracking</h3>
                <p className="service-detail-text">
                  Secure high-value assets with compact trackers, movement alerts and
                  geo-fencing to prevent loss or unauthorized use.
                </p>
              </article>

              <article className="service-detail-card">
                <h3 className="service-detail-title">Fleet Management</h3>
                <p className="service-detail-text">
                  Centralized dashboard for routes, utilization, driver behavior,
                  maintenance reminders and performance reports.
                </p>
              </article>

              <article className="service-detail-card">
                <h3 className="service-detail-title">Cold Chain Monitoring</h3>
                <p className="service-detail-text">
                  Temperature and door sensors for reefer trucks and cold storage,
                  with instant alerts when thresholds are crossed.
                </p>
              </article>

              <article className="service-detail-card">
                <h3 className="service-detail-title">MDVR &amp; Surveillance</h3>
                <p className="service-detail-text">
                  Multi-camera video recording with remote playback to improve
                  safety, reduce disputes and support incident investigations.
                </p>
              </article>

              <article className="service-detail-card">
                <h3 className="service-detail-title">Custom Integrations</h3>
                <p className="service-detail-text">
                  APIs and custom integrations with your existing ERP, dispatch or
                  billing platforms for a seamless workflow.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
