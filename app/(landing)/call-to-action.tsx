import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PixelCard from '@/components/react-bits/pixel-card'

export default function CallToAction() {
    return (
        <section className="py-16 px-6">
            <div className="mx-auto max-w-5xl rounded-3xl px-6 py-12 md:py-20 lg:py-32">
                <PixelCard variant="blue" className="w-full max-w-5xl h-auto aspect-[16/9]">
                    <div className="absolute text-center px-6">
                        <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-3">Get started free</p>
                        <h2 className="text-balance text-4xl font-extrabold lg:text-5xl text-white">Study smarter, not harder</h2>
                        <p className="mt-4 text-white/80 text-lg max-w-md mx-auto">
                            Turn any PDF or YouTube video into flashcards and quizzes in seconds. No credit card required.
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <Button asChild size="lg" className="bg-white text-[#5C6BC0] hover:bg-white/90 font-bold">
                                <Link href="/dashboard">
                                    <span>Start for Free</span>
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:text-white">
                                <Link href="#how-it-works">
                                    <span>See how it works</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </PixelCard>
            </div>
        </section>
    )
}
