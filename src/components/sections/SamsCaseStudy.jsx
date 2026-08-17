import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { goToSection } from "../../lib/navigation";
import ResponsiveImage from "../ui/ResponsiveImage";
import { useContent } from "../../i18n/useContent";

const proof = [
  { value: "859", label: "backend tests" },
  { value: "7 / 7", label: "evaluation score" },
  { value: "8", label: "system blueprints" },
  { value: "209", label: "citable laws" },
  { value: "0", label: "npm vulnerabilities" },
  { value: "0", label: "serious Axe issues" },
];

/* The three claims the project makes on its front page. Each one is listed
   with the mechanism that enforces it, because "we prompt the agents not to"
   is not an engineering guarantee and the distinction is the whole point. */
const guarantees = [
  {
    what: "duplicated work",
    how: "A locked task claim board. Two agents cannot hold the same work item, so the second one has nothing to duplicate.",
  },
  {
    what: "unresolved conflicts",
    how: "A deterministic tie-break. The same contested claim resolves the same way every time it is replayed.",
  },
  {
    what: "infinite loops",
    how: "A hard iteration ceiling. Hitting it force-halts the run and files a partial result report instead of burning tokens.",
  },
];

/* The System Factory, end to end. The section's headline — "from contract to
   rollback" — is this list. */
const factoryChain = [
  {
    step: "Contract",
    detail:
      "Typed endpoints, events, errors and database schemas, compiled from the requirement register.",
  },
  {
    step: "Graph",
    detail:
      "A validated work-item DAG. A missing dependency or a cycle is rejected rather than discovered later.",
  },
  {
    step: "Gates",
    detail:
      "Test, lint, build, security, dependency policy, import cycles, migration replay, recovery drill.",
  },
  {
    step: "Release",
    detail:
      "Immutable and content-addressed, carrying an SBOM, build provenance and a signed attestation.",
  },
  {
    step: "Rollout",
    detail:
      "Canary, blue/green or rolling, through a weighted router that keeps a visitor on one version.",
  },
  {
    step: "Rollback",
    detail:
      "A failed smoke proof against the deployed payload restores the previous release automatically.",
  },
];

/* The most interesting engineering decisions in the project are all refusals.
   Worth its own block: it is the part that separates the system from a demo. */
const refusals = [
  "Sign a release it cannot sign — the attestation is written unsigned and says so, because a fake signature is worse than none.",
  "Start when a configured backend is unreachable — two divergent sets of checkpoints is worse than a process that will not boot.",
  "Report a pass for a command the environment could not really run.",
  "Deploy a release whose attestation does not match its own bytes.",
  "Invent model output — with no provider configured, live mode stops and explains itself.",
];

/* The three surfaces the operator actually works in.
   `image` is optional: a surface with one renders as a captioned screenshot,
   one without renders as a spec card — so the gallery never shows a broken
   frame for a screen nobody has captured yet. Add a file to public/projects/
   and run `npm run images` to generate its AVIF/WebP derivatives. */
const surfaces = [
  {
    name: "The living office",
    meta: "Iso · CEO · Walk",
    image: "/projects/sams-office.png",
    alt: "SAMS isometric 3D office: agent desks, coloured pathing overlays, camera mode and weather controls",
    detail:
      "Isometric orbit, top-down and first-person walk over one navmesh. Day/night, weather, positional audio, and a status light per employee that follows the spec's lighting rules.",
  },
  {
    name: "System Factory",
    meta: "Contract → rollback",
    image: "/projects/sams-factory.png",
    alt: "SAMS System Factory: project scope, CEO brief, requirement register and the execution rail",
    detail:
      "Requirement register, compiled dependency graph, execution rail, traceability matrix and impact analysis — the blast radius of a change before anyone makes it.",
  },
  {
    name: "Agent provisioning",
    meta: "6 model backends",
    image: "/projects/sams-agent.png",
    alt: "SAMS Add AI Agent dialog offering GPT, Claude, Gemini, DeepSeek, Blackbox and the SAMS Core facilitator",
    detail:
      "A desk is provisioned with a named model — GPT, Claude, Gemini, DeepSeek, Blackbox or the in-house facilitator — routed per role behind a per-model circuit breaker.",
  },
];

const deliveryTrace = [
  { label: "Brief", detail: "The CEO defines the mission and acceptance criteria." },
  { label: "Negotiate", detail: "Specialists challenge the plan and claim scoped work." },
  { label: "Build", detail: "Agents write real files inside governed workspaces." },
  { label: "Verify", detail: "Exit codes, QA and approval gates outrank model claims." },
  { label: "Deliver", detail: "A verified build exports to a real project folder." },
];

function ProofCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="border-l border-white/12 pl-4"
    >
      <p className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {item.value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/50">{item.label}</p>
    </motion.div>
  );
}

