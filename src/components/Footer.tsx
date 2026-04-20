const Footer = () => {
  return (
    <footer className="section-solid border-t border-border py-8">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <p className="font-display text-lg font-semibold text-foreground mb-1">Dees_ponytails</p>
        <p className="font-body text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dees_ponytails. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
