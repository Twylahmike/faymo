import logoUrl from "@/assets/orion-logo.jpg";

// Brand mark for ORION, bundled so it renders in both preview and production.
const OrionLogo = ({ className }: { className?: string }) => (
  <img
    src={logoUrl}
    alt="Orion logo"
    loading="lazy"
    className={`object-contain ${className ?? ""}`}
  />
);

export default OrionLogo;
