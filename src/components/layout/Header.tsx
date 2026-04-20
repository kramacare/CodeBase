import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="section-container px-4 md:px-8">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center">
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-primary">Krama</p>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Clinic flow, simplified</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-2">
            <Link to="/about" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              About
            </Link>
            <Link to="/clinic/login">
              <Button variant="outline" size="sm">
                Clinic Login
              </Button>
            </Link>
            <Link to="/patient/login">
              <Button size="sm">Patient Login</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
