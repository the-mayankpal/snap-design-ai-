import { COLOR } from "@/components/brand/palette";

/**
 * SVG illustrations for the three "How it works" cards. Each draws the step
 * as it happens, in the brand palette. Motion is plain CSS on SVG elements
 * (`.hiw-*` in globals.css) and stops under reduced motion.
 */

const ORANGE = COLOR.accent;
const PEACH = COLOR.accentTint;
const INK = COLOR.inkSketch;

type ArtProps = { className?: string };

/** A flat pill on a dark card: faint solid fill, 1px hairline. No gradient. */
function FlatPill({ x, y, w, h, r }: { x: number; y: number; w: number; h: number; r: number }) {
  return <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={r} fill="#fff" fillOpacity={0.05} stroke="#fff" strokeOpacity={0.14} />;
}

/**
 * Describe — the sentence types in, snapdesign underlines what matters, and
 * a brief assembles from it: format, mood, palette, type — then the real
 * design it describes: the cover of the Ember & Bean brand deck, whose actual
 * brand colours (Roast Brown, Caramel Glow, Oat Cream) and typeface (DM Sans)
 * are what the brief lists.
 *
 * The prompt is IBM Plex Mono 11.5px: 0.6em = 6.9px a character, so 33
 * characters are 227.7px and every reveal step is one whole letter.
 */
export function DescribeArt({ className }: ArtProps) {
  const prompt = "a brand deck for a coffee roaster";
  const CH = 6.9;
  const X = 24;
  // The deck's own brand colours, from its Color page.
  const PALETTE = ["#3B2418", "#D9822B", "#F3E6D3"];
  // The deck cover sits at (14, 12), 476 × 246 in the 992 × 1586 deck image.
  // Scaled so that panel fills a 90-wide slot at (186, 110).
  const CX = 186;
  const CY = 110;
  const K = 90 / 476;

  const rows = [
    { y: 100, label: "FORMAT" },
    { y: 122, label: "MOOD" },
    { y: 144, label: "PALETTE" },
    { y: 166, label: "TYPE" },
  ];

  return (
    <svg viewBox="0 0 300 190" fill="none" aria-hidden overflow="visible" className={className}>
      <defs>
        <clipPath id="hiw-type-clip">
          <rect className="hiw-type" x={X} y={18} width={33 * CH} height={22} />
        </clipPath>
        <clipPath id="ds-cover">
          <rect x={CX} y={CY} width={90} height={246 * K} rx={5} />
        </clipPath>
      </defs>

      {/* The message */}
      <rect x={10.5} y={8.5} width={279} height={40} rx={13} fill="#1E1714" stroke="#fff" strokeOpacity={0.14} />
      <text x={X} y={32} fontSize={11.5} fill="#fff" fillOpacity={0.94} fontFamily="var(--font-plex-mono), monospace" clipPath="url(#hiw-type-clip)">
        {prompt}
      </text>
      <rect className="hiw-caret" x={X} y={21} width={1.8} height={14} rx={0.9} fill={ORANGE} />
      {/* What it picked out: "brand deck" and "coffee roaster". */}
      <rect className="ds-mark" x={X + 2 * CH} y={37} width={10 * CH} height={1.6} rx={0.8} fill={ORANGE} />
      <rect className="ds-mark ds-mark-2" x={X + 19 * CH} y={37} width={14 * CH} height={1.6} rx={0.8} fill={ORANGE} />

      {/* The brief */}
      <rect x={10.5} y={60.5} width={279} height={121} rx={13} stroke="#fff" strokeOpacity={0.1} />
      <text x={X} y={79} fontSize={7.5} fontWeight={600} letterSpacing={1.2} fill="#fff" fillOpacity={0.45} fontFamily="var(--font-plex-mono), monospace">
        BRIEF
      </text>
      <g className="ds-reading">
        <path d="M200.5 72.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill={ORANGE} />
        <text x={207} y={79} fontSize={7.5} fill="#fff" fillOpacity={0.55} fontFamily="var(--font-inter), sans-serif">
          From your words
        </text>
      </g>

      {rows.map(({ y, label }, index) => (
        <g key={label} className={`ds-row ds-row-${index + 1}`}>
          <path d={`M${X} ${y - 13.5}h${index === 0 ? 0 : 150}`} stroke="#fff" strokeOpacity={0.07} />
          <text x={X} y={y} fontSize={7} fontWeight={600} letterSpacing={1} fill="#fff" fillOpacity={0.38} fontFamily="var(--font-plex-mono), monospace">
            {label}
          </text>
        </g>
      ))}

      {/* Values */}
      <g className="ds-row ds-row-1">
        <rect x={82} y={93.5} width={9} height={5.5} rx={1} stroke={PEACH} strokeWidth={1.1} />
        <text x={96} y={100} fontSize={9.5} fill="#fff" fillOpacity={0.88} fontFamily="var(--font-inter), sans-serif">
          Brand deck · 16:9
        </text>
      </g>
      <text className="ds-row ds-row-2" x={82} y={122} fontSize={9.5} fill="#fff" fillOpacity={0.88} fontFamily="var(--font-inter), sans-serif">
        Cozy, crafted
      </text>
      <g className="ds-row ds-row-3">
        {PALETTE.map((fill, index) => (
          <circle key={fill} cx={87 + index * 14} cy={141} r={5} fill={fill} stroke="#fff" strokeOpacity={0.2} />
        ))}
      </g>
      <g className="ds-row ds-row-4">
        <text x={82} y={167} fontSize={13} fontWeight={800} letterSpacing={-0.3} fill="#fff" fontFamily="var(--font-inter), sans-serif">
          Aa
        </text>
        <text x={102} y={166} fontSize={9} fill="#fff" fillOpacity={0.6} fontFamily="var(--font-inter), sans-serif">
          DM Sans
        </text>
      </g>

      {/* The design that brief describes — the real Ember & Bean cover. */}
      <g className="ds-poster">
        <image
          href="/showcase/slides-ember-bean-brand-guideline.webp"
          x={CX - 14 * K}
          y={CY - 12 * K}
          width={992 * K}
          height={1586 * K}
          preserveAspectRatio="none"
          clipPath="url(#ds-cover)"
        />
        <rect x={CX + 0.5} y={CY + 0.5} width={89} height={246 * K - 1} rx={4.5} stroke="#fff" strokeOpacity={0.2} />
      </g>
    </svg>
  );
}

