const Footer = () => (
  <footer
    id="contact"
    className="border-t border-border bg-secondary/40 px-4 py-12 md:px-8"
  >
    <div className="section-container flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
      
      {/* LEFT: BRAND */}
      <div>
        <p className="font-display text-lg font-semibold text-primary">
          QueueSmart
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          support@queuesmart.in
        </p>
      </div>

      {/* RIGHT: COPYRIGHT */}
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} QueueSmart. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
