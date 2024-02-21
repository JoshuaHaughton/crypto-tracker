import Navbar from "@/components/Layout/Navbar/Navbar";

/**
 * MainLayout component for wrapping the main content of the application.
 * Typically used to include elements like the Navbar across all pages.
 * @param children Child nodes to be rendered within the layout.
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="main-content">{children}</div>
    </>
  );
};

export default MainLayout;
