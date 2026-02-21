import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="section-container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* LOGO → HOME */}
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-[#00555A] hover:opacity-80 transition-all duration-200"
        >
          QueueSmart
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
