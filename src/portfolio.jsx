import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  IMG,
  TYPING,
  STATS,
  EXPERIENCE,
  EDUCATION,
  CERTIFICATES,
  REFERENCES,
  SKILLS,
  GALLERY,
  PROJECTS,
  CONNECT,
  STORY_TIMELINE,
} from "./data/portfolioData";
import { PillarsContainer } from "./components/pillars";
import "./index.css";

void motion;

const HERO_TITLES = [
  "Student",
  "Developer",
  "Builder",
  "Explorer",
  "Organiser",
];

const TYPE_SPEED = 95;
const DELETE_SPEED = 58;
const HOLD_TIME = 900;
const END_HOLD_TIME = 1100;

const CONNECT_LOGOS = {
  Discord: "https://cdn.simpleicons.org/discord",
  WhatsApp: "https://cdn.simpleicons.org/whatsapp",
  LinkedIn: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg",
  Email: "https://cdn.simpleicons.org/gmail",
  "Book a Call": "https://cdn.simpleicons.org/googlecalendar",
};

const TECH_STACK_GROUPS = [
  {
    title: "Core",
    note: "Primary tools I use most often.",
    names: ["JavaScript", "React", "Python", "Git", "GitHub", "Figma"],
  },
  {
    title: "Workflow",
    note: "Daily tooling that keeps projects moving.",
    names: ["VS Code", "Arc Browser", "ChatGPT", "Android Studio", "Kaggle", "Notion", "Raycast"],
  },
  {
    title: "Exploration",
    note: "Tools I use when I’m testing ideas or learning something new.",
    names: ["Machine Learning", "Shapr3D", "Chrome DevTools", "Google Dev Tools", "Firebase", "Framer", "JetBrains"],
  },
];

const VIDEO_LOADING_LINES = [
  "Loading project preview...",
  "Preparing the media clip...",
  "Fetching this project clip...",
  "Setting up the preview...",
];

const SCRAMBLE_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()?><";
const SCRAMBLE_DURATION = 1500;
const SCRAMBLE_GAP = 0.06;
const SCRAMBLE_TRAIL_LENGTH = 10;
const MAX_RENDER_ITEMS = 240;
const MAX_TICKER_ITEMS = 100;
const FALLBACK_LOCALE = "en-US";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function capItems(value, limit = MAX_RENDER_ITEMS) {
  const items = toArray(value);
  if (items.length <= limit) {
    return { items, total: items.length, truncated: false };
  }
  return {
    items: items.slice(0, limit),
    total: items.length,
    truncated: true,
  };
}

function safeText(value, fallback = "Unavailable") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function safeHref(value, fallback = "#") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function isExternalLink(href) {
  return /^https?:\/\//i.test(href) || href.startsWith("mailto:");
}

