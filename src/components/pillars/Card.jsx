import { useState } from "react";
import { motion } from "framer-motion";
import { EA, SP } from "../../animations";

void motion;

export default function PillarCard({ card, index, isOpen, reducedMotion, totalCards = 3, fanMode = "center", launchOrder = index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const centerIndex = (totalCards - 1) / 2;
  const relativeOffset = index - centerIndex;
  const relativeAbs = Math.abs(relativeOffset);
  const fanBiasX = fanMode === "left" ? -120 : 0;

  // Open: fan spread above the folder
  const openX = relativeOffset * 110 + fanBiasX;
  const openY = -(138 + (1 - Math.min(1, relativeAbs)) * 28);
  const openRotate = relativeOffset * 16;

  // Closed: sit flat inside the glass zone — zero spread to prevent any overflow
  const closedX = 0;
  const closedY = -6;
  const closedRotate = 0;
  const openDepthShadow = "0 18px 34px -8px rgba(0,0,0,0.66), 0 0 0 0.5px rgba(0,0,0,0.07)";

  return (
    <motion.figure
      className="absolute left-1/2 top-2 -translate-x-1/2 will-change-transform"
      style={{
        transformOrigin: "bottom center",
        width: "136px",
        height: "110px",
        background: "#fff",
        borderRadius: "10px",
        padding: "5px 5px 14px 5px",
        boxShadow: isOpen
          ? openDepthShadow
          : "none",
      }}
      initial={false}
      animate={isOpen ? {
        x: reducedMotion ? 0 : [closedX, openX * 0.58, openX],
        y: reducedMotion ? 0 : [closedY, openY + 20, openY],
        rotate: reducedMotion ? 0 : [closedRotate, openRotate * 0.66, openRotate],
        scale: reducedMotion ? 1 : [0.82, 1.06, 1],
        opacity: 1,
        zIndex: 30 + index,
        boxShadow: openDepthShadow,
      } : {
        x: reducedMotion ? 0 : closedX,
        y: reducedMotion ? 0 : closedY,
        rotate: reducedMotion ? 0 : closedRotate,
        scale: 0.82,
        opacity: 0.9,
        zIndex: 1 + index,
        boxShadow: "none",
      }}
      transition={reducedMotion ? { duration: 0 } : {
        delay: isOpen ? launchOrder * 0.055 : 0,
        duration: isOpen ? 0.58 : 0.3,
        times: isOpen ? [0, 0.57, 1] : undefined,
        ease: isOpen ? EA.out : EA.in,
      }}
      whileHover={reducedMotion || !isOpen ? undefined : {
        y: openY - 6,
        rotate: openRotate + (relativeOffset >= 0 ? 1.5 : -1.5),
        transition: SP.gentle,
      }}
    >
      {imageFailed ? (
        <div
          className="flex h-[calc(100%-1.25rem)] w-full items-center justify-center rounded-[6px] px-2 text-center"
          style={{ background: "#2a2a2a" }}
          aria-label={`${card.label} image unavailable`}
        >
          <span className="text-[0.66rem] font-semibold tracking-[0.08em] text-[#f2f2f2] uppercase">
            Image unavailable
          </span>
        </div>
      ) : (
        <img
          src={card.src}
          alt={card.alt}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-[calc(100%-1.25rem)] w-full rounded-[6px] object-cover object-center"
          style={{ background: "#222", display: "block" }}
        />
      )}
      <figcaption className="mt-[3px] text-center text-[11px] font-semibold tracking-[0.08em] text-[#4d4d4d]">
        {card.label}
      </figcaption>
    </motion.figure>
  );
}
