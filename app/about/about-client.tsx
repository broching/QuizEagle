"use client"

import { motion } from "framer-motion"
import { Zap, Target, Sparkles, Clock, BookOpen, Brain } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" },
  }),
}

const values = [
  {
    icon: Zap,
    color: "#4255ff",
    bg: "#eef0ff",
    title: "Speed first",
    body: "Most decks are ready in under 30 seconds. We use Gemini 2.5 Flash — one of the fastest AI models available — so you never wait around.",
  },
  {
    icon: Target,
    color: "#16a34a",
    bg: "#dcfce7",
    title: "Accuracy matters",
    body: "We focus on structured extraction: key concepts, definitions, and facts — not filler. Quality flashcards mean less review time for you.",
  },
  {
    icon: Sparkles,
    color: "#7c3aed",
    bg: "#f3e8ff",
    title: "Free by default",
    body: "You shouldn't need a credit card to study. Core generation is free, forever. Paid plans exist for power users who need higher limits.",
  },
  {
    icon: BookOpen,
    color: "#ea580c",
    bg: "#fff7ed",
    title: "Built for students",
    body: "Every design decision — file types, deck size, quiz format — is shaped by how students actually study, not what's easiest to build.",
  },
]

const stats = [
  { value: "30s", label: "Avg. generation time" },
  { value: "4+", label: "Supported file formats" },
  { value: "100%", label: "Free to start" },
  { value: "∞", label: "Decks you can create" },
]

export default function AboutClient() {
  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        className="pt-36 pb-20 px-6 text-center"
        style={{ background: "#f0f2fc" }}
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0}
          className="flex justify-center mb-5"
        >
          <span className="inline-flex items-center gap-1.5 bg-white text-[#4255ff] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm border border-[#dde0f5] tracking-wide uppercase">
            <Zap size={11} className="fill-[#4255ff]" />
            About Us
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.08}
          className="font-black tracking-tight mb-4 mx-auto max-w-2xl"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "#1a1d3b", lineHeight: 1.1 }}
        >
          Studying shouldn&apos;t feel like{" "}
          <span style={{ color: "#4255ff" }}>extra work</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.16}
          className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          style={{ color: "#6b6f9a" }}
        >
          Quiz Eagle was built to close the gap between having material and
          actually knowing it — turning any document or video into a ready-to-use
          flashcard deck and quiz in seconds.
        </motion.p>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <section className="py-10 px-6" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y-2 md:divide-y-0 md:divide-x-2"
            style={{ "--tw-divide-opacity": 1, borderColor: "#e0e3f5" } as React.CSSProperties}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={0}
                className="text-center px-6 py-2"
              >
                <div
                  className="text-4xl font-black mb-1 tabular-nums"
                  style={{ color: "#4255ff" }}
                >
                  {s.value}
                </div>
                <div className="text-sm font-medium" style={{ color: "#6b6f9a" }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6" style={{ background: "#f0f2fc" }}>
        <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: "#eef0ff", color: "#4255ff" }}
            >
              Our Mission
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5 leading-tight"
              style={{ color: "#1a1d3b" }}
            >
              Make active recall accessible to every student
            </h2>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: "#6b6f9a" }}>
              Research shows that active recall — testing yourself rather than re-reading — is one of the most effective ways to retain information. But creating good flashcards takes time most students don&apos;t have.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "#6b6f9a" }}>
              Quiz Eagle removes that friction. Upload your lecture slides, notes, or a YouTube recording and we&apos;ll extract the key concepts and turn them into a polished deck — ready in less time than it takes to brew a coffee.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex justify-center"
          >
            <div
              className="rounded-3xl p-8 w-full max-w-sm text-center"
              style={{
                background: "linear-gradient(135deg, #4255ff 0%, #2b38d4 100%)",
                boxShadow: "0 16px 48px rgba(66,85,255,0.25)",
              }}
            >
              <Brain className="mx-auto mb-5 opacity-90" size={48} color="#fff" strokeWidth={1.5} />
              <p
                className="text-lg font-bold leading-snug mb-3"
                style={{ color: "#fff" }}
              >
                &ldquo;The best study tool is the one you actually use.&rdquo;
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                That&apos;s why we obsess over speed, simplicity, and getting out of your way.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: "#eef0ff", color: "#4255ff" }}
            >
              What we stand for
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: "#1a1d3b" }}
            >
              Built around a few simple principles
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                custom={0}
                className="rounded-2xl border p-6"
                style={{ background: "#fafafe", borderColor: "#e0e3f5" }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(66,85,255,0.10)" }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: v.bg }}
                >
                  <v.icon size={18} color={v.color} strokeWidth={2} />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "#1a1d3b" }}
                >
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b6f9a" }}>
                  {v.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tech stack ─────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-6" style={{ background: "#f0f2fc" }}>
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: "#eef0ff", color: "#4255ff" }}
            >
              Under the hood
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5"
              style={{ color: "#1a1d3b" }}
            >
              Powered by the best AI available
            </h2>
            <p className="text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: "#6b6f9a" }}>
              We run Google&apos;s Gemini 2.5 Flash model for all extraction and generation — chosen for its speed, accuracy on academic content, and long context window that can handle large documents and full video transcripts.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {[
              { label: "Gemini 2.5 Flash", sub: "AI generation engine" },
              { label: "Next.js 15", sub: "Frontend framework" },
              { label: "Convex", sub: "Realtime backend" },
              { label: "Clerk", sub: "Auth & user management" },
              { label: "Cloudflare", sub: "CDN & edge delivery" },
              { label: "Vercel", sub: "Global deployment" },
            ].map((t) => (
              <motion.div
                key={t.label}
                variants={fadeUp}
                custom={0}
                className="rounded-2xl border px-5 py-4 text-left"
                style={{ background: "#ffffff", borderColor: "#e0e3f5" }}
              >
                <div className="text-sm font-bold mb-0.5" style={{ color: "#1a1d3b" }}>
                  {t.label}
                </div>
                <div className="text-xs" style={{ color: "#9499c0" }}>
                  {t.sub}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "#ffffff" }}>
        <motion.div
          className="mx-auto max-w-2xl rounded-3xl px-8 py-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4255ff 0%, #2b38d4 100%)",
            boxShadow: "0 16px 48px rgba(66,85,255,0.28)",
          }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)",
              filter: "blur(32px)",
            }}
          />
          <div className="relative">
            <Image
              src="/download.svg"
              alt="Quiz Eagle"
              width={160}
              height={48}
              style={{ height: 40, width: "auto", filter: "brightness(0) invert(1)" }}
              className="mx-auto mb-5 opacity-90"
            />
            <h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3"
              style={{ color: "#ffffff" }}
            >
              Ready to study smarter?
            </h2>
            <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.78)" }}>
              Upload a file and get your first flashcard deck in under 30 seconds. No sign-up required.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-xl text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#ffffff", color: "#1a1d3b" }}
            >
              <Clock size={14} />
              Try it free — 30 seconds
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
