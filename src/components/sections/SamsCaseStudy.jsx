import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { goToSection } from "../../lib/navigation";
import ResponsiveImage from "../ui/ResponsiveImage";

const proof = [
  { value: "859", label: "backend tests" },
  { value: "7 / 7", label: "evaluation score" },
  { value: "0", label: "npm vulnerabilities" },
  { value: "0", label: "serious Axe issues" },
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
  return (
    <section id="sams-case-study" className="relative w-full py-32 md:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ background: "radial-gradient(circle at 72% 30%, #9a8ac8 0%, transparent 38%)" }}
      />

      <div className="relative mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="07" eyebrow="Flagship case study" title="Inside" accent="SAMS" />

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
                    SAMS · live office state
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Verified
                  </span>
                </div>
                <ResponsiveImage
                  src="/projects/sams-1.jpg"
                  alt="SAMS isometric virtual AI office with agent workspaces and governance controls"
                  className="aspect-[16/9] w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <figcaption className="border-t border-white/8 px-5 py-4 text-xs leading-relaxed text-white/45">
                  One operational surface for agent movement, mission status, security gates, code
                  review and delivery decisions.
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