function createSeededRandom(seed) {
  let value = seed % 2147483647;

  return () => {
    value = (value * 48271) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createScrambleTrail(target, seed) {
  const random = createSeededRandom(seed + indexFromText(target));
  const trail = [];
  let previous = "";

  while (trail.length < SCRAMBLE_TRAIL_LENGTH) {
    const nextCharacter = SCRAMBLE_POOL[Math.floor(random() * SCRAMBLE_POOL.length)];

    if (nextCharacter === previous) {
      continue;
    }

    trail.push(nextCharacter);
    previous = nextCharacter;
  }

  return trail;
}

function indexFromText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

function logoForItem(item) {
  if (item.logo) {
    return item.logo;
  }
  if (!item.site) {
    return "";
  }
  try {
    const { hostname } = new URL(item.site);
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
  } catch {
    return "";
  }
}

function ScrambleLine({ text, reducedMotion, seed }) {
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  const characters = Array.from(text);
  const trails = useMemo(
    () => characters.map((character, index) => (
      character === " " ? [] : createScrambleTrail(character, seed * 97 + index * 31)
    )),
    [characters, seed],
  );

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    let frameId = 0;
    const startedAt = window.performance.now();

    const tick = (now) => {
      const nextProgress = Math.min(1, (now - startedAt) / SCRAMBLE_DURATION);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [reducedMotion]);

  return (
    <span className="mv-hero-scramble-line" aria-hidden="true">
      {characters.map((character, index) => {
        if (character === " ") {
          return (
            <span key={`${text}-${index}`} className="mv-hero-scramble-space">
              &nbsp;
            </span>
          );
        }

        const revealEnd = Math.min(1, 0.58 + index * SCRAMBLE_GAP + ((seed + index) % 3) * 0.02);
        const shouldReveal = progress >= revealEnd;
        const trail = trails[index];
        const trailIndex = Math.min(trail.length - 1, Math.floor(progress * (trail.length - 1)));

        return (
          <span key={`${text}-${index}`} className={`mv-hero-scramble-char ${shouldReveal ? "is-revealed" : ""}`}>
            {shouldReveal ? character : trail[trailIndex]}
          </span>
        );
      })}
    </span>
  );
}

function SectionNotice({ children, tone = "neutral" }) {
  return (
    <p className={`mv-section-note ${tone === "neutral" ? "" : `is-${tone}`}`.trim()} role="status" aria-live="polite">
      {children}
    </p>
  );
}

function SafeIcon({ src, alt = "", className = "", decorative = true }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return <span className={`mv-icon-fallback ${className}`.trim()} aria-hidden="true">•</span>;
  }

  return (
    <img
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? "true" : undefined}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function MediaCard({ item }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const label = safeText(item?.label, "Gallery item");
  const caption = safeText(item?.caption, "No caption available yet.");
  const rawSrc = typeof item?.src === "string" ? item.src : "";
  const normalizedSrc = rawSrc.startsWith("/gallery/")
    ? rawSrc.replace(/ /g, "%20")
    : rawSrc;
  const src = failed || !normalizedSrc ? IMG.profile : normalizedSrc;

  return (
    <figure className={`mv-media-card ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""}`}>
      {!loaded && !failed ? <div className="mv-media-loading" aria-hidden="true" /> : null}
      <img
        src={src}
        alt={label}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
      />
      <figcaption>
        <p dir="auto">{label}</p>
        <span dir="auto">{caption}</span>
        {failed ? <small>Original image unavailable. Showing fallback.</small> : null}
      </figcaption>
    </figure>
  );
}

function Section({
  id,
  title,
  children,
  reducedMotion,
  alwaysVisible = false,
  density = "regular",
  deferContent = true,
}) {
  const sectionRef = useRef(null);
  const isNearViewport = useInView(sectionRef, {
    once: true,
    margin: "250px 0px 250px 0px",
  });
  const shouldRenderContent = !deferContent || alwaysVisible || isNearViewport;

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`mv-section mv-section-${density} ${isNearViewport || alwaysVisible ? "is-visible" : ""}`}
    >
      <motion.div
        className="mv-wrap"
        initial={alwaysVisible || reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={alwaysVisible || reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.h2
          className="mv-section-heading"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.23, 1, 0.32, 1] }}
        >
          {title}
        </motion.h2>
        {shouldRenderContent ? children : null}
      </motion.div>
    </section>
  );
}

function LazyVideo({ src, label }) {
  const videoContainerRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoSlow, setVideoSlow] = useState(false);
  const safeLabel = safeText(label, "Project preview");
  const safeSrc = typeof src === "string" ? src : "";
  const loadingLine = useMemo(() => {
    const idx = indexFromText(safeLabel) % VIDEO_LOADING_LINES.length;
    return VIDEO_LOADING_LINES[idx];
  }, [safeLabel]);
  const shouldLoad = useInView(videoContainerRef, {
    once: true,
    margin: "350px 0px 350px 0px",
  });

  useEffect(() => {
    if (!shouldLoad || videoReady || videoFailed) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setVideoSlow(true);
    }, 8000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [shouldLoad, videoReady, videoFailed]);

  return (
    <div ref={videoContainerRef} className="mv-video-shell">
      {!safeSrc ? <p className="mv-media-note">Project preview unavailable for this item.</p> : null}
      {!shouldLoad && safeSrc ? <p className="mv-media-note">{loadingLine}</p> : null}
      <video
        src={shouldLoad && safeSrc ? safeSrc : undefined}
        autoPlay
        loop
        muted
        preload="none"
        playsInline
        aria-label={safeLabel}
        onCanPlay={() => {
          setVideoReady(true);
          setVideoSlow(false);
        }}
        onError={() => {
          setVideoFailed(true);
          setVideoSlow(false);
        }}
        onWaiting={() => {
          if (!videoReady) {
            setVideoSlow(true);
          }
        }}
      />
      {shouldLoad && safeSrc && !videoReady && !videoFailed ? <p className="mv-media-note">Loading preview. This may take a moment.</p> : null}
      {videoSlow && !videoReady && !videoFailed ? <p className="mv-media-note">Slow network detected. Video may take longer to start.</p> : null}
      {videoFailed ? <p className="mv-media-note">Preview unavailable right now. Try reloading if it stays blank.</p> : null}
    </div>
  );
}

