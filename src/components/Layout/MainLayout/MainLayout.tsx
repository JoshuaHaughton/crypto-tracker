"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar/Navbar";
// import Footer from "@/components/Layout/Footer/Footer";

/**
 * Props definition for the MainLayout component.
 */
interface MainLayoutProps {
  children: React.ReactNode; // Children elements to render within the layout
}

/**
 * The MainLayout component serves as a higher-order component that wraps around the main content of a page.
 * It includes a Navbar at the top and a Footer at the bottom, providing a consistent structure and layout for all pages.
 *
 * @param {MainLayoutProps} props - The props containing the child components to be rendered.
 * @returns {React.FC} The React functional component rendering the main layout structure.
 *
 * @example
 * <MainLayout>
 *   <p>This is a child component</p>
 * </MainLayout>
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      {/* <Footer /> */}
    </>
  );
};

export default MainLayout;
