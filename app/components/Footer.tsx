// app/components/Footer.tsx
import Image from "next/image";

const year = new Date().getFullYear();

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container footer-inner">
                {/* LEFT LOGO */}
                <div className="footer-brand">
                    <Image
                        src="/images/logo.png"
                        alt="logo"
                        width={700}        // ← Add real dimensions
                        height={420}
                        className="logo"
                    />
                </div>
                {/* Services */}
                <div className="footer-column">
                    <h4 className="footer-title">Services</h4>
                    <ul className="footer-links">
                        <li>
                            <a href="#">Vehicle Tracking</a>
                        </li>
                        <li>
                            <a href="#">Fleet Management</a>
                        </li>
                        <li>
                            <a href="#">MDVR &amp; Surveillance</a>
                        </li>
                    </ul>
                </div>

                {/* Company */}
                <div className="footer-column">
                    <h4 className="footer-title">Company</h4>
                    <ul className="footer-links">
                        <li>
                            <a href="#">Privacy</a>
                        </li>
                        <li>
                            <a href="#">About</a>
                        </li>
                        <li>
                            <a href="#">Legal</a>
                        </li>
                    </ul>
                </div>
                {/* Contact */}
                <div className="footer-column contact-column">
                    <h4 className="footer-title">Contact</h4>

                    <div className="footer-contact">
                        <p className="footer-contact-item">
                            📞 <a href="tel:+27133486760">+27 133 486 760</a>
                        </p>

                        <p className="footer-contact-item">
                            📍 NASTP Karachi
                        </p>

                        <p className="footer-contact-item">
                            ✉️ <a href="mailto:info@valstracking.com">Our Gmail</a>
                        </p>
                    </div>
                </div>
                {/* Newsletter */}
                <div className="footer-column">
                    <h4 className="footer-title">Newsletter</h4>
                    <form className="newsletter-form">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="newsletter-input"
                        />
                        <button className="newsletter-btn" type="submit">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container footer-bottom-inner">
                    © <span>{year}</span> Vals Tracking Pvt Ltd. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
