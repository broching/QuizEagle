import { Card, CardContent } from '@/components/ui/card'
import { Zap, BookOpen, Brain, FileText, Video, BarChart3 } from 'lucide-react'

const features = [
    {
        icon: Zap,
        title: "AI in Under 30 Seconds",
        description: "Upload a document or video and watch Quiz Eagle extract key concepts, definitions, and facts — generating a full study deck before you can make a coffee.",
        color: "bg-yellow-50 text-yellow-600",
    },
    {
        icon: BookOpen,
        title: "Interactive Flashcards",
        description: "3D flip cards let you test recall on the go. Shuffle the deck, track your progress card by card, and focus on what you don't know yet.",
        color: "bg-blue-50 text-blue-600",
    },
    {
        icon: Brain,
        title: "Auto-Generated Quizzes",
        description: "Every deck comes with a multiple-choice quiz. Get instant explanations for every answer so you understand the material, not just memorize it.",
        color: "bg-purple-50 text-purple-600",
    },
    {
        icon: FileText,
        title: "PDF, PPTX & DOCX Support",
        description: "Upload textbook chapters, lecture slides, or Word notes — anything up to 20 MB. Quiz Eagle extracts clean text even from dense academic documents.",
        color: "bg-indigo-50 text-indigo-600",
    },
    {
        icon: Video,
        title: "Video & Audio Transcription",
        description: "Turn any lecture recording, documentary, or tutorial into a study deck. Upload MP4, MOV, MP3, or WAV files up to 25 MB — no captions needed.",
        color: "bg-pink-50 text-pink-600",
    },
    {
        icon: BarChart3,
        title: "Track Your Progress",
        description: "Save decks to your dashboard, review attempt history, and watch your quiz scores improve over time. Study smarter with data behind every session.",
        color: "bg-green-50 text-green-600",
    },
]

export default function FeaturesOne() {
    return (
        <section className="py-16 md:py-28 bg-muted/30">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center mb-14">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">How it works</p>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Everything you need to study smarter</h2>
                    <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
                        Quiz Eagle turns passive reading and watching into active recall — the most effective study method proven by cognitive science.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => {
                        const Icon = f.icon
                        return (
                            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="font-bold text-foreground text-base mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
