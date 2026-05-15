"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: "Sarah Chen",
        role: "Medical Student",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        quote: "I uploaded my pharmacology lecture PDFs and had flashcards ready in under a minute. My exam scores went up 15% after switching to Quiz Eagle.",
    },
    {
        name: "Marcus Williams",
        role: "Computer Science Undergrad",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        quote: "I upload lecture recordings and coding tutorial videos and instantly get quiz questions. Way better than rewatching 2-hour videos the night before an exam.",
    },
    {
        name: "Priya Sharma",
        role: "Law Student",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        quote: "Case summaries, statutes, lecture notes — Quiz Eagle handles them all. The AI-generated quiz explanations are surprisingly accurate for legal content.",
    },
    {
        name: "Tom Eriksson",
        role: "High School Teacher",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
        quote: "I use Quiz Eagle to create review materials for my students. What used to take me an hour to make now takes 30 seconds. Absolute game changer.",
    },
    {
        name: "Aisha Okonkwo",
        role: "MBA Candidate",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
        quote: "Between classes, case studies, and internship prep, I have zero time to make flashcards manually. Quiz Eagle does it for me instantly.",
    },
    {
        name: "Diego Ramírez",
        role: "Language Learner",
        image: "https://randomuser.me/api/portraits/men/54.jpg",
        quote: "I upload Spanish podcast transcripts and get vocabulary flashcards automatically. The 3D flip cards make drilling fun instead of a chore.",
    },
]

const chunkArray = (arr: Testimonial[], size: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
    return result
}

const chunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function WallOfLoveSection() {
    return (
        <section className="py-20 md:py-32" style={{ background: "#f0f2fc" }}>
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                >
                    <span
                        className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
                        style={{ background: "#eef0ff", color: "#4255ff" }}
                    >
                        Student Stories
                    </span>
                    <h2
                        className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                        style={{ color: "#1a1d3b" }}
                    >
                        Loved by learners everywhere
                    </h2>
                    <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#6b6f9a" }}>
                        From med school to coding bootcamps — students use Quiz Eagle to study faster and remember more.
                    </p>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {chunks.map((chunk, ci) => (
                        <div key={ci} className="space-y-4">
                            {chunk.map(({ name, role, quote, image }, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    transition={{ duration: 0.5, delay: ci * 0.08, ease: "easeOut" }}
                                >
                                    <div
                                        className="rounded-2xl p-5"
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e0e3f5",
                                            boxShadow: "0 2px 12px rgba(66,85,255,0.05)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="size-9 shrink-0">
                                                <AvatarImage alt={name} src={image} loading="lazy" width="72" height="72" />
                                                <AvatarFallback style={{ background: "#eef0ff", color: "#4255ff", fontSize: 12, fontWeight: 700 }}>
                                                    {name.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-bold leading-tight" style={{ color: "#1a1d3b" }}>{name}</p>
                                                <p className="text-xs" style={{ color: "#9499c0" }}>{role}</p>
                                            </div>
                                        </div>
                                        <blockquote className="text-sm leading-relaxed" style={{ color: "#34384f" }}>
                                            &ldquo;{quote}&rdquo;
                                        </blockquote>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