const VARIATIONS = [
  "/showcase/website-vestra-streetwear.webp",
  "/showcase/website-virella-fashion-store.webp",
  "/showcase/website-solvena-clothing.webp",
];

/**
 * Design — the canvas at work: a real landing page with its headline
 * selected, and three variations beside it. The picked variation (orange
 * ring) steps 1 → 2 → 3 and the canvas cross-fades to match (`.dv-*`).
 */
export function DesignArt({ className }: ArtProps) {
  const BLUE = COLOR.blue;
  // Main artboard: 196 × 110 (16:9) at (18, 50). Thumbs: 56 × 31.5, 38 apart.
  const thumbY = [56, 94, 132];

  return (
    <svg viewBox="0 0 300 190" fill="none" aria-hidden overflow="visible" className={className}>
      <defs>
        <filter id="dv-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={10} stdDeviation={12} floodColor={INK} floodOpacity={0.16} />
        </filter>
        <filter id="dv-chip-shadow" x="-20%" y="-60%" width="140%" height="260%">
          <feDropShadow dx={0} dy={4} stdDeviation={5} floodColor={INK} floodOpacity={0.2} />
        </filter>
        <clipPath id="dv-main">
          <rect x={18} y={50} width={196} height={110} rx={6} />
        </clipPath>
        {thumbY.map((y, index) => (
          <clipPath key={y} id={`dv-thumb-${index}`}>
            <rect x={224} y={y} width={56} height={31.5} rx={4} />
          </clipPath>
        ))}
      </defs>

      {/* Editor window */}
      <rect x={6} y={8} width={288} height={170} rx={12} fill="#fff" stroke={INK} strokeOpacity={0.08} filter="url(#dv-shadow)" />
      <circle cx={20} cy={20} r={2.6} fill="#F28B82" />
      <circle cx={29} cy={20} r={2.6} fill="#FBD38D" />
      <circle cx={38} cy={20} r={2.6} fill="#9AE6B4" />
      <text x={150} y={23} textAnchor="middle" fontSize={8} fontWeight={500} fill={INK} fillOpacity={0.45} fontFamily="var(--font-inter), sans-serif">
        Canvas
      </text>
      <text x={280} y={23} textAnchor="end" fontSize={7.5} fill={INK} fillOpacity={0.35} fontFamily="var(--font-plex-mono), monospace">
        100%
      </text>
      <path d="M6 31h288" stroke={INK} strokeOpacity={0.06} />
      <path d="M216 31v147" stroke={INK} strokeOpacity={0.06} />

      {/* Main artboard — the three variations stacked, one showing at a time. */}
      <g clipPath="url(#dv-main)">
        <rect x={18} y={50} width={196} height={110} fill={COLOR.surfaceMuted} />
        {VARIATIONS.map((href, index) => (
          <image
            key={href}
            href={href}
            x={18}
            y={50}
            width={196}
            height={110}
            preserveAspectRatio="xMidYMid slice"
            className={`dv-main dv-main-${index + 1}`}
          />
        ))}
      </g>
      <rect x={18} y={50} width={196} height={110} rx={6} stroke={INK} strokeOpacity={0.08} />

      {/* Selection on the headline, with handles and a tag. */}
      <rect x={70} y={64} width={96} height={42} stroke={BLUE} strokeWidth={1.2} />
      {[
        [70, 64],
        [166, 64],
        [70, 106],
        [166, 106],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 2.2} y={y - 2.2} width={4.4} height={4.4} fill="#fff" stroke={BLUE} strokeWidth={1.1} />
      ))}
      <rect x={70} y={53} width={40} height={11} rx={2.5} fill={BLUE} />
      <text x={90} y={61} textAnchor="middle" fontSize={6.8} fontWeight={600} fill="#fff" fontFamily="var(--font-inter), sans-serif">
        Headline
      </text>

      {/* Variations panel */}
      <text x={224} y={48} fontSize={7.5} fontWeight={600} fill={INK} fillOpacity={0.55} fontFamily="var(--font-inter), sans-serif">
        Variations
      </text>
      {VARIATIONS.map((href, index) => (
        <g key={href}>
          <image
            href={href}
            x={224}
            y={thumbY[index]}
            width={56}
            height={31.5}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#dv-thumb-${index})`}
          />
          <rect x={224} y={thumbY[index]} width={56} height={31.5} rx={4} stroke={INK} strokeOpacity={0.1} />
        </g>
      ))}
      <rect className="dv-ring" x={221.5} y={53.5} width={61} height={36.5} rx={6} stroke={ORANGE} strokeWidth={1.8} />

      {/* The ask that produced them. */}
      <g filter="url(#dv-chip-shadow)">
        <rect x={-8} y={152} width={144} height={30} rx={10} fill={INK} />
      </g>
      <path d="M6 161.4l1.1 2.9 2.9 1.1-2.9 1.1L6 169.4l-1.1-2.9-2.9-1.1 2.9-1.1z" fill={ORANGE} />
      <text x={16} y={170.3} fontSize={9.5} fontWeight={500} fill="#fff" fontFamily="var(--font-inter), sans-serif">
        Try another version
      </text>
      <path d="M123 170.5v-7m-3 3l3-3 3 3" stroke="#fff" strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A real showcase design in a white frame, as one of the finished pieces. */
