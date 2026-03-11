import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StacksProvider } from "../context/StacksContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taskify | Decentralized Bounty Board",
  description: "Create, assign, and complete tasks on the Stacks blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased`}>
        <StacksProvider>
          {children}
          <Toaster position="bottom-right" />
        </StacksProvider>
      </body>
    </html>
  );
}
