import { motion } from "framer-motion";
import { SP } from "../../animations";

void motion;

export default function PillarCard({ card, index, isOpen, reducedMotion, totalCards = 3 }) {
  const centerIndex = (totalCards - 1) / 2;
  const relativeOffset = index - centerIndex;
  const relativeAbs = Math.abs(relativeOffset);

  const openX = relativeOffset * 110;
  const openY = -(112 + (1 - Math.min(1, relativeAbs)) * 34);
  const openRotate = relativeOffset * 18;

  const closedX = 0;
  const closedY = 24;
  const closedRotate = 0;
  const closedScale = 0.88;

  return (
    <motion.figure
      className="absolute left-1/2 top-3 h-20 w-32 -translate-x-1/2 overflow-hidden rounded-lg border border-white/60 bg-white/95 shadow-[0_10px_16px_-12px_rgba(0,0,0,0.55)] will-change-transform md:h-24 md:w-36"
      style={{ transformOrigin: "bottom center" }}
      initial={false}
      // Closed state shows a realistic stacked-peek, open state extracts cards into a fan.
      animate={isOpen ? {
        x: reducedMotion ? 0 : openX,
        y: reducedMotion ? 0 : openY,
        rotate: reducedMotion ? 0 : openRotate,
        scale: 1,
        opacity: 1,
        zIndex: 30 + index,
      } : {
        x: closedX,
        y: closedY,
        rotate: closedRotate,
        scale: closedScale,
        opacity: 0,
        zIndex: 1,
      }}
      transition={reducedMotion ? { duration: 0 } : {
        delay: isOpen ? index * 0.06 : 0,
        ...SP.snappy,
      }}
      whileHover={reducedMotion || !isOpen ? undefined : { y: openY - 6 }}
    >
      <img
        src={card.src}
        alt={card.alt}
        loading="lazy"
        className="h-[calc(100%-1.4rem)] w-full bg-[#111] object-contain object-center"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-center text-[10px] font-semibold tracking-wide text-white backdrop-blur-[2px] md:text-[11px]">
        {card.label}
      </figcaption>
    </motion.figure>
  );
}
