"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export default function CallToAction() {
    return (
        <section className="py-12 md:py-20 px-6" style={{ background: "#f0f2fc" }}>
            <motion.div
                className="mx-auto max-w-3xl rounded-3xl px-8 py-10 md:py-14 text-center relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #4255ff 0%, #3544e8 55%, #2b38d4 100%)",
                    boxShadow: "0 16px 48px rgba(66,85,255,0.28)",
                }}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Subtle glow orbs */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(66,85,255,0.35) 0%, transparent 70%)", filter: "blur(40px)" }}
                />
                <div
                    className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)", filter: "blur(50px)" }}
                />

                <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                >
                    <div className="flex justify-center mb-5">
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.18)" }}
                        >
                            <Sparkles size={11} />
                            Get started free
                        </span>
                    </div>

                    <h2
                        className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
                        style={{ color: "#ffffff", lineHeight: 1.15 }}
                    >
                        Study smarter,<br />not harder
                    </h2>

                    <p
                        className="text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                        Turn any PDF, PPTX, DOCX, or video into flashcards and a quiz in seconds. No credit card required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-xl text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{ background: "#ffffff", color: "#1a1d3b", boxShadow: "0 4px 20px rgba(255,255,255,0.25)" }}
                        >
                            Start for Free
                            <ArrowRight size={15} />
                        </Link>
                        <Link
                            href="#"
                            className="inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-xl text-sm transition-all duration-200 hover:bg-white/10"
                            style={{ color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)" }}
                        >
                            See how it works
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
