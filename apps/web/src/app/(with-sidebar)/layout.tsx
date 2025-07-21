import Sidebar from "@/components/shared/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d0f1a] text-white`}
      >
        <div className="relative min-h-screen w-full">
          <Sidebar />
          <main className="relative z-0 pl-16 transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}