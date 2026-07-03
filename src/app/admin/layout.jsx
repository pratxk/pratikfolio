/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = { title: "Admin — Pratikfolio" };

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {children}
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
  );
}
