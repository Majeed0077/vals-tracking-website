import { getPublicSiteContent } from "@/lib/siteContent";

export default async function AboutPage() {
  const content = await getPublicSiteContent();
  const pillars = content.about.pillars || [];
  const stats = content.about.stats || [];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">{content.about.heroTitle}</h1>
          <p className="page-hero-subtitle">{content.about.heroSubtitle}</p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <div className="about-grid about-grid--redesign">
              <div className="about-story-card">
                <span className="about-eyebrow">{content.about.storyEyebrow}</span>
                <h2 className="about-story-title">{content.about.storyTitle}</h2>
                <p className="about-text">{content.about.storyText}</p>
                <ul className="about-list">
                  {(content.about.list || []).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
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
