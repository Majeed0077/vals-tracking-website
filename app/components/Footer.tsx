// app/components/Footer.tsx
"use client";

import { useEffect, useState } from "react";

type FooterContent = {
    services: string[];
    company: string[];
    phone: string;
    address: string;
    email: string;
    newsletterTitle: string;
    newsletterPlaceholder: string;
    companyName: string;
};

const FALLBACK_FOOTER_CONTENT: FooterContent = {
    services: ["Vehicle Tracking", "Fleet Management", "MDVR & Surveillance"],
    company: ["Privacy", "About", "Legal"],
    phone: "+92 311 101 066",
    address: "V4P9+9G3, National Aerospace Science and Technology Park (NASTP), Faisal Cantonment, Karachi, Sindh",
    email: "info@valstracking.com",
    newsletterTitle: "Newsletter",
    newsletterPlaceholder: "Enter your email",
    companyName: "Vals Tracking Pvt Ltd",
};

const year = new Date().getFullYear();

export default function Footer() {
    const [content, setContent] = useState<FooterContent>(FALLBACK_FOOTER_CONTENT);

    useEffect(() => {
        let active = true;
        async function loadFooter() {
            try {
                const res = await fetch("/api/public/content?section=footer", { cache: "no-store" });
                if (!res.ok) return;
                const data = (await res.json()) as { footer?: FooterContent };
                if (active && data.footer) {
                    setContent(data.footer);
                }
            } catch {
                // keep fallback content
            }
        }
        loadFooter();
        return () => {
            active = false;
        };
    }, []);

    return (
        <footer className="site-footer">
            <div className="container footer-inner">
                <div className="footer-column">
                    <h4 className="footer-title">Services</h4>
                    <ul className="footer-links">
                        {content.services.map((item) => (
                            <li key={item}>
                                <a href="#">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-column">
                    <h4 className="footer-title">Company</h4>
                    <ul className="footer-links">
                        {content.company.map((item) => (
                            <li key={item}>
                                <a href="#">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-column footer-card contact-column">
                    <h4 className="footer-title">Contact</h4>

                    <div className="footer-contact">
                        <p className="footer-contact-item">
                            <span className="footer-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.9 19.9 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.9 19.9 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.9 12.9 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.7a16 16 0 0 0 6.2 6.2l1.1-1.2a2 2 0 0 1 2.1-.5 12.9 12.9 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
                                </svg>
                            </span>
                            <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
                        </p>

                        <p className="footer-contact-item">
                            <span className="footer-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </span>
                            <span>{content.address}</span>
                        </p>

                        <p className="footer-contact-item">
                            <span className="footer-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                    <path d="m22 6-10 7L2 6" />
                                </svg>
                            </span>
                            <a href={`mailto:${content.email}`}>{content.email}</a>
                        </p>
                    </div>
                </div>

                <div className="footer-column footer-card newsletter-card">
                    <h4 className="footer-title">{content.newsletterTitle}</h4>
                    <form className="newsletter-form">
                        <input type="email" placeholder={content.newsletterPlaceholder} className="newsletter-input" />
                        <button className="newsletter-btn" type="submit">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container footer-bottom-inner">
                    &copy; <span>{year}</span> {content.companyName}. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
