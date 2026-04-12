import { useState } from "react";
import { motion } from "framer-motion";
import { EA, SP } from "../../animations";
import PillarCard from "./Card";

void motion;

export default function PillarFolder({ pillar, reducedMotion }) {
  const [isHovered, setIsHovered] = useState(false);

  const isOpen = isHovered;

  const openHover = () => setIsHovered(true);
  const closeHover = () => setIsHovered(false);

  return (
    <motion.article
      className="group relative flex min-h-[16.5rem] flex-col items-center [perspective:1000px]"
      onHoverStart={openHover}
      onHoverEnd={closeHover}
    >
      <button
        type="button"
        aria-label={`Open ${pillar.title} folder`}
        aria-expanded={isOpen}
        className="relative mt-28 h-28 w-60 touch-manipulation overflow-visible rounded-2xl border border-[#d5d5d5] bg-[#e3e3e3] p-0 text-left shadow-[0_10px_18px_-14px_rgba(0,0,0,0.45)] outline-none transition-transform duration-150 ease-out active:scale-[0.97]"
      >
        {pillar.cards.map((card, index) => (
          <PillarCard
            key={card.src}
            card={card}
            index={index}
            isOpen={isOpen}
            reducedMotion={reducedMotion}
            totalCards={pillar.cards.length}
          />
        ))}

        <div className="pointer-events-none absolute -top-5 left-8 h-7 w-24 rounded-t-xl border border-b-0 border-[#d1d1d1] bg-[#ececec]" />

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[62%] rounded-b-2xl rounded-t-[14px] border-t border-[#efefef] bg-[#dcdcdc]"
          style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
          initial={false}
          // Front pocket acts as a mask: cards stay hidden in closed state and emerge on open.
          animate={isOpen ? {
            rotateX: reducedMotion ? 0 : -42,
            y: reducedMotion ? 0 : -5,
            opacity: 0.96,
          } : {
            rotateX: 0,
            y: 0,
            opacity: 1,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-9 rounded-t-2xl border-b border-[#cfcfcf] bg-[#e7e7e7]"
          style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
          initial={false}
          // Top flap opens first, then cards travel out in a fan.
          animate={isOpen ? {
            rotateX: reducedMotion ? 0 : -68,
            y: reducedMotion ? 0 : -4,
          } : {
            rotateX: 0,
            y: 0,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: EA.out }}
        />

        <div className="absolute inset-0 rounded-2xl border border-[#ececec]/70" />
        <motion.div
          className="pointer-events-none absolute inset-x-8 bottom-[32%] z-40 h-[2px] rounded-full bg-black/8"
          initial={false}
          animate={{ opacity: isOpen ? 0.04 : 0.16 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        />
      </button>

      <div className="mt-4 flex max-w-[15rem] flex-col items-center text-center">
        <h3 className="text-base font-semibold tracking-[0.08em] text-[var(--text)] uppercase">
          {pillar.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Hover to fan cards out
        </p>
      </div>
    </motion.article>
  );
}
