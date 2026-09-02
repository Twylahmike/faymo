import logoAsset from "@/assets/orion-logo.jpg.asset.json";

// Brand mark for ORION. Uses the official logo artwork served from the CDN.
const OrionLogo = ({ className }: { className?: string }) => (
  <img
    src={logoAsset.url}
    alt="Orion logo"
    loading="lazy"
    className={`object-contain ${className ?? ""}`}
  />
);

export default OrionLogo;
