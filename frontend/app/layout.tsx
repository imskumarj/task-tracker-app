import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TaskBoard",
  description:
    "TaskBoard is a clean, professional task tracker for instructors, students, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}

          <Toaster
            richColors
            position="top-right"
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}