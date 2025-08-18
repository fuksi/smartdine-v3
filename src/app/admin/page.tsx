import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to orders page as default view
  redirect("/admin/orders");
}
