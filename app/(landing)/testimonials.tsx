import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Chen',
        role: 'Medical Student',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        quote: 'I uploaded my pharmacology lecture PDFs and had flashcards ready in under a minute. My exam scores went up 15% after switching to Quiz Eagle.',
    },
    {
        name: 'Marcus Williams',
        role: 'Computer Science Undergrad',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        quote: 'I upload lecture recordings and coding tutorial videos and instantly get quiz questions. Way better than rewatching 2-hour videos the night before an exam.',
    },
    {
        name: 'Priya Sharma',
        role: 'Law Student',
        image: 'https://randomuser.me/api/portraits/women/68.jpg',
        quote: 'Case summaries, statutes, lecture notes — Quiz Eagle handles them all. The AI-generated quiz explanations are surprisingly accurate for legal content.',
    },
    {
        name: 'Tom Eriksson',
        role: 'High School Teacher',
        image: 'https://randomuser.me/api/portraits/men/75.jpg',
        quote: 'I use Quiz Eagle to create review materials for my students. What used to take me an hour to make now takes 30 seconds. Absolute game changer.',
    },
    {
        name: 'Aisha Okonkwo',
        role: 'MBA Candidate',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        quote: 'Between classes, case studies, and internship prep, I have zero time to make flashcards manually. Quiz Eagle does it for me instantly.',
    },
    {
        name: 'Diego Ramírez',
        role: 'Language Learner',
        image: 'https://randomuser.me/api/portraits/men/54.jpg',
        quote: 'I upload Spanish podcast transcripts and get vocabulary flashcards automatically. The 3D flip cards make drilling fun instead of a chore.',
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section className="py-16 md:py-28">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center mb-14">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Student Stories</p>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Loved by learners everywhere</h2>
                    <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
                        From med school to coding bootcamps — students use Quiz Eagle to study faster and remember more.
                    </p>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonialChunks.map((chunk, chunkIndex) => (
                        <div key={chunkIndex} className="space-y-4">
                            {chunk.map(({ name, role, quote, image }, index) => (
                                <Card key={index} className="border shadow-sm">
                                    <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                        <Avatar className="size-9">
                                            <AvatarImage alt={name} src={image} loading="lazy" width="120" height="120" />
                                            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-sm">{name}</h3>
                                            <span className="text-muted-foreground block text-xs tracking-wide">{role}</span>
                                            <blockquote className="mt-3">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{quote}</p>
                                            </blockquote>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
