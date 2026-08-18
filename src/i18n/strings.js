/**
 * ── Literal string dictionary ─────────────────────────────────────────
 * Keyed by the English source text itself, not by invented key names.
 *
 * The site had ~217 English strings written directly into JSX rather than
 * held in content.js. Inventing a key for each one would mean choosing, and
 * then remembering, 217 names; keying by the source string makes wiring
 * mechanical — `Back to top` becomes `{tr("Back to top")}` — and makes a
 * missing translation obvious rather than silent, because `tr` falls back to
 * the key, which IS the correct English.
 *
 * Rule: anything absent here renders in English. That is a deliberate,
 * safe failure mode — a missing entry costs a word, never a blank screen.
 */

export const AR_STRINGS = {
  // ── Global chrome ──
  "Skip to content": "تخطَّ إلى المحتوى",
  "Going to": "رايح لـ",
  Scroll: "انزل",
  Enter: "ادخل",
  "Back to top": "ارجع لفوق",
  Copy: "نسخ",
  Copied: "تم النسخ",
  View: "اعرض",
  Email: "البريد",
  Phone: "الموبايل",
  Location: "المكان",
  Role: "الدور",
  Major: "التخصص",
  Year: "السنة",
  University: "الجامعة",
  Status: "الحالة",
  Navigate: "تنقّل",
  Connect: "تواصل",
  Elsewhere: "مواقع تانية",
  Index: "الفهرس",
  About: "عني",
  Services: "الخدمات",
  Projects: "المشاريع",
  Socials: "السوشيال",
  Contact: "اتصل بي",
  Verified: "موثّق",

  // ── Cover / intro ──
  "— Software Engineer": "— مهندس برمجيات",
  "I ENGINEER": "أنا بهندس",
  "INTERFACES THAT": "واجهات",
  FEEL: "بتحسّها",
  "ALIVE.": "حيّة.",

  // ── Hero ──
  Available: "متاح",
  "Crafting with": "بشتغل بـ",
  "Real-time · WebGL": "لحظي · WebGL",
  "Pulse the field": "حرّك المجال",

  // ── About ──
  "Always learning. Always building.": "بتعلّم دايماً. وببني دايماً.",
  "◆ Profile": "◆ الملف",
  "Open to opportunities": "متاح لفرص جديدة",
  "What I bring": "اللي بضيفه",

  // ── Stats ──
  "By the numbers": "بالأرقام",
  "Requests / second": "طلب / ثانية",
  "VÉRA API under 50 concurrent users — zero errors.":
    "واجهة VÉRA تحت ٥٠ مستخدم متزامن — صفر أخطاء.",
  "p99 latency": "زمن الاستجابة p99",
  "Ninety-ninth percentile, at that same sustained load.":
    "المئين التاسع والتسعون، تحت نفس الحمل المستمر.",
  "DSP round trip": "دورة معالجة الإشارة",
  "Critical path": "المسار الحرج",

  // ── Manifesto ──
  // The statement itself lives in Manifesto.jsx as whole Arabic lines: it is
  // animated word-by-word, so translating individual words could not fix the
  // reversed word ORDER that dir=rtl produced.
  Manifesto: "البيان",
  "Every frame earns its place": "كل إطار بيستاهل مكانه",

  // ── Skills ──
  Toolkit: "الأدوات",
  "Every tool I reach for, floating in one constellation.":
    "كل أداة ببتد إيدي ليها، في كوكبة واحدة.",
  "and always learning more": "وبتعلّم أكتر على طول",

  // ── Services / capabilities ──
  Capabilities: "الإمكانيات",
  "How I": "إزاي",
  "can help": "أقدر أساعد",
  "Service /": "خدمة /",
  "Got something in mind?": "في حاجة في بالك؟",
  "Let's talk →": "خلّينا نتكلم ←",
  "Sound off": "اقفل الصوت",

  // ── Process ──
  "Phase /": "مرحلة /",
  ") · Phase": ") · مرحلة",
  "steps · every project": "خطوات · كل مشروع",

  // ── Experience ──
  "journey continues": "والرحلة مستمرة",

  // ── Projects ──
  Globe: "الكرة",
  Timeline: "الخط الزمني",
  Cards: "كروت",
  Destination: "الوجهة",
  "Read Case Study": "اقرأ دراسة الحالة",
  "Scroll to fly": "انزل عشان تطير",
  "All projects live on": "كل المشاريع على",

  // ── Socials ──
  "Tap any platform — let's build something together. I reply to every message.":
    "اضغط على أي منصة — خلّينا نبني حاجة سوا. برد على كل رسالة.",

  // ── Contact ──
  "Have a project, an idea, or just want to say hi?":
    "عندك مشروع، أو فكرة، أو حابب تسلّم بس؟",
  "The inbox is": "الرسايل",
  "always open": "مفتوحة دايماً",
  "Reach me directly": "كلّمني على طول",
  "Available for new projects": "متاح لمشاريع جديدة",
  "Avg response · within 24h": "متوسط الرد · خلال ٢٤ ساعة",
  "My Résumé": "سيرتي الذاتية",
  "PDF · one page · updated": "PDF · صفحة واحدة · محدّثة",
  "Company website": "موقع الشركة",
  "Send a message": "ابعت رسالة",
  "Full name": "الاسم بالكامل",
  Subject: "الموضوع",
  "Your message": "رسالتك",
  "Send message": "ابعت الرسالة",
  "Or email me directly / DM on": "أو ابعتلي إيميل / رسالة على",

  // ── Footer ──
  "Until next time": "لحد المرة الجاية",
  "Let's build": "خلّينا نبني",
  "something great.": "حاجة عظيمة.",
  "LET'S BUILD SOMETHING GREAT": "خلّينا نبني حاجة عظيمة",
  "Drop me a line": "ابعتلي كلمة",
  "With my own hand": "بخط إيدي",
  "· All rights reserved": "· كل الحقوق محفوظة",
  "Crafted with": "اتصنع بـ",
  // ── SAMS case study ──
  // Per the site owner's decision: the deep technical body (contracts, gates,
  // rollback, SBOM, attestation) stays in English even in Arabic mode, the way
  // most technical companies publish. Only the framing — headings, section
  // labels, the summary and the closing call to action — is translated, so an
  // Arabic reader can navigate and decide whether to read on.
  "Multi-agent virtual AI office": "مكتب ذكاء اصطناعي افتراضي متعدد الوكلاء",
  "Make the work visible — and the proof unavoidable.":
    "خلّي الشغل مرئي — والدليل ميتهربش منه.",
  "The problem": "المشكلة",
  "The decision": "القرار",
  "Delivery trace": "أثر التسليم",
  "From intent to evidence": "من النية للدليل",
  "System factory": "مصنع الأنظمة",
  "System Factory": "مصنع الأنظمة",
  "From contract to rollback": "من العقد للتراجع",
  "Three surfaces, one system": "تلات واجهات، نظام واحد",
  "The living office": "المكتب الحيّ",
  "Agent provisioning": "تجهيز الوكلاء",
  "What it refuses to do": "اللي بيرفض يعمله",
  "The interesting decisions were all refusals.":
    "أهم القرارات كلها كانت رفض.",
  "Guaranteed by code, not by prompt wording":
    "مضمون بالكود، مش بصياغة الأوامر",
  "Need this depth in your next product?":
    "محتاج العمق ده في منتجك الجاي؟",
  "Let’s turn the complex part into the clearest part.":
    "خلّينا نحوّل الجزء المعقّد لأوضح جزء.",
  "Start a conversation →": "ابدأ محادثة ←",
  "Verified project baseline · 31 July 2026":
    "خط أساس موثّق للمشروع · ٣١ يوليو ٢٠٢٦",
  Brief: "الموجز",
  Negotiate: "التفاوض",
  Build: "البناء",
  Verify: "التحقق",
  Deliver: "التسليم",
  Contract: "العقد",
  Graph: "الرسم البياني",
  Gates: "البوابات",
  Release: "الإصدار",
  Rollout: "الطرح",
  Rollback: "التراجع",
  Zero: "صفر",

};

/** Look up a literal; fall back to the English source, which is the key. */
export function translate(lang, s) {
  if (lang !== "ar") return s;
  return AR_STRINGS[s] ?? s;
}
