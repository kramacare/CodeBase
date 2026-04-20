const Footer = () => (
  <footer id="contact" className="border-t border-border/70 bg-white/70 px-4 py-12 backdrop-blur md:px-8">
    <div className="section-container flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
      <div>
        <p className="font-display text-2xl font-semibold text-primary">Krama</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          A calmer clinic experience for patients and a cleaner queue workflow for staff.
        </p>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <p>support@krama.in</p>
        <p>&copy; {new Date().getFullYear()} Krama. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
