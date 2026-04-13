import { memo } from "react";
import { useReducedMotion } from "framer-motion";
import { PILLARS } from "../../data/portfolioData";
import PillarFolder from "./Folder";

function PillarsContainer() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mv-pillars-shell">
      <div className="mv-pillars-intro">
        <p className="mv-pillars-eyebrow">Identity dossier</p>
        <p className="mv-pillars-guide">
          Open each folder to inspect snapshots behind every pillar. Tap or press Enter/Space to pin one open while you scan.
        </p>
      </div>

      <div className="mv-pillars-grid">
        {PILLARS.map((pillar, index) => (
          <PillarFolder key={pillar.id} pillar={pillar} index={index} reducedMotion={reducedMotion} />
        ))}
      </div>
    </div>
  );
}

export default memo(PillarsContainer);
