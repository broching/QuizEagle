import Link from "next/link"
import Image from "next/image"

const navLinks = [
    { title: "Features", href: "#" },
    { title: "Pricing", href: "#pricing" },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
    { title: "Dashboard", href: "/dashboard" },
]

const legalLinks = [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
]

export default function FooterSection() {
    return (
        <footer
            className="border-t pt-14 pb-10"
            style={{ background: "#f0f2fc", borderColor: "#e0e3f5" }}
        >
            <div className="mx-auto max-w-5xl px-6">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/download.svg"
                            alt="Quiz Eagle"
                            height={60}
                            width={200}
                            style={{ height: 60, width: "auto" }}
                            priority={false}
                        />
                    </Link>
                </div>

                {/* Nav links */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm mb-4">
                    {navLinks.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="font-medium transition-colors duration-150 hover:opacity-100"
                            style={{ color: "#6b6f9a" }}
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* Legal links */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs mb-8">
                    {legalLinks.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="transition-colors duration-150 hover:opacity-100"
                            style={{ color: "#9499c0" }}
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* Social */}
                <div className="flex justify-center gap-5 mb-8">
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X / Twitter"
                        className="transition-opacity hover:opacity-70"
                        style={{ color: "#9499c0" }}
                    >
                        <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z" />
                        </svg>
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="transition-opacity hover:opacity-70"
                        style={{ color: "#9499c0" }}
                    >
                        <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
                        </svg>
                    </Link>
                </div>

                {/* Divider */}
                <div className="mb-6" style={{ borderTop: "1px solid #e0e3f5" }} />

                <p className="text-center text-xs" style={{ color: "#9499c0" }}>
                    © {new Date().getFullYear()} Quiz Eagle. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