function Framed({
  id,
  href,
  x,
  y,
  w,
  h,
  rotate,
  shadow = "hiw-dl-shadow",
}: {
  id: string;
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  shadow?: string;
}) {
  const pad = 4;
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`} filter={`url(#${shadow})`}>
      <rect x={x} y={y} width={w} height={h} rx={9} fill="#fff" />
      <clipPath id={id}>
        <rect x={x + pad} y={y + pad} width={w - pad * 2} height={h - pad * 2} rx={6} />
      </clipPath>
      <image
        href={href}
        x={x + pad}
        y={y + pad}
        width={w - pad * 2}
        height={h - pad * 2}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${id})`}
      />
    </g>
  );
}

/** Download — three finished designs fanned out, and the button that takes
 *  them away. The designs are real showcase work, not stand-ins. */
export function DownloadArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 300 190" fill="none" aria-hidden overflow="visible" className={className}>
      <defs>
        <filter id="hiw-dl-shadow" x="-40%" y="-30%" width="180%" height="180%">
          <feDropShadow dx={0} dy={10} stdDeviation={10} floodColor="#000" floodOpacity={0.55} />
        </filter>
      </defs>

      {/* The fan: a website behind left, a square graphic behind right, a
          portrait campaign in front. */}
      <Framed
        id="hiw-dl-a"
        href="/showcase/website-clarix-analytics.webp"
        x={26}
        y={44}
        w={132}
        h={82}
        rotate={-11}
      />
      <Framed
        id="hiw-dl-b"
        href="/showcase/graphic-sunsip-can-packaging.webp"
        x={176}
        y={34}
        w={94}
        h={94}
        rotate={10}
      />
      <Framed
        id="hiw-dl-c"
        href="/showcase/marketing-rosehaus-roselle-latte.webp"
        x={106}
        y={10}
        w={96}
        h={127}
        rotate={-2}
      />

      {/* Format tags — level with the button, off the cards. */}
      <FlatPill x={14} y={156} w={62} h={20} r={7} />
      <path d="M24 161.5h-2.5v2.5M30 170.5h2.5V168M22 161.5l4 4M32.5 170.5l-4-4" stroke={PEACH} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />
      <text x={38} y={169.5} fontSize={8.5} fontWeight={600} letterSpacing={0.3} fill="#fff" fillOpacity={0.88} fontFamily="var(--font-plex-mono), monospace">
        4096px
      </text>
      <FlatPill x={232} y={156} w={46} h={20} r={7} />
      <circle cx={242} cy={166} r={2.6} fill={ORANGE} />
      <text x={248.5} y={169.5} fontSize={8.5} fontWeight={600} letterSpacing={0.6} fill="#fff" fillOpacity={0.88} fontFamily="var(--font-plex-mono), monospace">
        PNG
      </text>

      {/* The button — solid white on the dark card, nothing else. */}
      <rect x={86} y={148} width={136} height={36} rx={11} fill="#fff" />
      <g className="hiw-bob">
        <path d="M106 157.5v9.5m-4-4l4 4 4-4" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M100.5 172.5h11" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <text x={120} y={170.5} fontSize={12.5} fontWeight={600} letterSpacing={-0.1} fill={INK} fontFamily="var(--font-inter), sans-serif">
        Download
      </text>
      <text x={186} y={170.5} fontSize={10} fontWeight={600} fill={INK} fillOpacity={0.4} fontFamily="var(--font-plex-mono), monospace">
        4K
      </text>
    </svg>
  );
}
