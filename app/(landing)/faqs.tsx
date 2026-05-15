export default function FAQs() {
    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">FAQ</p>
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p className="text-muted-foreground">Can&apos;t find an answer? <a href="mailto:support@smartstudy.app" className="text-primary underline underline-offset-4">Email us</a>.</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-semibold">Is SmartStudy really free to use?</h3>
                            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                Yes — you can generate flashcard decks and quizzes without signing up, completely free. Creating an account lets you save decks to your dashboard and track your quiz progress over time. We offer paid plans for power users who need higher limits.
                            </p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-semibold">What file types and sizes are supported?</h3>
                            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                SmartStudy supports PDF files up to 20 MB. Text must be selectable (not a scanned image). For YouTube, any public video with captions enabled works — just paste the URL. We support standard, Shorts, and embed formats.
                            </p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-semibold">How accurate are the AI-generated flashcards?</h3>
                            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                SmartStudy uses Google&apos;s Gemini model to identify key concepts, definitions, and facts from your content. Accuracy is high for well-structured academic material. We always recommend reviewing the generated deck before your exam to catch any gaps.
                            </p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-semibold">Can I save and revisit my decks?</h3>
                            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                Yes — sign up for a free account and every deck you generate is saved to your personal dashboard. You can review flashcards, retake quizzes, and track your score history at any time.
                            </p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-semibold">How long does generation take?</h3>
                            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                                Most decks are ready in under 30 seconds. Longer PDFs or videos may take up to a minute. We process your content with Gemini 2.5 Flash, one of the fastest AI models available, so wait times are minimal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
