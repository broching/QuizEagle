"use client"

import { motion } from "framer-motion"
import { Zap, BookOpen, Brain, FileText, Video, BarChart3 } from "lucide-react"

const features = [
    {
        icon: Zap,
        title: "AI in Under 30 Seconds",
        description: "Upload a document or video and watch Quiz Eagle extract key concepts, definitions, and facts — generating a full study deck before you can make a coffee.",
        iconBg: "#eef0ff",
        iconColor: "#4255ff",
    },
    {
        icon: BookOpen,
        title: "Interactive Flashcards",
        description: "3D flip cards let you test recall on the go. Shuffle the deck, track your progress card by card, and focus on what you don't know yet.",
        iconBg: "#e8f4ff",
        iconColor: "#2563eb",
    },
    {
        icon: Brain,
        title: "Auto-Generated Quizzes",
        description: "Every deck comes with a multiple-choice quiz. Get instant explanations for every answer so you understand the material, not just memorize it.",
        iconBg: "#f0eeff",
        iconColor: "#7c3aed",
    },
    {
        icon: FileText,
        title: "PDF, PPTX & DOCX Support",
        description: "Upload textbook chapters, lecture slides, or Word notes — anything up to 20 MB. Quiz Eagle extracts clean text even from dense academic documents.",
        iconBg: "#eef0ff",
        iconColor: "#4255ff",
    },
    {
        icon: Video,
        title: "Video & Audio Transcription",
        description: "Turn any lecture recording, documentary, or tutorial into a study deck. Upload MP4, MOV, MP3, or WAV files up to 25 MB — no captions needed.",
        iconBg: "#fff0f6",
        iconColor: "#db2777",
    },
    {
        icon: BarChart3,
        title: "Track Your Progress",
        description: "Save decks to your dashboard, review attempt history, and watch your quiz scores improve over time. Study smarter with data behind every session.",
        iconBg: "#edfdf4",
        iconColor: "#16a34a",
    },
]

export default function FeaturesOne() {
    return (
        <section className="py-20 md:py-32" style={{ background: "#ffffff" }}>
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <span
                        className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
                        style={{ background: "#eef0ff", color: "#4255ff" }}
                    >
                        How it works
                    </span>
                    <h2
                        className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                        style={{ color: "#1a1d3b" }}
                    >
                        Everything you need to study smarter
                    </h2>
                    <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#6b6f9a" }}>
                        Quiz Eagle turns passive reading and watching into active recall — the most effective study method proven by cognitive science.
                    </p>
                </motion.div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => {
                        const Icon = f.icon
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                                className="h-full"
                            >
                                <div
                                    className="h-full rounded-2xl p-6"
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e0e3f5",
                                        boxShadow: "0 2px 12px rgba(66,85,255,0.05)",
                                        transition: "box-shadow 0.2s ease, transform 0.2s ease",
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.boxShadow = "0 8px 28px rgba(66,85,255,0.13)"
                                        el.style.transform = "translateY(-3px)"
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.boxShadow = "0 2px 12px rgba(66,85,255,0.05)"
                                        el.style.transform = "translateY(0)"
                                    }}
                                >
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: f.iconBg }}
                                    >
                                        <Icon size={21} style={{ color: f.iconColor }} />
                                    </div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: "#1a1d3b" }}>
                                        {f.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "#6b6f9a" }}>
                                        {f.description}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
