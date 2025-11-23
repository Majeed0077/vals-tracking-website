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
          <div className="container contact-grid">
            <div className="contact-info">
              <p>
                <strong>Phone</strong>
                <br />
                +27 133 486 760
                <br />
                +28 123 235 7360
              </p>
              <p>
                <strong>Email</strong>
                <br />
                <a href="mailto:info@valstracking.com">
                  info@valstracking.com
                </a>
              </p>
              <p>
                <strong>Office</strong>
                <br />
                Karachi, Pakistan
              </p>
            </div>

            <div className="contact-form">
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
