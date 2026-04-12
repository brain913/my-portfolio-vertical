import { useReducedMotion } from "framer-motion";
import { PILLARS } from "../../data/portfolioData";
import PillarFolder from "./Folder";

export default function PillarsContainer() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-5 w-full rounded-3xl border border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-8 shadow-[0_30px_70px_-45px_rgba(0,0,0,0.95)] sm:px-6 md:px-8">
      <p className="mx-auto max-w-2xl text-center text-sm text-[var(--muted)]">
        Hover a folder to preview a pillar.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
        {PILLARS.map((pillar) => (
          <PillarFolder key={pillar.id} pillar={pillar} reducedMotion={reducedMotion} />
        ))}
      </div>
    </div>
  );
}
