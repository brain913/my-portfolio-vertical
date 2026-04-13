import { useState } from "react";
import { motion } from "framer-motion";
import { EA } from "../../animations";
import PillarCard from "./Card";

void motion;

export default function PillarFolder({ pillar, index, reducedMotion }) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fanMode = pillar.id === "side-quest-operator" ? "left" : "center";

  const isOpen = isPinnedOpen || isHovered || isFocused;
  const proofId = `pillar-proof-${pillar.id}`;

  const togglePinned = () => {
    setIsPinnedOpen((prev) => !prev);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePinned();
    }

    if (event.key === "Escape") {
      setIsPinnedOpen(false);
      setIsHovered(false);
      setIsFocused(false);
      event.currentTarget.blur();
    }
  };

  const folderStateClassName = [
    "mv-pillar-folder",
    isOpen ? "is-open" : "",
    isPinnedOpen ? "is-pinned" : "",
  ].join(" ").trim();

  return (
    <motion.article
      className="group relative flex min-h-[20rem] w-full flex-col items-start [perspective:1200px]"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <button
        type="button"
        aria-label={`Toggle ${pillar.title} folder`}
        aria-expanded={isOpen}
        aria-pressed={isPinnedOpen}
        aria-describedby={proofId}
        onClick={togglePinned}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={`${folderStateClassName} relative mt-[4.25rem] h-36 w-full max-w-[17rem] touch-manipulation overflow-visible p-0 text-left outline-none active:scale-[0.97]`}
      >
        {pillar.cards.map((card, index) => (
          <PillarCard
            key={card.src}
            card={card}
            index={index}
            isOpen={isOpen}
            reducedMotion={reducedMotion}
            totalCards={pillar.cards.length}
            fanMode={fanMode}
            launchOrder={fanMode === "left" ? pillar.cards.length - 1 - index : index}
          />
        ))}

        <div className="mv-pillar-tab pointer-events-none absolute -top-[18px] right-10 h-[22px] w-[68px] rounded-t-[8px]" />

        <motion.div
          className="mv-pillar-pocket pointer-events-none absolute inset-x-0 top-0 z-20 h-[78%]"
          initial={false}
          animate={isOpen ? {
            rotateX: reducedMotion ? 0 : -46,
            y: reducedMotion ? 0 : -6,
            opacity: 0,
          } : {
            rotateX: 0,
            y: 0,
            opacity: 1,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div
          className="mv-pillar-flap pointer-events-none absolute inset-x-0 top-0 z-30 h-10"
          initial={false}
          animate={isOpen ? {
            rotateX: reducedMotion ? 0 : -72,
            y: reducedMotion ? 0 : -4,
          } : {
            rotateX: 0,
            y: 0,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.26, ease: EA.out }}
        />

        <div className="pointer-events-none absolute inset-x-7 bottom-[18%] z-10 flex flex-col gap-[8px]">
          <div className="mv-pillar-rule h-[1.5px] w-full rounded-full" />
          <div className="mv-pillar-rule h-[1.5px] w-full rounded-full" />
        </div>

        <div className="mv-pillar-edge pointer-events-none absolute inset-0" />
      </button>

      <div className={`mv-pillar-heading ${isOpen ? "is-open" : ""}`}>
        <span className="mv-pillar-index">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="mv-pillar-title">{pillar.title}</h3>
        <motion.span
          className="mv-pillar-state"
          initial={false}
          animate={reducedMotion ? {
            opacity: isPinnedOpen ? 1 : 0.6,
            scale: 1,
          } : {
            opacity: isPinnedOpen ? 1 : 0.6,
            scale: isPinnedOpen ? 1 : 0.94,
            y: isPinnedOpen ? 0 : 1,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: EA.out }}
        >
          {isPinnedOpen ? "Pinned" : "Preview"}
        </motion.span>
      </div>

      <p id={proofId} className="mv-pillar-proof">
        {pillar.proof}
      </p>
    </motion.article>
  );
}
