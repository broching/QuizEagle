"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
    {
        q: "Is Quiz Eagle really free to use?",
        a: "Yes — you can generate flashcard decks and quizzes without signing up, completely free. Creating an account lets you save decks to your dashboard and track your quiz progress over time. We offer paid plans for power users who need higher limits.",
    },
    {
        q: "What file types and sizes are supported?",
        a: "Quiz Eagle supports PDF, PPTX, and DOCX files up to 20 MB, and video/audio files (MP4, MOV, MP3, WAV, M4A) up to 25 MB. For documents, text must be selectable — scanned images won't work. Videos are transcribed automatically using AI, no captions required.",
    },
    {
        q: "How accurate are the AI-generated flashcards?",
        a: "Quiz Eagle uses Google's Gemini model to identify key concepts, definitions, and facts from your content. Accuracy is high for well-structured academic material. We always recommend reviewing the generated deck before your exam to catch any gaps.",
    },
    {
        q: "Can I save and revisit my decks?",
        a: "Yes — sign up for a free account and every deck you generate is saved to your personal dashboard. You can review flashcards, retake quizzes, and track your score history at any time.",
    },
    {
        q: "How long does generation take?",
        a: "Most decks are ready in under 30 seconds. Longer PDFs or videos may take up to a minute. We process your content with Gemini 2.5 Flash, one of the fastest AI models available, so wait times are minimal.",
    },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false)
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
        >
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                aria-expanded={open}
            >
                <span
                    className="font-semibold text-sm md:text-base leading-snug"
                    style={{ color: "#1a1d3b" }}
                >
                    {q}
                </span>
                <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{
                        background: open ? "#4255ff" : "#eef0ff",
                        color: open ? "#ffffff" : "#4255ff",
                    }}
                >
                    {open ? <Minus size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
                </span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-sm leading-relaxed" style={{ color: "#6b6f9a" }}>
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ borderBottom: "1px dashed #e0e3f5" }} />
        </motion.div>
    )
}

export default function FAQs() {
    return (
        <section className="py-20 md:py-32" style={{ background: "#ffffff" }}>
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="lg:sticky lg:top-28 lg:self-start"
                    >
                        <span
                            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
                            style={{ background: "#eef0ff", color: "#4255ff" }}
                        >
                            FAQ
                        </span>
                        <h2
                            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight"
                            style={{ color: "#1a1d3b" }}
                        >
                            Frequently<br />Asked<br />Questions
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: "#6b6f9a" }}>
                            Can&apos;t find an answer?{" "}
                            <a
                                href="mailto:support@quizeagle.com"
                                className="underline underline-offset-4 font-medium"
                                style={{ color: "#4255ff" }}
                            >
                                Email us
                            </a>
                        </p>
                    </motion.div>

                    {/* Right — accordion */}
                    <div>
                        <div style={{ borderTop: "1px dashed #e0e3f5" }} />
                        {faqs.map((item, i) => (
                            <FAQItem key={i} q={item.q} a={item.a} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
