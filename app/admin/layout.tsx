// app/admin/layout.tsx
import type { ReactNode } from "react";
import AdminHeader from "../components/AdminHeader";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  );
}
