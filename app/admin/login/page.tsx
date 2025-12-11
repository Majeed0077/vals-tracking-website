// app/admin/login/page.tsx
import { redirect } from "next/navigation";

export default function AdminLoginRedirectPage() {
  redirect("/login");
}
