/**
 * Decorative live background for every hero: drifting glow orbs, a faint
 * moving grid and rising particles. Pure CSS (no JS), pointer-events off.
 * Particle positions are fixed so server and client markup always match.
 */
const PARTICLES = [
  { l: "6%", s: 3, d: 11, t: 0 },
  { l: "14%", s: 2, d: 14, t: 3 },
  { l: "23%", s: 4, d: 12, t: 6 },
  { l: "31%", s: 2, d: 16, t: 1 },
  { l: "42%", s: 3, d: 13, t: 8 },
  { l: "51%", s: 2, d: 15, t: 4 },
  { l: "60%", s: 4, d: 12, t: 9 },
  { l: "68%", s: 2, d: 17, t: 2 },
  { l: "76%", s: 3, d: 11, t: 7 },
  { l: "84%", s: 2, d: 14, t: 5 },
  { l: "91%", s: 4, d: 13, t: 10 },
  { l: "96%", s: 2, d: 16, t: 12 },
];

export default function HeroFX() {
  return (
    <div aria-hidden className="hero-fx pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-grid absolute inset-0" />
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />
      <div className="hero-orb hero-orb-c" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="hero-particle"
          style={{
            left: p.l,
            width: p.s,
            height: p.s,
            animationDuration: `${p.d}s`,
            animationDelay: `-${p.t}s`,
          }}
        />
      ))}
    </div>
  );
}
