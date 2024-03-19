import "../styles/globals.scss";
import { Roboto, Inter, Rubik } from "next/font/google";
import { Metadata } from "next";
import { GlobalStoreProvider } from "@/lib/store/storeProvider";
import { AppInitializer } from "../components/Initializers/AppInitializer/AppInitializer";
import { cookies } from "next/headers";
import MainLayout from "@/components/Layout/MainLayout/MainLayout";
import { getInitialData } from "@/lib/utils/api.utils";

const heebo = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const rubik = Rubik({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
  const initialAppData = getInitialData(cookies());

  return (
    <html lang="en">
      <body>
        <GlobalStoreProvider initialData={initialAppData}>
          <AppInitializer />
          <MainLayout>{children}</MainLayout>
          <div id="backdrop-root"></div> {/* Used for modal backdrop */}
          <div id="overlay-root"></div> {/* Used for modal content */}
        </GlobalStoreProvider>
      </body>
    </html>
  );
}
