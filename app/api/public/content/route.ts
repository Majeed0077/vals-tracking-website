import { NextResponse } from "next/server";
import { getPublicSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const section = url.searchParams.get("section");
  const content = await getPublicSiteContent();

  if (section === "footer") {
    return NextResponse.json({ footer: content.footer }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
}

