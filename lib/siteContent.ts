import "server-only";
import { connectDB } from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";

export type HomeWhyItem = { title: string; subtitle: string };
export type HomeServiceItem = { title: string; text: string; tags: string[]; href: string };
export type HomePlanItem = { name: string; price: string; period?: string; items: string[]; cta: string; href: string };
export type HomeContent = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  whyTitle: string;
  whyLead: string;
  whyItems: HomeWhyItem[];
  servicesLead: string;
  services: HomeServiceItem[];
  plans: HomePlanItem[];
};

export type ServicesContent = {
  heroTitle: string;
  heroSubtitle: string;
  eyebrow: string;
  lead: string;
  items: Array<{ title: string; text: string; highlights: string[]; href: string; icon: string }>;
};

export type PackagesContent = {
  heroTitle: string;
  heroSubtitle: string;
  note: string;
  compare: string[];
  plans: Array<{
    tier: string;
    name: string;
    badge?: string;
    subtitle: string;
    priceLabel: string;
    period?: string;
    coverage: string;
    items: string[];
    ctaLabel: string;
    ctaHref: string;
  }>;
};

export type AboutContent = {
  heroTitle: string;
  heroSubtitle: string;
  storyEyebrow: string;
  storyTitle: string;
  storyText: string;
  list: string[];
  stats: Array<{ label: string; value: string }>;
  pillars: Array<{ title: string; text: string }>;
};

export type ContactContent = {
  heroTitle: string;
  heroSubtitle: string;
  eyebrow: string;
  title: string;
  intro: string;
  phone1: string;
  phone2: string;
  email: string;
  office: string;
  formTitle: string;
  formSubtitle: string;
};

export type FooterContent = {
  services: string[];
  company: string[];
  phone: string;
  address: string;
  email: string;
  newsletterTitle: string;
  newsletterPlaceholder: string;
  companyName: string;
};

export type PublicSiteContent = {
  home: HomeContent;
  services: ServicesContent;
  packages: PackagesContent;
  about: AboutContent;
  contact: ContactContent;
  footer: FooterContent;
};

