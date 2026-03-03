import Link from "next/link";

type ServiceComingSoonPageProps = {
  params: Promise<{ slug: string }>;
};

function toTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ServiceComingSoonPage({ params }: ServiceComingSoonPageProps) {
  const { slug } = await params;
  const serviceName = toTitle(decodeURIComponent(String(slug)));

  return (
    <main className="section-block service-coming-page">
      <div className="container">
        <section className="service-coming-card">
          <span className="service-coming-badge">New Module</span>
          <h1 className="service-coming-title">{serviceName}</h1>
          <p className="service-coming-text">
            This service page is under active development and will be live soon.
          </p>
          <div className="service-coming-actions">
            <Link href="/services" className="btn btn-ghost">
              Back to Services
            </Link>
            <Link href="/contact" className="btn btn-primary">
              Get Early Access
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

