import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