export default function SamsCaseStudy() {
  const { t } = useContent();
  return (
    <section id="sams-case-study" className="relative w-full py-32 md:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ background: "radial-gradient(circle at 72% 30%, #9a8ac8 0%, transparent 38%)" }}
      />

      <div className="relative mx-auto w-[90%] max-w-7xl">
        <SectionHeading
          num="07"
          eyebrow={t.headings.sams.eyebrow}
          title={t.headings.sams.title}
          accent={t.headings.sams.accent}
        />

        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28" dir="left" once>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c7bdf0]">
              Multi-agent virtual AI office
            </p>
            <h3 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl">
              Make the work visible — and the proof unavoidable.
            </h3>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/58">
              SAMS turns an AI delivery pipeline into a living 3D company. The office is not
              decoration: every desk, meeting, status light and speech bubble reflects real
              planning, file writes, tests, blockers and approval decisions.
            </p>

            <div
              className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7"
              aria-label="Verified SAMS project baseline"
            >
              {proof.map((item, index) => (
                <ProofCard key={item.label} item={item} index={index} />
              ))}
            </div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-white/38">
              Verified project baseline · 31 July 2026
            </p>
          </Reveal>

          <div className="space-y-10">
            <Reveal once>
              <figure className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#10131a] shadow-[0_35px_90px_-30px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex gap-1.5" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/14" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.28em] text-white/45">
                    SAMS · system factory
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Verified
                  </span>
                </div>
                <ResponsiveImage
                  src="/projects/sams-factory.png"
                  alt="SAMS System Factory: a brief compiled into a requirement register, dependency graph and gated execution rail"
                  className="aspect-[16/9] w-full object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <figcaption className="border-t border-white/8 px-5 py-4 text-xs leading-relaxed text-white/45">
                  A brief becomes a binding requirement register, then a compiled dependency graph.
                  Nothing ships without green evidence and a Git revision.
                </figcaption>
              </figure>
            </Reveal>

            <Reveal once>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/9 bg-white/[0.025] p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                    The problem
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    Multi-agent demos often stop at conversation. Work overlaps, a model can claim
                    completion without evidence, and the human cannot see where the delivery
                    actually stands.
                  </p>
                </article>
                <article className="rounded-2xl border border-[#9a8ac8]/25 bg-[#9a8ac8]/[0.055] p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c7bdf0]">
                    The decision
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    Treat every model output as a proposal. Locked claims prevent duplicate work,
                    real exit codes decide whether a build passed, and the CEO keeps the final gate.
                  </p>
                </article>
              </div>
            </Reveal>

            <Reveal once>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                      Delivery trace
                    </p>
                    <h4 className="mt-2 font-display text-2xl font-semibold text-white">
                      From intent to evidence
                    </h4>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/45">
                    5 gates
                  </span>
                </div>

                <ol className="relative space-y-2">
                  {deliveryTrace.map((step, index) => (
                    <li
                      key={step.label}
                      className="group grid grid-cols-[2.5rem_1fr] gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.035]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] font-display text-[10px] text-[#c7bdf0]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white/82">{step.label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {/* The three zeros. The claim is worthless without the mechanism
                beside it, so they are always rendered as a pair. */}
            <Reveal once>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                  Guaranteed by code, not by prompt wording
                </p>
                <ul className="mt-6 space-y-5">
                  {guarantees.map((g) => (
                    <li key={g.what} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-5">
                      <p className="font-display text-lg font-semibold leading-tight text-white">
                        <span className="text-[#c7bdf0]">Zero</span> {g.what}
                      </p>
                      <p className="text-xs leading-relaxed text-white/50">{g.how}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* The factory chain — the section's own headline, itemised. */}
            <Reveal once>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                      System factory
                    </p>
                    <h4 className="mt-2 font-display text-2xl font-semibold text-white">
                      From contract to rollback
                    </h4>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/45">
                    8 blueprints
                  </span>
                </div>
                <ol className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {factoryChain.map((link, index) => (
                    <li key={link.step}>
                      <p className="flex items-baseline gap-2">
                        <span className="font-display text-[10px] text-[#c7bdf0]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold text-white/82">{link.step}</span>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/45">{link.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {/* Three surfaces. A captured one shows its screenshot; the rest
                stand on their spec until a capture exists. */}
            <Reveal once>
              <div>
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                  Three surfaces, one system
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {surfaces.map((surface) => (
                    <figure
                      key={surface.name}
                      className="flex flex-col overflow-hidden rounded-2xl border border-white/9 bg-white/[0.025]"
                    >
                      {surface.image ? (
                        <ResponsiveImage
                          src={surface.image}
                          alt={surface.alt}
                          className="aspect-[16/10] w-full border-b border-white/8 object-cover"
                          sizes="(max-width: 640px) 100vw, 20vw"
                        />
                      ) : null}
                      <figcaption className="p-5">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-[#c7bdf0]">
                          {surface.meta}
                        </p>
                        <p className="mt-2 font-display text-base font-semibold text-white">
                          {surface.name}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/45">
                          {surface.detail}
                        </p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* The refusals. The reason this reads as engineering and not as a
                demo, so it gets the accent treatment. */}
            <Reveal once>
              <div className="rounded-3xl border border-[#9a8ac8]/25 bg-[#9a8ac8]/[0.05] p-6 md:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c7bdf0]">
                  What it refuses to do
                </p>
                <h4 className="mt-2 max-w-lg font-display text-2xl font-semibold leading-snug text-white">
                  The interesting decisions were all refusals.
                </h4>
                <ul className="mt-6 space-y-3">
                  {refusals.map((line) => (
                    <li key={line} className="flex gap-3 text-xs leading-relaxed text-white/58">
                      <span aria-hidden className="mt-[0.35em] text-[#c7bdf0]">
                        ✕
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal once>
              <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">
                <div>
                  <p className="font-display text-xl font-semibold text-white">
                    Need this depth in your next product?
                  </p>
                  <p className="mt-1 text-sm text-white/45">
                    Let’s turn the complex part into the clearest part.
                  </p>
                </div>
                <a
                  href="#contact"
                  onClick={(event) => {
                    event.preventDefault();
                    goToSection("contact", { cinematic: false, offset: -24 });
                  }}
                  className="rounded-full bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-transform hover:-translate-y-0.5"
                >
                  Start a conversation →
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
