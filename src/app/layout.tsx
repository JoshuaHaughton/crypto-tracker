import "../styles/globals.scss";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { StoreProvider } from "@/lib/store/storeProvider";
import { AppInitializer } from "../components/Initializers/AppInitializer/AppInitializer";
import { cookies } from "next/headers";
import MainLayout from "@/components/Layout/MainLayout/MainLayout";
import { getInitialData } from "@/lib/utils/dataFormat.utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Tracker",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.warn("LAYOUT RENDER");
  // We initialize the global store with the relative data we have
  const initialData = getInitialData(cookies());

  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider initialData={initialData}>
          <AppInitializer />
          <MainLayout>{children}</MainLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