export const DEFAULT_PUBLIC_CONTENT: PublicSiteContent = {
  home: {
    heroBadge: "Pakistan-wide GPS and fleet ops",
    heroTitle: "RELIABLE FLEET\nTRACKING &\nMANAGEMENT\nIN PAKISTAN",
    heroSubtitle: "Optimize your fleet operations with real-time GPS tracking and comprehensive management solutions.",
    whyTitle: "Why Choose Us",
    whyLead: "Built for reliability, response speed and operational clarity across Pakistan.",
    whyItems: [
      { title: "Since 2016", subtitle: "Field-proven deployments" },
      { title: "24/7 Monitoring", subtitle: "Always-on command center" },
      { title: "Pakistan-wide Coverage", subtitle: "Urban to remote routes" },
      { title: "Advanced Technology", subtitle: "Smart alerts and insights" },
    ],
    servicesLead: "Full-stack tracking solutions built for logistics, field teams, and high-value assets.",
    services: [
      { title: "Vehicle Tracking", text: "Track and control your vehicles in real-time.", tags: ["Live trips", "Ignition alerts"], href: "/services/vehicle-tracking" },
      { title: "Asset Tracking", text: "Monitor valuable assets with precision.", tags: ["Geo-fencing", "Anti-loss"], href: "/services/asset-tracking" },
      { title: "Fleet Management", text: "Improve efficiency with our fleet management system.", tags: ["Dashboards", "Insights"], href: "/services/fleet-management" },
      { title: "Cold Chain Monitoring", text: "Ensure the integrity of temperature-sensitive shipments.", tags: ["Temp logs", "Threshold alerts"], href: "/services/cold-chain" },
    ],
    plans: [
      { name: "Silver", price: "15,000", period: "/year", items: ["24/7 Monitoring", "Real-Time Alerts", "Geofencing", "Mobile Access"], cta: "Get Started", href: "/contact" },
      { name: "Gold", price: "20,000", period: "/year", items: ["24/7 Monitoring", "Real-Time Alerts", "Geofencing", "Mobile Access"], cta: "Get Started", href: "/contact" },
      { name: "Fleet", price: "Custom Pricing", items: ["24/7 Monitoring", "Real-Time Alerts", "Geofencing", "Mobile Access"], cta: "Talk to Sales", href: "/contact" },
    ],
  },
  services: {
    heroTitle: "Services",
    heroSubtitle: "End-to-end fleet tracking, management and monitoring solutions designed for transport companies, logistics teams and asset owners.",
    eyebrow: "Operations Stack",
    lead: "Designed for Pakistani logistics realities: urban congestion, long-haul routes and high-value cargo.",
    items: [
      { title: "Vehicle Tracking", text: "Real-time GPS tracking, trip history and route visibility for every active vehicle.", highlights: ["Live ignition status", "Overspeed alerts"], href: "/services/vehicle-tracking", icon: "vehicle" },
      { title: "Asset Tracking", text: "Secure high-value assets with compact trackers and movement intelligence.", highlights: ["Geo-fence zones", "Tamper notifications"], href: "/services/asset-tracking", icon: "asset" },
      { title: "Fleet Management", text: "Centralized command panel for routes, driver behavior and maintenance planning.", highlights: ["Utilization insights", "Driver scorecards"], href: "/services/fleet-management", icon: "fleet" },
      { title: "Cold Chain Monitoring", text: "Continuous temperature and door-state visibility for reefer vehicles and cold rooms.", highlights: ["Threshold breaches", "Compliance logs"], href: "/services/cold-chain", icon: "cold" },
      { title: "MDVR & Surveillance", text: "Multi-camera fleet surveillance with playback tools for disputes and incidents.", highlights: ["Remote playback", "Event evidence clips"], href: "/services/mdvr", icon: "mdvr" },
      { title: "Custom Integrations", text: "Connect with ERP, dispatch and billing systems to keep operations in one flow.", highlights: ["API-first workflows", "Webhook automations"], href: "/services/custom-integrations", icon: "integrations" },
    ],
  },
  packages: {
    heroTitle: "Packages",
    heroSubtitle: "Simple, transparent pricing. Choose the plan that matches the size and complexity of your fleet.",
    note: "All plans include access to the web dashboard, mobile apps, alerts, reports and 24/7 support.",
    compare: ["Installation support included", "Pakistan-wide command center", "Monthly performance reports"],
    plans: [
      { tier: "silver", name: "Silver", subtitle: "Best for small fleets starting digital tracking.", priceLabel: "15,000", period: "/year", coverage: "Up to 25 vehicles", items: ["24/7 Monitoring", "Standard Alerts & Reports", "Trip History & Geo-fence", "Mobile App Access"], ctaLabel: "Start Silver", ctaHref: "/contact" },
      { tier: "gold", name: "Gold", badge: "Most Popular", subtitle: "Ideal for expanding operations and control rooms.", priceLabel: "20,000", period: "/year", coverage: "Up to 75 vehicles", items: ["Advanced Alerts & Geo-fences", "Driver Behavior Analytics", "Fuel & Utilization Insights", "Priority Support"], ctaLabel: "Start Gold", ctaHref: "/contact" },
      { tier: "fleet", name: "Fleet", subtitle: "Built for enterprise logistics with custom workflows.", priceLabel: "Custom Pricing", coverage: "100+ vehicles", items: ["Custom SLAs", "API & ERP Integration", "Dedicated Account Manager", "Onboarding & Training"], ctaLabel: "Talk to Sales", ctaHref: "/contact" },
    ],
  },
  about: {
    heroTitle: "About Us",
    heroSubtitle: "VALS Tracking Pvt Ltd delivers reliable fleet tracking and security solutions for businesses across Pakistan.",
    storyEyebrow: "Who We Are",
    storyTitle: "Built for fleet operators who need control, not guesswork.",
    storyText: "Since 2016, we have been helping transporters, logistics companies and enterprise fleets improve visibility, safety and efficiency. Our platform connects vehicles, drivers and assets on a single, easy-to-use dashboard.",
    list: ["ISO-certified tracking devices and infrastructure", "24/7 control room monitoring and alerts", "Local support teams across major cities", "Scalable solutions from small fleets to nationwide networks"],
    stats: [
      { label: "Vehicles Tracked", value: "5,000+" },
      { label: "Enterprise Clients", value: "300+" },
      { label: "Cities Served", value: "45+" },
      { label: "Support Availability", value: "24/7" },
    ],
    pillars: [
      { title: "Field-Proven Reliability", text: "Deployed in urban routes and long-haul operations with consistent uptime and alert accuracy." },
      { title: "24/7 Command Support", text: "Monitoring team and escalation workflows to keep your fleet operations responsive around the clock." },
      { title: "Scalable Platform", text: "From small fleets to nationwide operations, your dashboards and workflows scale smoothly." },
    ],
  },
  contact: {
    heroTitle: "Contact",
    heroSubtitle: "Get in touch with our team for demos, pricing or technical support.",
    eyebrow: "Talk To Our Team",
    title: "Let's design the right tracking stack for your fleet.",
    intro: "Share your route volume, fleet size and requirements. We will propose the right plan, deployment model and implementation timeline.",
    phone1: "+92 311 101 06 66",
    phone2: "+92 311 101 06 66",
    email: "info@valstracking.com",
    office: "V4P9+9G3, National Aerospace Science and Technology Park (NASTP), Faisal Cantonment, Karachi, Sindh.",
    formTitle: "Request a callback",
    formSubtitle: "Typical response within one business day.",
  },
  footer: {
    services: ["Vehicle Tracking", "Fleet Management", "MDVR & Surveillance"],
    company: ["Privacy", "About", "Legal"],
    phone: "+92 311 101 066",
    address: "V4P9+9G3, National Aerospace Science and Technology Park (NASTP), Faisal Cantonment, Karachi, Sindh",
    email: "info@valstracking.com",
    newsletterTitle: "Newsletter",
    newsletterPlaceholder: "Enter your email",
    companyName: "Vals Tracking Pvt Ltd",
  },
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mergeContent(defaults: PublicSiteContent, incoming: unknown): PublicSiteContent {
  const root = asObject(incoming);
  return {
    home: { ...defaults.home, ...asObject(root.home) } as HomeContent,
    services: { ...defaults.services, ...asObject(root.services) } as ServicesContent,
    packages: { ...defaults.packages, ...asObject(root.packages) } as PackagesContent,
    about: { ...defaults.about, ...asObject(root.about) } as AboutContent,
    contact: { ...defaults.contact, ...asObject(root.contact) } as ContactContent,
    footer: { ...defaults.footer, ...asObject(root.footer) } as FooterContent,
  };
}

export async function getPublicSiteContent(): Promise<PublicSiteContent> {
  try {
    await connectDB();
    const setting = await SiteSetting.findOneAndUpdate(
      { key: "global" },
      { $setOnInsert: { key: "global", publicContent: DEFAULT_PUBLIC_CONTENT } },
      { new: true, upsert: true }
    )
      .select("publicContent")
      .lean<{ publicContent?: unknown }>();

    return mergeContent(DEFAULT_PUBLIC_CONTENT, setting?.publicContent);
  } catch {
    return DEFAULT_PUBLIC_CONTENT;
  }
}
