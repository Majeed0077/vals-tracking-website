import Link from "next/link";
import { getPublicSiteContent } from "@/lib/siteContent";

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

export default async function PackagesPage() {
  const content = await getPublicSiteContent();
  const plans = (content.packages.plans || []) as PackagePlan[];
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">{content.packages.heroTitle}</h1>
          <p className="page-hero-subtitle">{content.packages.heroSubtitle}</p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <p className="packages-note packages-note--packages">
              {content.packages.note}
            </p>

            <div className="packages-compare-strip" role="note" aria-label="Package comparison highlights">
              {(content.packages.compare || []).map((item) => (
                <span key={item}>{item}</span>
              ))}
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
