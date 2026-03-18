import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white">
      {/* Top strip - dark gray */}
      <div className="h-1 bg-[#36383A]" aria-hidden />

      {/* Main header section */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#00555A]">
              Krama
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/patient/login"
              className="rounded-lg bg-[#00555A] px-6 py-2 text-white font-medium hover:opacity-90 transition-colors"
            >
              Patient Login
            </Link>
            <Link
              to="/clinic/login"
              className="rounded-lg border border-[#E0E0E0] bg-white px-6 py-2 text-[#36383A] font-medium hover:bg-gray-50 transition-colors"
            >
              Clinic Login
            </Link>
            <Link
              to="/about"
              className="text-[#36383A] hover:text-[#00555A] font-medium transition-colors px-4 py-2"
            >
              About Us
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle mobile menu"
            title="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom strip - dark teal */}
      <div className="h-1 bg-[#00555A]" aria-hidden />
    </header>
  );
};

export default Header;
