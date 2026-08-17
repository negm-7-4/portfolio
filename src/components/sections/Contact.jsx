import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import MagneticButton from "../ui/MagneticButton";
import { celebrate } from "../../lib/confetti";
import { toast } from "../../lib/toast";
import { openCv } from "../../lib/appEvents";
import { useContent } from "../../i18n/useContent";
// Same-origin Vercel Function. If Resend is not configured in an environment,
// the API returns a typed 503 and the UI honestly falls back to the mail app.
/* ── Where the contact form delivers ──────────────────────────────────
 * FORMSPREE — the zero-setup path. Create a free form at formspree.io,
 * copy the ID out of the endpoint it gives you
 * (https://formspree.io/f/XXXXXXXX  →  "XXXXXXXX") and paste it below.
 * Nothing else to configure: no API key, no env var, no redeploy secret.
 * Delivery starts working the moment this string is filled in.
 *
 * Leave it empty and the form falls back to the bundled serverless route
 * (/api/contact, which sends through Resend and needs RESEND_API_KEY set
 * in the Vercel project). If neither is configured, the form still works:
 * it opens the visitor's mail client pre-filled, so a message is never
 * silently lost. */
const FORMSPREE_ID = "";

const FORM_ENDPOINT = FORMSPREE_ID
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : "/api/contact";

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
        style={
          focused
            ? {
                boxShadow: "0 0 0 4px rgba(170,180,196,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
              }
            : {}
        }
      />
      <label
        htmlFor={name}
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          lifted
            ? "top-2 text-[10px] uppercase tracking-[0.3em] text-white/50"
            : "top-4 text-[14px] text-white/55"
        }`}
      >
        {label} {required && <span className="text-[#aab4c4]/70">*</span>}
      </label>

      {/* focus underline — gradient */}
      <span
        className={`pointer-events-none absolute bottom-0 left-4 right-4 h-px origin-left transition-transform duration-500 ${
          focused ? "scale-x-100" : "scale-x-0"
        }`}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(170,180,196,0.9), transparent)",
        }}
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
  const { tr } = useContent();
  const onCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied`, { kind: "success", icon: "✓" });
    } catch {
      toast("Couldn't copy", { kind: "warn", icon: "⚠" });
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

      <p className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/55">
        <Icon size={12} className="opacity-60" />
        {label}
      </p>
      <div className="flex items-center justify-between gap-3">
        {href ? (
          <a
            href={href}
            data-cursor="hover"
            dir="auto"
            className="flex min-h-11 items-center font-display text-xl font-semibold tracking-tight text-white transition-colors md:min-h-0 md:text-2xl"
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

        {/* Reveal-on-hover would hide this button forever on a phone (touch
            has no hover), so below md it stays visible and tall enough to tap;
            from md up it keeps the quiet hover-reveal behaviour. */}
        {copyable && (
          <button
            onClick={onCopy}
            data-cursor="hover"
            data-cursor-text="Copy"
            className="ml-2 flex h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 transition-all duration-300 hover:border-white/30 hover:text-white md:h-9 md:opacity-0 md:group-hover:opacity-100"
            aria-label={`Copy ${label}`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {tr("Copy")}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Section ─── */
export default function Contact() {
  const { profile, t, tr } = useContent();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const titleY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const [status, setStatus] = useState("idle"); // idle | sending | sent | email-opened | error
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

    const rect = e.currentTarget.getBoundingClientRect();
    const succeed = () => {
      setStatus("sent");
      celebrate(rect.left + rect.width / 2, rect.top + 80);
      setTimeout(() => {
        setStatus("idle");
        setFields({});
      }, 4500);
    };

    const openMailApp = () => {
      const body = encodeURIComponent(
        `${message}\n\n— ${name}${fields.phone ? `\nPhone: ${fields.phone}` : ""}\nEmail: ${email}`
      );
      const subject = encodeURIComponent(fields.subject || `Portfolio enquiry from ${name}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus("email-opened");
      setTimeout(() => setStatus("idle"), 4500);
    };

    try {
      setStatus("sending");
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...fields,
          submissionId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 503 && payload.code === "CONTACT_NOT_CONFIGURED") {
        openMailApp();
        return;
      }
      if (!res.ok || payload.ok !== true) throw new Error(payload.message || "Request failed");
      succeed();
    } catch {
      setStatus("error");
      setError("The message could not be delivered. Please use the email link below instead.");
    }
  };

  const info = [
    {
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
      copyable: true,
    },
    {
      label: "Phone",
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s/g, "")}`,
      icon: PhoneIcon,
      copyable: true,
    },
    { label: "Location", value: profile.location, icon: MapPin, copyable: false },
  ];

  return (
    <section id="contact" ref={ref} className="relative w-full py-32 md:py-44">
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
        <SectionHeading
          num="09"
          eyebrow={t.headings.contact.eyebrow}
          title={t.headings.contact.title}
          accent={t.headings.contact.accent}
        />

        <motion.p
          style={{ y: titleY, fontSize: "clamp(1.2rem, 2vw, 1.75rem)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-16 max-w-2xl text-center font-display font-light leading-[1.3] text-white/75"
        >
          Have a project, an idea, or just want to say hi? <br className="hidden sm:block" />
          {tr("The inbox is")} <span className="text-gradient italic font-medium">{tr("always open")}</span>.
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
              <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/65">
                ( • )
              </span>
              <span className="h-px w-14 bg-gradient-to-r from-white/40 to-white/0" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
                {tr("Reach me directly")}
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
              <span className="font-medium">{tr("Available for new projects")}</span>
            </motion.div>

            {/* avg response time */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.7 }}
              className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/50"
            >
              {tr("Avg response \u00b7 within 24h")}
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
                  <p className="font-display text-sm font-semibold text-white">{tr("My R\u00e9sum\u00e9")}</p>
                  <p className="text-[11px] text-white/65">
                    PDF · one page · updated {new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                <button
                  onClick={openCv}
                  data-cursor="hover"
                  data-cursor-text="View"
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white md:min-h-0 md:px-3"
                >
                  {tr("View")}
                </button>
                <a
                  href={profile.resumeUrl}
                  download={profile.resumeFile}
                  data-cursor="hover"
                  data-cursor-text="Save"
                  onClick={(e) => celebrate(e.clientX, e.clientY, "#aab4c4")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-black md:min-h-0 md:px-3"
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
            <div
              className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="contact-company">{tr("Company website")}</label>
              <input
                id="contact-company"
                name="company"
                value={fields.company || ""}
                onChange={set("company")}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-white/25" />
            <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-white/25" />
            <span className="pointer-events-none absolute left-4 bottom-4 h-3 w-3 border-l border-b border-white/25" />
            <span className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-r border-b border-white/25" />

            <div className="mb-7 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
                {tr("Send a message")}
              </p>
              <span className="font-display text-[10px] tracking-widest text-white/50">
                ( 01 / 01 )
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                name="name"
                required
                value={fields.name}
                onChange={set("name")}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                required
                value={fields.email}
                onChange={set("email")}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Phone" name="phone" value={fields.phone} onChange={set("phone")} />
              <Field
                label="Subject"
                name="subject"
                value={fields.subject}
                onChange={set("subject")}
              />
            </div>
            <div className="mt-4">
              <Field
                label="Your message"
                name="message"
                multiline
                required
                value={fields.message}
                onChange={set("message")}
              />
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
              ) : status === "email-opened" ? (
                <span className="flex items-center gap-2">
                  Email app opened
                  <span aria-hidden>↗</span>
                </span>
              ) : (
                <>
                  {tr("Send message")}
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

            <p
              className="mt-4 text-center text-[10px] uppercase tracking-[0.24em] text-white/50"
              aria-live="polite"
            >
              {status === "sent" ? (
                "Delivered to my inbox."
              ) : (
                <>
                  Or email me directly / DM on{" "}
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-block py-2 text-white/60 underline underline-offset-4 hover:text-white"
                  >
                    {tr("Email")}
                  </a>{" "}
                  ·{" "}
                  <a
                    href={profile.socials.find((s) => s.label === "LinkedIn")?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="inline-block py-2 text-white/60 underline underline-offset-4 hover:text-white"
                  >
                    LinkedIn
                  </a>
                </>
              )}
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
