"use client";

import { GlobalStoreProvider } from "@/lib/store/storeProvider";
import { AppInitializer } from "@/components/Initializers/AppInitializer/AppInitializer";
import { IInitialAppData } from "@/lib/utils/api.utils";
import { COLORS } from "@/lib/constants/globalConstants";
import ProgressBar from "next13-progressbar";
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
      <ProgressBar
        height={100}
        color={COLORS.PRIMARY}
        options={{ showSpinner: true }}
        showOnShallow
      />
      <MainLayout>{children}</MainLayout>
      <div id="backdrop-root"></div> {/* Used for modal backdrop */}
      <div id="overlay-root"></div> {/* Used for modal content */}
    </GlobalStoreProvider>
  );
};
