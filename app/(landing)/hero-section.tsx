import React from 'react'
import { HeroHeader } from "./header"
import GeneratorEmbed from "./generator-embed"

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main>
                <section className="pt-28 pb-16 md:pt-36 md:pb-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                            {/* Left: marketing copy */}
                            <div className="pt-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    AI-powered · No sign-up needed
                                </div>

                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl leading-tight">
                                    Turn any PDF or YouTube video into{" "}
                                    <span className="text-primary">flashcards & quizzes</span>
                                </h1>

                                <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                                    Drop in a lecture, textbook chapter, or study guide. SmartStudy&apos;s AI generates a deck of flashcards and a multiple-choice quiz in under 30 seconds — ready to use instantly.
                                </p>

                                <div className="mt-8 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">1</div>
                                        <span className="text-sm text-muted-foreground">Paste a YouTube link or upload a PDF (up to 20 MB)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">2</div>
                                        <span className="text-sm text-muted-foreground">AI extracts key concepts and builds your study deck</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">3</div>
                                        <span className="text-sm text-muted-foreground">Review flashcards, take the quiz, and sign up to save</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">✓ <span>Free to try</span></span>
                                    <span className="flex items-center gap-1.5">✓ <span>No credit card</span></span>
                                    <span className="flex items-center gap-1.5">✓ <span>Instant results</span></span>
                                </div>
                            </div>

                            {/* Right: embedded generator */}
                            <div className="bg-[#F5F6FB] rounded-3xl p-5 sm:p-6 border border-[#ECEEF4] shadow-xl shadow-black/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5C6BC0] to-[#404A93] text-white font-black text-xs flex items-center justify-center">S</div>
                                    <span className="font-bold text-[#15172B] text-sm">SmartStudy Generator</span>
                                    <span className="ml-auto text-xs font-medium bg-[#D4F5E5] text-[#1A7A4A] px-2 py-0.5 rounded-full">Free</span>
                                </div>
                                <GeneratorEmbed />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
