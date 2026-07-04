import { Globe } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/BrandIcons";

const LINKS = [
  {
    href: "https://github.com/Gninho-silue",
    label: "GitHub",
    icon: GitHubIcon,
  },
  {
    href: "https://linkedin.com/in/gninema-silue",
    label: "LinkedIn",
    icon: LinkedInIcon,
  },
  {
    href: "https://silue-dev.vercel.app",
    label: "Portfolio",
    icon: Globe,
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-surface/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-brand-muted text-sm">
          Built by{" "}
          <span className="text-brand-text font-medium">
            Gninninmaguignon Silué
          </span>
        </p>

        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-white/5 transition-all duration-200 text-sm"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
