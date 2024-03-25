"use client";

import { GlobalStoreProvider } from "@/lib/store/storeProvider";
import { AppInitializer } from "@/components/Initializers/AppInitializer/AppInitializer";
import { IInitialAppData } from "@/lib/utils/api.utils";
import { COLORS } from "@/lib/constants/globalConstants";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import MainLayout from "../MainLayout/MainLayout";

/**
 * Wraps its children with global context providers necessary for the application.
 * This component is intended to centralize the application's global data management and UI enhancements.
 *
 * @returns {JSX.Element} A React component wrapped with global providers.
 */
export const Providers: React.FC<{
  children: React.ReactNode;
  initialData: IInitialAppData;
}> = ({ children, initialData }): JSX.Element => {
  return (
    <GlobalStoreProvider initialData={initialData}>
      <AppInitializer />
      <ProgressBar color={COLORS.PRIMARY} options={{ showSpinner: true }} />
      <MainLayout>{children}</MainLayout>
      <div id="backdrop-root"></div> {/* Used for modal backdrop */}
      <div id="overlay-root"></div> {/* Used for modal content */}
    </GlobalStoreProvider>
  );
};
