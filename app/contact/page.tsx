import { getPublicSiteContent } from "@/lib/siteContent";

export default async function ContactPage() {
  const content = await getPublicSiteContent();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">{content.contact.heroTitle}</h1>
          <p className="page-hero-subtitle">{content.contact.heroSubtitle}</p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container contact-grid contact-grid--redesign">
            <div className="contact-info contact-info--redesign">
              <span className="contact-eyebrow">{content.contact.eyebrow}</span>
              <h2 className="contact-title">{content.contact.title}</h2>
              <p className="contact-intro">{content.contact.intro}</p>

              <div className="contact-info-cards">
                <div className="contact-info-card">
                  <strong>Phone</strong>
                  <span>{content.contact.phone1}</span>
                  <span>{content.contact.phone2}</span>
                </div>
                <div className="contact-info-card">
                  <strong>Email</strong>
                  <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
                </div>
                <div className="contact-info-card">
                  <strong>Office</strong>
                  <span>{content.contact.office}</span>
                </div>
              </div>
            </div>

            <div className="contact-form contact-form--redesign">
              <div className="contact-form-head">
                <h3>{content.contact.formTitle}</h3>
                <p>{content.contact.formSubtitle}</p>
              </div>

              <form>
                <div className="contact-form-row">
                  <div style={{ flex: 1 }}>
                    <label className="contact-label">Name</label>
                    <input
                      type="text"
                      className="contact-input"
                      placeholder="Your name"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="contact-label">Email</label>
                    <input
                      type="email"
                      className="contact-input"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div style={{ flex: 1 }}>
                    <label className="contact-label">Company</label>
                    <input
                      type="text"
                      className="contact-input"
                      placeholder="Company name"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="contact-label">Phone</label>
                    <input
                      type="text"
                      className="contact-input"
                      placeholder="+92 ..."
                    />
                  </div>
                </div>

                <label className="contact-label">Message</label>
                <textarea
                  className="contact-textarea"
                  placeholder="Tell us about your fleet and requirements"
                ></textarea>

                <button
                  type="submit"
                  className="btn btn-primary contact-submit"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
