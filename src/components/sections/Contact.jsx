import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import MagneticButton from "../ui/MagneticButton";
import { celebrate } from "../../lib/confetti";
import { profile } from "../../data/content";

/* Paste a form backend URL here to receive real submissions
   (e.g. Formspree: "https://formspree.io/f/xxxxxx").
   Left empty, the form gracefully falls back to opening the visitor's
   mail client pre-filled with their message. */
const FORM_ENDPOINT = "";

/* Inline icon components — replaces lucide-react to drop ~12KB of dep. */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
function Mail({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
function PhoneIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function MapPin({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ─── Floating-label input (modern, no clutter) ─── */
function Field({ label, type = "text", name, required, multiline = false, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  const Tag = multiline ? "textarea" : "input";

  return (
    <div className="group relative">
      <Tag
        id={name}
        type={multiline ? undefined : type}
        name={name}
        required={required}
        value={value || ""}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={multiline ? 4 : undefined}
        className={`peer w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 pt-6 pb-2 text-[15px] text-white outline-none transition-all duration-300 hover:border-white/20 focus:border-white/40 focus:bg-white/[0.05] ${multiline ? "min-h-[120px]" : ""}`}
        style={focused ? { boxShadow: "0 0 0 4px rgba(170,180,196,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" } : {}}
      />
      <label
        htmlFor={name}
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          lifted
            ? "top-2 text-[10px] uppercase tracking-[0.3em] text-white/50"
            : "top-4 text-[14px] text-white/35"
        }`}
      >
        {label} {required && <span className="text-[#aab4c4]/70">*</span>}
      </label>

      {/* focus underline — gradient */}
      <span
        className={`pointer-events-none absolute bottom-0 left-4 right-4 h-px origin-left transition-transform duration-500 ${
          focused ? "scale-x-100" : "scale-x-0"
        }`}
        style={{ background: "linear-gradient(90deg, transparent, rgba(170,180,196,0.9), transparent)" }}
      />

      {/* tiny corner accent on focus */}
      {focused && !multiline && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#aab4c4]/60"
        >
          ◆
        </motion.span>
      )}
    </div>
  );
}

/* ─── Big info row — phone / email / location, with copy button ─── */
function InfoRow({ icon: Icon, label, value, href, copyable, i }) {
  const onCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      window.__toast?.(`${label} copied`, { kind: "success", icon: "✓" });
    } catch {
      window.__toast?.("Couldn't copy", { kind: "warn", icon: "⚠" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative border-b border-white/[0.07] py-6"
    >
      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white/40 transition-transform duration-500 group-hover:scale-x-100" />

      <p className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/35">
        <Icon size={12} className="opacity-60" />
        {label}
      </p>
      <div className="flex items-center justify-between gap-3">
        {href ? (
          <a
            href={href}
            data-cursor="hover"
            dir="auto"
            className="block font-display text-xl font-semibold tracking-tight text-white transition-colors md:text-2xl"
          >
            {value}
          </a>
        ) : (
          <p
            dir="auto"
            className="block font-display text-xl font-semibold tracking-tight text-white md:text-2xl"
          >
            {value}
          </p>
        )}

        {copyable && (
          <button
            onClick={onCopy}
            data-cursor="hover"
            data-cursor-text="Copy"
            className="ml-2 flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:border-white/30 hover:text-white"
            aria-label={`Copy ${label}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Section ─── */
export default function Contact() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const titleY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const name = (fields.name || "").trim();
    const email = (fields.email || "").trim();
    const message = (fields.message || "").trim();

    if (!name || !email || !message) {
      setError("Please fill in your name, email and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email address doesn't look right.");
      return;
    }

    const rect = e.target.getBoundingClientRect();
    const succeed = () => {
      setStatus("sent");
      celebrate(rect.left + rect.width / 2, rect.top + 80);
      setTimeout(() => {
        setStatus("idle");
        setFields({});
      }, 3500);
    };

    // No backend wired yet → open the user's mail client (graceful fallback).
    if (!FORM_ENDPOINT) {
      const body = encodeURIComponent(
        `${message}\n\n— ${name}${fields.phone ? `\nPhone: ${fields.phone}` : ""}`
      );
      const subject = encodeURIComponent(fields.subject || `Portfolio enquiry from ${name}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      succeed();
      return;
    }

    try {
      setStatus("sending");
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Request failed");
      succeed();
    } catch {
      setStatus("error");
      setError("Something went wrong — please email me directly instead.");
    }
  };

  const info = [
    { label: "Email",    value: profile.email, href: `mailto:${profile.email}`,           icon: Mail,      copyable: true  },
    { label: "Phone",    value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}`, icon: PhoneIcon, copyable: true  },
    { label: "Location", value: profile.location,                                          icon: MapPin,    copyable: false },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative w-full py-32 md:py-44"
    >
      {/* ambient */}
      <motion.div
        style={{ y: bgY }}
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-[460px] w-[460px] rounded-full opacity-[0.05]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#aab4c4_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
        aria-hidden
        className="pointer-events-none absolute left-[10%] bottom-[15%] h-[360px] w-[360px] rounded-full opacity-[0.04]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#6f7c8c_0%,transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="09" eyebrow="Contact" title="Let's" accent="Talk" />

        <motion.p
          style={{ y: titleY, fontSize: "clamp(1.2rem, 2vw, 1.75rem)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-16 max-w-2xl text-center font-display font-light leading-[1.3] text-white/75"
        >
          Have a project, an idea, or just want to say hi?
          <br className="hidden sm:block" />
          The inbox is{" "}
          <span className="text-gradient italic font-medium">always open</span>.
        </motion.p>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
          {/* LEFT — Big info rows */}
          <div className="space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.55 }}
              className="mb-6 flex items-center gap-4"
            >
              <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/45">
                ( • )
              </span>
              <span className="h-px w-14 bg-gradient-to-r from-white/40 to-white/0" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
                Reach me directly
              </span>
            </motion.div>

            {info.map((d, i) => (
              <InfoRow key={d.label} {...d} i={i} />
            ))}

            {/* status */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex items-center gap-3 text-sm text-green-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="font-medium">Available for new projects</span>
            </motion.div>

            {/* avg response time */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.7 }}
              className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/30"
            >
              Avg response · within 24h
            </motion.p>

            {/* ── CV card — view the résumé or grab the PDF ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group/cv relative mt-10 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25"
            >
              {/* sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover/cv:translate-x-full"
              />
              <div className="relative flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-[#aab4c4]">
                  ▤
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-white">My Résumé</p>
                  <p className="text-[11px] text-white/45">PDF · one page · updated {new Date().getFullYear()}</p>
                </div>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new Event("open-cv"))}
                  data-cursor="hover"
                  data-cursor-text="View"
                  className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white"
                >
                  View
                </button>
                <a
                  href={profile.resumeUrl}
                  download={profile.resumeFile}
                  data-cursor="hover"
                  data-cursor-text="Save"
                  onClick={(e) => celebrate(e.clientX, e.clientY, "#aab4c4")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-black"
                  aria-label="Download CV as PDF"
                >
                  CV
                  <span aria-hidden>↓</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="gradient-border relative rounded-3xl glass p-7 md:p-10"
          >
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-white/25" />
            <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-white/25" />
            <span className="pointer-events-none absolute left-4 bottom-4 h-3 w-3 border-l border-b border-white/25" />
            <span className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-r border-b border-white/25" />

            <div className="mb-7 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
                Send a message
              </p>
              <span className="font-display text-[10px] tracking-widest text-white/30">
                ( 01 / 01 )
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"  name="name"    required value={fields.name}    onChange={set("name")}    />
              <Field label="Email"      name="email"   type="email" required value={fields.email}   onChange={set("email")}   />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Phone"      name="phone"   value={fields.phone}   onChange={set("phone")}   />
              <Field label="Subject"    name="subject" value={fields.subject} onChange={set("subject")} />
            </div>
            <div className="mt-4">
              <Field label="Your message" name="message" multiline required value={fields.message} onChange={set("message")} />
            </div>

            {/* validation / error message — announced to screen readers */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="mt-4 text-center text-[12px] text-red-400/90"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <MagneticButton
              type="submit"
              disabled={status === "sending"}
              aria-busy={status === "sending"}
              className="group relative mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_18px_36px_-12px_rgba(255,255,255,0.4)] transition-colors hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {/* Shimmer sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/8 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              {status === "sending" ? (
                <span className="flex items-center gap-2">
                  Sending
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                </span>
              ) : status === "sent" ? (
                <span className="flex items-center gap-2">
                  Message sent
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18 }}
                  >
                    ✓
                  </motion.span>
                </span>
              ) : (
                <>
                  Send message
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </>
              )}
            </MagneticButton>

            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
              Or DM on{" "}
              <a
                href={profile.socials.find((s) => s.label === "LinkedIn")?.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="text-white/60 underline underline-offset-4 hover:text-white"
              >
                LinkedIn
              </a>
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