export default function Portfolio() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 24,
    mass: 0.3,
  });
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorOpacity = useMotionValue(0);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem("mv-theme");
    return storedTheme
      || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  });
  const [finePointer, setFinePointer] = useState(false);
  const [heroText, setHeroText] = useState(reducedMotion ? HERO_TITLES[0] : "");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDeleting, setHeroDeleting] = useState(false);
  const [locale] = useState(() => (
    typeof navigator !== "undefined"
      ? safeText(navigator.language, FALLBACK_LOCALE)
      : FALLBACK_LOCALE
  ));
  const [isOffline, setIsOffline] = useState(
    () => (typeof window !== "undefined" ? !window.navigator.onLine : false),
  );
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  const featuredProjects = useMemo(
    () => capItems(toArray(EXPERIENCE).filter((item) => item && item.featured)),
    [],
  );
  const experienceEntries = useMemo(() => capItems(toArray(EXPERIENCE)), []);
  const educationEntries = useMemo(() => capItems(toArray(EDUCATION), 120), []);
  const certificateEntries = useMemo(() => capItems(toArray(CERTIFICATES), 160), []);
  const referenceEntries = useMemo(() => capItems(toArray(REFERENCES), 120), []);
  const skillEntries = useMemo(() => capItems(toArray(SKILLS), MAX_RENDER_ITEMS), []);
  const galleryEntries = useMemo(() => capItems(toArray(GALLERY), MAX_RENDER_ITEMS), []);
  const projectEntries = useMemo(() => capItems(toArray(PROJECTS), 120), []);
  const statEntries = useMemo(() => capItems(toArray(STATS), 120), []);
  const connectEntries = useMemo(() => capItems(toArray(CONNECT), 40), []);
  const storyEntries = useMemo(() => capItems(toArray(STORY_TIMELINE), 20), []);

  const heroQuickLinks = useMemo(
    () => capItems(
      connectEntries.items.filter(
        (item) => item && (item.label === "Email" || item.label === "LinkedIn"),
      ),
      6,
    ),
    [connectEntries],
  );
  const techStackGroups = useMemo(
    () => TECH_STACK_GROUPS.map((group) => ({
      ...group,
      items: skillEntries.items.filter((item) => item && group.names.includes(item.name)),
    })),
    [skillEntries],
  );
  const tickerSkills = useMemo(
    () => capItems(skillEntries.items, MAX_TICKER_ITEMS),
    [skillEntries],
  );
  const groupedGallery = useMemo(() => {
    const groups = new Map();
    galleryEntries.items.forEach((item, itemIndex) => {
      const bucketLabel = safeText(item?.label, `Collection ${itemIndex + 1}`);
      if (!groups.has(bucketLabel)) {
        groups.set(bucketLabel, []);
      }
      groups.get(bucketLabel).push(item);
    });

    return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
  }, [galleryEntries]);
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale || FALLBACK_LOCALE),
    [locale],
  );
  const pluralRules = useMemo(
    () => new Intl.PluralRules(locale || FALLBACK_LOCALE),
    [locale],
  );
  const formatCount = (count, singular, plural) => {
    const safeCount = Number.isFinite(count) && count >= 0 ? count : 0;
    const noun = pluralRules.select(safeCount) === "one" ? singular : plural;
    return `${numberFormatter.format(safeCount)} ${noun}`;
  };
  const contactContainer = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.34,
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: reducedMotion ? 0 : 0.08,
      },
    },
  };
  const contactItem = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0 : 0.26, ease: [0.23, 1, 0.32, 1] },
    },
  };
  const bottomContactLinks = [
    {
      label: "GitHub",
      handle: "@brain913",
      href: "https://github.com/brain913",
      site: "https://github.com",
    },
    {
      label: "Google Dev",
      handle: "g.dev/brain913",
      href: "https://g.dev/brain913",
      site: "https://g.dev",
    },
  ];
  const bookCallHref = safeHref("https://cal.com/brain913", "#contact");
  const bookCallExternal = isExternalLink(bookCallHref);
  const emailHref = safeHref("mailto:mvatsal680@gmail.com", "#contact");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("mv-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document !== "undefined" && !document.documentElement.lang) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.navigator) {
      return undefined;
    }

    const syncOfflineState = () => {
      setIsOffline(!window.navigator.onLine);
    };

    syncOfflineState();
    window.addEventListener("online", syncOfflineState);
    window.addEventListener("offline", syncOfflineState);

    return () => {
      window.removeEventListener("online", syncOfflineState);
      window.removeEventListener("offline", syncOfflineState);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") {
      return undefined;
    }

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const updatePointerMode = () => setFinePointer(finePointerQuery.matches);
    updatePointerMode();

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") {
        cursorOpacity.set(0);
        return;
      }

      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      cursorOpacity.set(1);
      setFinePointer(true);
    };

    const handlePointerLeave = () => {
      cursorOpacity.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    if (finePointerQuery.addEventListener) {
      finePointerQuery.addEventListener("change", updatePointerMode);
    } else {
      finePointerQuery.addListener(updatePointerMode);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);

      if (finePointerQuery.removeEventListener) {
        finePointerQuery.removeEventListener("change", updatePointerMode);
      } else {
        finePointerQuery.removeListener(updatePointerMode);
      }
    };
  }, [cursorOpacity, cursorX, cursorY, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const currentTitle = HERO_TITLES[heroIndex];
    const isLastTitle = heroIndex === HERO_TITLES.length - 1;
    let timerId;

    if (!heroDeleting && heroText === currentTitle) {
      timerId = window.setTimeout(() => {
        setHeroDeleting(true);
      }, isLastTitle ? END_HOLD_TIME : HOLD_TIME);
    } else if (heroDeleting && heroText === "") {
      timerId = window.setTimeout(() => {
        setHeroDeleting(false);
        setHeroIndex((value) => (value + 1) % HERO_TITLES.length);
      }, 220);
    } else {
      timerId = window.setTimeout(() => {
        setHeroText((value) => {
          const nextLength = heroDeleting ? value.length - 1 : value.length + 1;
          return currentTitle.slice(0, Math.max(0, nextLength));
        });
      }, heroDeleting ? DELETE_SPEED : TYPE_SPEED);
    }

    return () => window.clearTimeout(timerId);
  }, [heroDeleting, heroIndex, heroText, reducedMotion]);

  return (
    <main className="mv-root" lang={locale}>
      <a className="mv-skip-link" href="#projects">Skip to projects</a>
      <motion.div
        aria-hidden="true"
        className="mv-cursor-ring"
        style={{ x: cursorX, y: cursorY, opacity: reducedMotion || !finePointer ? 0 : cursorOpacity }}
      />
      <motion.div className="mv-progress" style={{ scaleX: progress }} />

      <header className="mv-header">
        <a href="#hero" className="mv-brand">vatsal.</a>
        <div className="mv-header-actions">
          <nav aria-label="Main navigation">
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <button
            type="button"
            className="mv-theme-toggle"
            onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            aria-pressed={theme === "light"}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="mv-theme-toggle-track" aria-hidden="true">
              <span className={`mv-theme-option ${theme === "dark" ? "is-active" : ""}`}>
                <span className="mv-theme-icon" aria-hidden="true">☾</span>
              </span>
              <span className={`mv-theme-option ${theme === "light" ? "is-active" : ""}`}>
                <span className="mv-theme-icon" aria-hidden="true">☼</span>
              </span>
              <span className="mv-theme-thumb" aria-hidden="true">
                {theme === "dark" ? "☾" : "☼"}
              </span>
            </span>
          </button>
        </div>
      </header>

      {isOffline ? (
        <p className="mv-status-banner" role="status" aria-live="polite">
          You are offline. External links and media may be unavailable until your connection is restored.
        </p>
      ) : null}

      <section id="hero" className="mv-hero">
        <div className="mv-wrap">
          <div className="mv-hero-top">
            <h1 className="mv-hero-signature" aria-label="Vatsal Mehta">
              <span className="mv-hero-scramble" aria-hidden="true">
                <ScrambleLine text="Vatsal" reducedMotion={reducedMotion} seed={1} />
                <ScrambleLine text="Mehta" reducedMotion={reducedMotion} seed={2} />
              </span>
              <span className="mv-hero-portrait-wrap" aria-hidden="true">
                {profileImageFailed ? (
                  <span className="mv-hero-portrait-fallback">VM</span>
                ) : (
                  <img
                    src={IMG.profile}
                    alt=""
                    className="mv-hero-portrait"
                    loading="eager"
                    onError={() => setProfileImageFailed(true)}
                  />
                )}
              </span>
            </h1>
            <span className="mv-scroll-hint">Scroll</span>
          </div>
          <p className="mv-hero-sub">Omnia possibilia credentibus</p>
          <p className="mv-hero-kicker">
            I am a{" "}
            <span className="mv-hero-typing">
              {heroText}
              {!reducedMotion && <span className="mv-hero-caret" aria-hidden="true" />}
            </span>
          </p>
          <p className="mv-copy">
            Year 10 at BBHS. I organise hackathons, compete in robotics, and
            explore technology and finance. I care about doing things properly and adding real value.
          </p>
          {heroQuickLinks.items.length ? (
            <div className="mv-hero-cta">
              {heroQuickLinks.items.map((item) => {
                const href = safeHref(item?.href, "#contact");
                const external = isExternalLink(href);

                return (
                  <a key={safeText(item?.label, href)} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
                    <SafeIcon src={logoForItem({ site: href, logo: CONNECT_LOGOS[item?.label] })} />
                    <span dir="auto">{safeText(item?.label, "Contact")}</span>
                  </a>
                );
              })}
            </div>
          ) : (
            <SectionNotice>No quick links are available right now.</SectionNotice>
          )}
          {heroQuickLinks.truncated ? (
            <SectionNotice tone="warning">
              Showing the first {numberFormatter.format(heroQuickLinks.items.length)} links to keep this section fast.
            </SectionNotice>
          ) : null}
        </div>
      </section>

      <Section id="projects" title="Projects" reducedMotion={reducedMotion} density="feature">
        <div className="mv-project-list">
          {featuredProjects.items.length ? featuredProjects.items.map((item, index) => {
            const achievements = capItems(toArray(item?.achievements), 14);

            return (
              <details key={`${safeText(item?.company, "org")}-${safeText(item?.period, String(index))}`} className="mv-project" open={index === 0}>
                <summary>
                  <span className="mv-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mv-title" dir="auto">{safeText(item?.role, "Untitled Role")} - {safeText(item?.company, "Unknown")}</span>
                  <span className="mv-plus">+</span>
                </summary>
                <div className="mv-project-content">
                  <p dir="auto">{safeText(item?.summary, "Project summary unavailable.")}</p>
                  {achievements.items.length ? (
                    <ul>
                      {achievements.items.map((achievement, achievementIndex) => (
                        <li key={`${safeText(item?.company, "org")}-${achievementIndex}`} dir="auto">{safeText(achievement, "Achievement unavailable")}</li>
                      ))}
                    </ul>
                  ) : (
                    <SectionNotice>No achievement bullets available for this project yet.</SectionNotice>
                  )}
                  <div className="mv-meta-row">
                    <span dir="auto">{safeText(item?.impact, "Impact pending")}</span>
                    <span dir="auto">{safeText(item?.scope, "Scope pending")}</span>
                    <span dir="auto">{safeText(item?.period, "Date pending")}</span>
                  </div>
                </div>
              </details>
            );
          }) : (
            <SectionNotice>No featured projects available yet.</SectionNotice>
          )}
        </div>
        {featuredProjects.truncated ? (
          <SectionNotice tone="warning">
            Showing the first {numberFormatter.format(featuredProjects.items.length)} of {numberFormatter.format(featuredProjects.total)} featured projects.
          </SectionNotice>
        ) : null}
      </Section>

      <Section id="about" title="About" reducedMotion={reducedMotion} density="feature">
        <blockquote>
          I build systems that make sense of data and opportunities that most people skip.
        </blockquote>
        <p className="mv-copy">
          I am currently {toArray(TYPING).join(" ")} Growth mindset, adaptability, and a commitment
          to achieve my goals while adding value through dedication and results.
        </p>
        <p className="mv-copy">
          Most of my work is practical: events, operations, robotics, and communication.
          I focus on showing up consistently, handling pressure well, and finishing what I start.
        </p>

        {tickerSkills.items.length ? (
          <div className="mv-ticker" aria-hidden="true">
            <div className="mv-ticker-track">
              {tickerSkills.items.concat(tickerSkills.items).map((item, idx) => (
                <span key={`${safeText(item?.name, "skill")}-${idx}`} dir="auto">{safeText(item?.name, "Skill")}</span>
              ))}
            </div>
          </div>
        ) : (
          <SectionNotice>Skills will appear here once available.</SectionNotice>
        )}
        {tickerSkills.truncated ? (
          <SectionNotice tone="warning">
            Ticker limited to {numberFormatter.format(tickerSkills.items.length)} items for smooth performance.
          </SectionNotice>
        ) : null}
      </Section>

      <Section id="story" title="my story" reducedMotion={reducedMotion} density="feature" deferContent={false}>
        <p className="mv-story-kicker">trust the process</p>
        <div className="mv-story-timeline" role="list" aria-label="Timeline from now to the start">
          {storyEntries.items.length ? storyEntries.items.map((phase, phaseIndex) => {
            const milestones = capItems(toArray(phase?.items), 14);

            return (
              <article
                key={`${safeText(phase?.period, String(phaseIndex))}-${safeText(phase?.title, "phase")}`}
                className={`mv-story-event ${phaseIndex % 2 === 0 ? "is-right" : "is-left"}`}
                role="listitem"
              >
                <span className="mv-story-node" aria-hidden="true" />
                <div className="mv-story-panel">
                  <p className="mv-story-period" dir="auto">{safeText(phase?.period, "Date pending")}</p>
                  <h3 className="mv-story-title" dir="auto">{safeText(phase?.title, "Milestone")}</h3>
                  {milestones.items.length ? (
                    <ul className="mv-story-list">
                      {milestones.items.map((entry, entryIndex) => (
                        <li key={`${safeText(phase?.period, "period")}-${entryIndex}`} dir="auto">{safeText(entry, "Milestone pending")}</li>
                      ))}
                    </ul>
                  ) : (
                    <SectionNotice>No milestones listed for this phase yet.</SectionNotice>
                  )}
                </div>
              </article>
            );
          }) : <SectionNotice>No timeline milestones available yet.</SectionNotice>}
        </div>
        {storyEntries.truncated ? (
          <SectionNotice tone="warning">
            Showing {numberFormatter.format(storyEntries.items.length)} of {numberFormatter.format(storyEntries.total)} timeline phases.
          </SectionNotice>
        ) : null}
      </Section>

      <Section id="pillars" title="4 pillars of vatsal" reducedMotion={reducedMotion} density="feature">
        <PillarsContainer />
      </Section>

      <Section id="experience" title="Experience" reducedMotion={reducedMotion} density="regular">
        <div className="mv-grid two">
          {experienceEntries.items.length ? experienceEntries.items.map((item, itemIndex) => (
            <article key={`${safeText(item?.company, "org")}-${safeText(item?.period, String(itemIndex))}`} className="mv-card">
              <h3 dir="auto">{safeText(item?.role, "Role unavailable")}</h3>
              <p className="mv-muted" dir="auto">{safeText(item?.company, "Unknown")} - {safeText(item?.location, "Location pending")}</p>
              <p dir="auto">{safeText(item?.summary, "Summary unavailable.")}</p>
              <div className="mv-tags">
                {toArray(item?.tags).length ? toArray(item.tags).map((tag, tagIndex) => (
                  <span key={`${safeText(item?.company, "org")}-${tagIndex}`} dir="auto">{safeText(tag, "Tag")}</span>
                )) : <span>No tags</span>}
              </div>
            </article>
          )) : <SectionNotice>No experience entries available yet.</SectionNotice>}
        </div>
        {experienceEntries.truncated ? (
          <SectionNotice tone="warning">
            Showing {numberFormatter.format(experienceEntries.items.length)} of {numberFormatter.format(experienceEntries.total)} entries.
          </SectionNotice>
        ) : null}
      </Section>

      <Section id="education" title="Education and Certificates" reducedMotion={reducedMotion} density="compact">
        <div className="mv-grid two">
          <article className="mv-card">
            <h3>Education</h3>
            {educationEntries.items.length ? educationEntries.items.map((item, itemIndex) => (
              <div className="mv-line mv-line-row" key={`${safeText(item?.school, "school")}-${safeText(item?.period, String(itemIndex))}`}>
                <p dir="auto">{safeText(item?.school, "School unavailable")}</p>
                <span dir="auto">{safeText(item?.period, "Date pending")}</span>
              </div>
            )) : <SectionNotice>No education records available yet.</SectionNotice>}
          </article>
          <article className="mv-card">
            <h3>Certificates</h3>
            {certificateEntries.items.length ? certificateEntries.items.map((item, itemIndex) => (
              <div className="mv-line mv-line-row" key={`${safeText(item?.name, "certificate")}-${safeText(item?.year, String(itemIndex))}`}>
                <p dir="auto">{safeText(item?.name, "Certificate unavailable")}</p>
                <span dir="auto">{safeText(item?.year, "Date pending")}</span>
              </div>
            )) : <SectionNotice>No certificates published yet.</SectionNotice>}
          </article>
        </div>
      </Section>

      <Section id="references" title="References" reducedMotion={reducedMotion} density="compact">
        <div className="mv-grid two">
          {referenceEntries.items.length ? referenceEntries.items.map((item, itemIndex) => (
            <article className="mv-card" key={`${safeText(item?.name, "reference")}-${itemIndex}`}>
              <h3 dir="auto">{safeText(item?.name, "Reference")}</h3>
              <p className="mv-muted" dir="auto">{safeText(item?.short, "Short reference unavailable.")}</p>
              <p dir="auto">{safeText(item?.text, "Reference text unavailable.")}</p>
            </article>
          )) : <SectionNotice>No references shared yet.</SectionNotice>}
        </div>
      </Section>

      <Section id="stack" title="Tech Stack" reducedMotion={reducedMotion} density="compact">
        <div className="mv-stack-groups">
          {techStackGroups.some((group) => group.items.length) ? techStackGroups.map((group, groupIndex) => (
            <details className="mv-stack-group" key={group.title} open={groupIndex === 0}>
              <summary>
                <span className="mv-stack-title" dir="auto">{safeText(group.title, "Group")}</span>
                <span className="mv-stack-note" dir="auto">{safeText(group.note, "")}</span>
                <span className="mv-stack-count">{formatCount(group.items.length, "item", "items")}</span>
              </summary>
              <div className="mv-skill-grid mv-skill-grid-grouped">
                {group.items.length ? group.items.map((item, itemIndex) => {
                  const href = safeHref(item?.site, "#stack");
                  const external = isExternalLink(href);

                  return (
                    <a className="mv-skill" key={`${safeText(item?.name, "skill")}-${itemIndex}`} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
                      <SafeIcon src={logoForItem(item)} alt={`${safeText(item?.name, "Skill")} logo`} decorative={false} />
                      <span dir="auto">{safeText(item?.name, "Skill")}</span>
                    </a>
                  );
                }) : <SectionNotice>No tools listed in this group yet.</SectionNotice>}
              </div>
            </details>
          )) : <SectionNotice>No tech stack entries available yet.</SectionNotice>}
        </div>
        {skillEntries.truncated ? (
          <SectionNotice tone="warning">
            Showing {numberFormatter.format(skillEntries.items.length)} of {numberFormatter.format(skillEntries.total)} tools for performance.
          </SectionNotice>
        ) : null}
      </Section>

      <Section id="gallery" title="Gallery" reducedMotion={reducedMotion} density="feature">
        <div className="mv-gallery-groups">
          {groupedGallery.length ? groupedGallery.map((group, groupIndex) => (
            <details className="mv-gallery-group" key={group.label} open={groupIndex === 0}>
              <summary>
                <span className="mv-gallery-title" dir="auto">{safeText(group.label, "Gallery")}</span>
                <span className="mv-gallery-count">{formatCount(group.items.length, "photo", "photos")}</span>
              </summary>
              <div className="mv-gallery">
                {group.items.length ? group.items.map((item, idx) => (
                  <MediaCard item={item} key={`${safeText(item?.label, "media")}-${idx}`} />
                )) : <SectionNotice>This gallery group is empty.</SectionNotice>}
              </div>
            </details>
          )) : <SectionNotice>No gallery media available yet.</SectionNotice>}
        </div>
        {galleryEntries.truncated ? (
          <SectionNotice tone="warning">
            Showing {numberFormatter.format(galleryEntries.items.length)} of {numberFormatter.format(galleryEntries.total)} media entries.
          </SectionNotice>
        ) : null}
      </Section>

      <Section id="media" title="Project Media" reducedMotion={reducedMotion} density="compact">
        <div className="mv-grid two">
          {projectEntries.items.length ? projectEntries.items.map((item, itemIndex) => (
            <article className="mv-card" key={`${safeText(item?.label, "project")}-${itemIndex}`}>
              <h3 dir="auto">{safeText(item?.label, "Project")}</h3>
              <p dir="auto">{safeText(item?.caption, "No project media caption available.")}</p>
              <LazyVideo src={item?.src} label={item?.label} />
            </article>
          )) : <SectionNotice>No project media available yet.</SectionNotice>}
        </div>
      </Section>

      <Section id="activity" title="Activity" reducedMotion={reducedMotion} density="compact">
        <div className="mv-grid two">
          {statEntries.items.length ? statEntries.items.map((item, itemIndex) => (
            <article className="mv-card" key={`${safeText(item?.label, "stat")}-${itemIndex}`}>
              <h3 dir="auto">{safeText(item?.label, "Activity")}</h3>
              <p className="mv-muted" dir="auto">{safeText(item?.sub, "")}</p>
              <p dir="auto">{safeText(item?.val, "-")}</p>
            </article>
          )) : <SectionNotice>No activity metrics available yet.</SectionNotice>}
        </div>
      </Section>

      <section id="contact" className="mv-contact-band">
        <motion.div
          className="mv-contact-noise"
          aria-hidden="true"
          animate={reducedMotion ? {} : { opacity: [0.35, 0.55, 0.35] }}
          transition={reducedMotion ? {} : { duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="mv-contact-shell"
          variants={contactContainer}
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.55 }}
        >
          <motion.p className="mv-contact-kicker" variants={contactItem}>Contact</motion.p>
          <motion.h3 className="mv-contact-ask" variants={contactItem}>
            <span>Open to Student Tech</span>
            <span>Roles and Collaborations</span>
          </motion.h3>
          <motion.p className="mv-contact-guide" variants={contactItem}>
            Book a call for project chats. Email is better for quick follow-ups and introductions.
          </motion.p>

          <motion.a
            className="mv-contact-cta"
            variants={contactItem}
            href={bookCallHref}
            target={bookCallExternal ? "_blank" : undefined}
            rel={bookCallExternal ? "noreferrer" : undefined}
            whileHover={reducedMotion ? {} : { y: -2 }}
            whileTap={reducedMotion ? {} : { scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <span>Book a Call</span>
          </motion.a>

          <motion.a
            className="mv-contact-email"
            variants={contactItem}
            href={emailHref}
            whileHover={reducedMotion ? {} : { x: 4 }}
            whileTap={reducedMotion ? {} : { scale: 0.99 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            mvatsal680@gmail.com
          </motion.a>

          <motion.div className="mv-contact-pills" variants={contactItem}>
            {bottomContactLinks.map((item) => {
              const href = safeHref(item?.href, "#contact");
              const external = isExternalLink(href);
              const iconSite = safeHref(item?.site, href);

              return (
                <motion.a
                  key={safeText(item?.label, href)}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  whileHover={reducedMotion ? {} : { y: -2 }}
                  whileTap={reducedMotion ? {} : { scale: 0.97 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <SafeIcon src={logoForItem({ site: iconSite })} />
                  <span className="mv-contact-pill-label" dir="auto">{safeText(item?.label, "Link")}</span>
                  <span className="mv-contact-pill-handle" dir="auto">{safeText(item?.handle, "")}</span>
                </motion.a>
              );
            })}
          </motion.div>

          <motion.p className="mv-footnote" variants={contactItem}>
            Built with React and Motion. © 2026 Vatsal Mehta
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}
