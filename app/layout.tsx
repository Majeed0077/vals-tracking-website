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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem("vals-theme");
                  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div className="page">
          <ClientRoot>{children}</ClientRoot>
        </div>
      </body>
    </html>
  );
}
