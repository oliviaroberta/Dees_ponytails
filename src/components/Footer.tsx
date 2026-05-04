import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="section-solid border-t border-border py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="mb-1 font-display text-lg font-semibold text-foreground">Dees_ponytails</p>
            <p className="font-body text-xs text-muted-foreground">
              Premium ponytail extensions for elegant everyday styling.
            </p>
          </div>

          <div>
            <p className="mb-2 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Quick Links
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
              <Link to="/" className="font-body text-sm text-foreground/80 transition-colors hover:text-foreground">
                Home
              </Link>
              <Link to="/shop" className="font-body text-sm text-foreground/80 transition-colors hover:text-foreground">
                Shop
              </Link>
              <Link to="/about" className="font-body text-sm text-foreground/80 transition-colors hover:text-foreground">
                About
              </Link>
              <Link to="/contact" className="font-body text-sm text-foreground/80 transition-colors hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-body text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dees_ponytails. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
