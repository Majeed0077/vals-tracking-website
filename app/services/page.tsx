import Link from "next/link";

type ServiceItem = {
  title: string;
  text: string;
  href: string;
  highlights: string[];
  icon: "vehicle" | "asset" | "fleet" | "cold" | "mdvr" | "integrations";
};

function ServiceIcon({ icon }: { icon: ServiceItem["icon"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "vehicle":
      return <svg {...common}><path d="M12 3a4.5 4.5 0 0 0-4.5 4.5c0 3.9 4.5 8.2 4.5 8.2s4.5-4.3 4.5-8.2A4.5 4.5 0 0 0 12 3Z" /><circle cx="12" cy="7.5" r="1.4" /><path d="M4 16h16" /><rect x="5" y="16" width="14" height="4" rx="1.8" /></svg>;
    case "asset":
      return <svg {...common}><path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" /><path d="M4 7.5V16.5L12 21l8-4.5V7.5" /><circle cx="12" cy="12" r="3.2" /></svg>;
    case "fleet":
      return <svg {...common}><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M7 12V9" /><path d="M10 12V7" /><path d="M13 12v-2" /><circle cx="18.5" cy="16.5" r="2.5" /></svg>;
    case "cold":
      return <svg {...common}><path d="M8 5a2 2 0 1 1 4 0v8.3a3.2 3.2 0 1 1-4 0V5Z" /><path d="M10 9V5" /><path d="M17.4 6.2v3.6" /><path d="M15.6 8h3.6" /><path d="m16.1 6.7 2.6 2.6" /><path d="m18.7 6.7-2.6 2.6" /></svg>;
    case "mdvr":
      return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m21 8-5 4v-2l5-4z" /><circle cx="9.5" cy="12" r="2.4" /></svg>;
    case "integrations":
      return <svg {...common}><rect x="3" y="4" width="8" height="8" rx="2" /><rect x="13" y="12" width="8" height="8" rx="2" /><path d="M11 8h2a2 2 0 0 1 2 2v2" /><path d="M13 6h8" /><path d="M3 18h8" /></svg>;
    default:
      return null;
  }
}

const services: ServiceItem[] = [
  {
    title: "Vehicle Tracking",
    text: "Real-time GPS tracking, trip history and route visibility for every active vehicle.",
    href: "/services/vehicle-tracking",
    highlights: ["Live ignition status", "Overspeed alerts"],
    icon: "vehicle",
  },
  {
    title: "Asset Tracking",
    text: "Secure high-value assets with compact trackers and movement intelligence.",
    href: "/services/asset-tracking",
    highlights: ["Geo-fence zones", "Tamper notifications"],
    icon: "asset",
  },
  {
    title: "Fleet Management",
    text: "Centralized command panel for routes, driver behavior and maintenance planning.",
    href: "/services/fleet-management",
    highlights: ["Utilization insights", "Driver scorecards"],
    icon: "fleet",
  },
  {
    title: "Cold Chain Monitoring",
    text: "Continuous temperature and door-state visibility for reefer vehicles and cold rooms.",
    href: "/services/cold-chain",
    highlights: ["Threshold breaches", "Compliance logs"],
    icon: "cold",
  },
  {
    title: "MDVR & Surveillance",
    text: "Multi-camera fleet surveillance with playback tools for disputes and incidents.",
    href: "/services/mdvr",
    highlights: ["Remote playback", "Event evidence clips"],
    icon: "mdvr",
  },
  {
    title: "Custom Integrations",
    text: "Connect with ERP, dispatch and billing systems to keep operations in one flow.",
    href: "/services/custom-integrations",
    highlights: ["API-first workflows", "Webhook automations"],
    icon: "integrations",
  },
];

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
            <div className="services-detail-head">
              <span className="services-detail-eyebrow">Operations Stack</span>
              <p className="services-detail-lead">
                Designed for Pakistani logistics realities: urban congestion, long-haul routes and high-value cargo.
              </p>
            </div>

            <div className="services-detail-grid">
              {services.map((item) => (
                <article className="service-detail-card" key={item.title}>
                  <div className="service-detail-icon">
                    <ServiceIcon icon={item.icon} />
                  </div>
                  <h3 className="service-detail-title">{item.title}</h3>
                  <p className="service-detail-text">{item.text}</p>
                  <div className="service-detail-tags">
                    {item.highlights.map((feature) => (
                      <span key={feature} className="service-detail-tag">{feature}</span>
                    ))}
                  </div>
                  <Link href={item.href} className="service-detail-link">Explore service</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
