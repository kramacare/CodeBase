import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        
        {/* LOGO → HOME */}
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-primary hover:opacity-80 transition-all duration-200"
        >
          Krama
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
