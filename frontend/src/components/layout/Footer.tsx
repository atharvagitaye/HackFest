import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card mt-16">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">SurplusSync</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Revolutionizing food redistribution with AI. Our mission is to eliminate food waste and ensure nobody goes hungry.
          </p>
        </div>
        {[
          { title: "Platform", links: ["Overview", "Impact Data", "Case Studies", "API Docs"] },
          { title: "Organization", links: ["About Us", "Careers", "Legal", "Partners"] },
          { title: "Social", links: ["LinkedIn", "Twitter", "Instagram", "Blog"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-sm text-foreground mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2026 SurplusSync Technologies Inc. All rights reserved.</p>
        <p className="text-xs text-primary font-medium">● Certified B Corp</p>
      </div>
    </div>
  </footer>
);

export default Footer;
