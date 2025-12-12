// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ClientRoot from "./ClientRoot";


export const metadata: Metadata = {
  title: "VALS Tracking Pvt Ltd",
  description: "Fleet tracking & management in Pakistan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <ClientRoot>{children}</ClientRoot>
        </div>
      </body>
    </html>
  );
}
