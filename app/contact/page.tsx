export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Contact</h1>
          <p className="page-hero-subtitle">
            Get in touch with our team for demos, pricing or technical support.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container contact-grid contact-grid--redesign">
            <div className="contact-info contact-info--redesign">
              <span className="contact-eyebrow">Talk To Our Team</span>
              <h2 className="contact-title">Let&apos;s design the right tracking stack for your fleet.</h2>
              <p className="contact-intro">
                Share your route volume, fleet size and requirements. We will propose
                the right plan, deployment model and implementation timeline.
              </p>

              <div className="contact-info-cards">
                <div className="contact-info-card">
                  <strong>Phone</strong>
                  <span>+92 311 101 06 66</span>
                  <span>+92 311 101 06 66</span>
                </div>
                <div className="contact-info-card">
                  <strong>Email</strong>
                  <a href="mailto:info@valstracking.com">info@valstracking.com</a>
                </div>
                <div className="contact-info-card">
                  <strong>Office</strong>
                  <span>
                    V4P9+9G3, National Aerospace Science and Technology Park (NASTP),
                    Faisal Cantonment, Karachi, Sindh.
                  </span>
                </div>
              </div>
            </div>

            <div className="contact-form contact-form--redesign">
              <div className="contact-form-head">
                <h3>Request a callback</h3>
                <p>Typical response within one business day.</p>
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
