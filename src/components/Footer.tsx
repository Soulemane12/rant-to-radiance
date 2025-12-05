import { Mic } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-secondary text-secondary-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">One-Take Studio</span>
          </div>

          {/* Links removed per request */}
          <div className="flex items-center gap-8 text-sm" />

          {/* Copyright */}
          <p className="text-sm text-secondary-foreground/70">
            © 2024 One-Take Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
