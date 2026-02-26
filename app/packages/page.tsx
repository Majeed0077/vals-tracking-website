import Link from "next/link";

type PackagePlan = {
  tier: "silver" | "gold" | "fleet";
  name: string;
  badge?: string;
  subtitle: string;
  priceLabel: string;
  period?: string;
  coverage: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
};

const plans: PackagePlan[] = [
  {
    tier: "silver",
    name: "Silver",
    subtitle: "Best for small fleets starting digital tracking.",
    priceLabel: "15,000",
    period: "/year",
    coverage: "Up to 25 vehicles",
    items: ["24/7 Monitoring", "Standard Alerts & Reports", "Trip History & Geo-fence", "Mobile App Access"],
    ctaLabel: "Start Silver",
    ctaHref: "/contact",
  },
  {
    tier: "gold",
    name: "Gold",
    badge: "Most Popular",
    subtitle: "Ideal for expanding operations and control rooms.",
    priceLabel: "20,000",
    period: "/year",
    coverage: "Up to 75 vehicles",
    items: ["Advanced Alerts & Geo-fences", "Driver Behavior Analytics", "Fuel & Utilization Insights", "Priority Support"],
    ctaLabel: "Start Gold",
    ctaHref: "/contact",
  },
  {
    tier: "fleet",
    name: "Fleet",
    subtitle: "Built for enterprise logistics with custom workflows.",
    priceLabel: "Custom Pricing",
    coverage: "100+ vehicles",
    items: ["Custom SLAs", "API & ERP Integration", "Dedicated Account Manager", "Onboarding & Training"],
    ctaLabel: "Talk to Sales",
    ctaHref: "/contact",
  },
];

export default function PackagesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Packages</h1>
          <p className="page-hero-subtitle">
            Simple, transparent pricing. Choose the plan that matches the size and
            complexity of your fleet.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <p className="packages-note packages-note--packages">
              All plans include access to the web dashboard, mobile apps, alerts,
              reports and 24/7 support.
            </p>

            <div className="packages-compare-strip" role="note" aria-label="Package comparison highlights">
              <span>Installation support included</span>
              <span>Pakistan-wide command center</span>
              <span>Monthly performance reports</span>
            </div>

            <div className="packages-grid">
              {plans.map((plan) => (
                <article key={plan.name} className={`package-card package-card--${plan.tier}`}>
                  <div className="package-card-head">
                    <div>
                      <h3 className="package-name">{plan.name}</h3>
                      <p className="package-subtitle">{plan.subtitle}</p>
                    </div>
                    {plan.badge && <span className="package-badge">{plan.badge}</span>}
                  </div>

                  <p className="package-price">
                    <span className="package-currency">Rs.</span>
                    <strong>{plan.priceLabel}</strong>
                    {plan.period && <span className="package-period">{plan.period}</span>}
                  </p>

                  <p className="package-coverage">{plan.coverage}</p>

                  <ul className="package-list">
                    {plan.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <Link href={plan.ctaHref} className="btn btn-primary price-btn package-btn">
                    {plan.ctaLabel}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
