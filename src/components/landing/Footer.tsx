const Footer = () => (
  <footer id="contact" className="border-t border-border bg-background/70 px-4 py-12 backdrop-blur sm:px-6 md:px-8">
    <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
      <div>
        <p className="font-display text-2xl font-semibold text-primary">Krama</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          A calmer clinic experience for patients and a cleaner queue workflow for staff.
        </p>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <a href="mailto:krama.care@gmail.com" className="hover:text-primary transition-colors">
          krama.care@gmail.com
        </a>
        <p>&copy; {new Date().getFullYear()} Krama. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
