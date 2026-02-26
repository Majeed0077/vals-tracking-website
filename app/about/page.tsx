export default function AboutPage() {
  const pillars = [
    {
      title: "Field-Proven Reliability",
      text: "Deployed in urban routes and long-haul operations with consistent uptime and alert accuracy.",
    },
    {
      title: "24/7 Command Support",
      text: "Monitoring team and escalation workflows to keep your fleet operations responsive around the clock.",
    },
    {
      title: "Scalable Platform",
      text: "From small fleets to nationwide operations, your dashboards and workflows scale smoothly.",
    },
  ];

  const stats = [
    { label: "Vehicles Tracked", value: "5,000+" },
    { label: "Enterprise Clients", value: "300+" },
    { label: "Cities Served", value: "45+" },
    { label: "Support Availability", value: "24/7" },
  ];

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
          <div className="container">
            <div className="about-grid about-grid--redesign">
              <div className="about-story-card">
                <span className="about-eyebrow">Who We Are</span>
                <h2 className="about-story-title">
                  Built for fleet operators who need control, not guesswork.
                </h2>
                <p className="about-text">
                  Since 2016, we have been helping transporters, logistics companies
                  and enterprise fleets improve visibility, safety and efficiency.
                  Our platform connects vehicles, drivers and assets on a single,
                  easy-to-use dashboard.
                </p>
                <ul className="about-list">
                  <li>ISO-certified tracking devices and infrastructure</li>
                  <li>24/7 control room monitoring and alerts</li>
                  <li>Local support teams across major cities</li>
                  <li>Scalable solutions from small fleets to nationwide networks</li>
                </ul>
              </div>

              <div className="about-stat-box about-stat-box--redesign">
                <div className="about-stats-grid">
                  {stats.map((item) => (
                    <div className="about-stat-item" key={item.label}>
                      <div className="about-stat-label">{item.label}</div>
                      <div className="about-stat-value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="about-pillars-grid">
              {pillars.map((item) => (
                <article className="about-pillar-card" key={item.title}>
                  <h3 className="about-pillar-title">{item.title}</h3>
                  <p className="about-pillar-text">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
