import React from 'react'
import { HeroHeader } from "./header"
import GeneratorEmbed from "./generator-embed"
import { Zap } from 'lucide-react'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <section style={{ background: '#f0f2fc' }} className="min-h-screen">
                <div className="mx-auto max-w-xl px-4 sm:px-6 pt-24 pb-20">

                    {/* Compact badge */}
                    <div className="flex justify-center mb-5">
                        <span className="inline-flex items-center gap-1.5 bg-white text-[#4255ff] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm border border-[#dde0f5] tracking-wide uppercase">
                            <Zap size={11} className="fill-[#4255ff]" />
                            AI-powered · Free
                        </span>
                    </div>

                    {/* Headline — short, bold, centered */}
                    <h1
                        className="text-center font-black leading-tight tracking-tight mb-2"
                        style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: '#1a1d3b' }}
                    >
                        Turn any document or video into{' '}
                        <span style={{ color: '#4255ff' }}>flashcards & a quiz</span>
                    </h1>

                    <p className="text-center text-sm font-medium mb-7" style={{ color: '#6b6f9a' }}>
                        Upload a PDF, PPTX, DOCX, or video — ready in under 30 seconds
                    </p>

                    {/* Widget card — the main focus */}
                    <div
                        className="rounded-2xl p-4 sm:p-5"
                        style={{
                            background: '#ffffff',
                            boxShadow: '0 4px 24px rgba(66,85,255,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                            border: '1px solid #e0e3f5',
                        }}
                    >
                        <GeneratorEmbed />
                    </div>

                    {/* Minimal trust line */}
                    <p className="text-center text-xs mt-5 font-medium" style={{ color: '#9499c0' }}>
                        No sign-up needed &nbsp;·&nbsp; Free to use &nbsp;·&nbsp; Save to dashboard when you&apos;re ready
                    </p>
                </div>
            </section>
        </>
    )
}
