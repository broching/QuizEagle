'use client'
import Link from 'next/link'
import { Loader2, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '#faq' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { theme } = useTheme()

    const appearance = {
        baseTheme: theme === "dark" ? dark : undefined,
    }

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-3 top-0">
                <div className={cn(
                    'mx-auto mt-3 max-w-6xl transition-all duration-300',
                    isScrolled
                        ? 'max-w-4xl rounded-2xl border border-[#e0e3f5] bg-white/90 backdrop-blur-md shadow-sm shadow-[#4255ff]/10 px-5 py-0'
                        : 'px-4'
                )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-4 py-0 lg:gap-0 lg:py-0">
                        {/* Logo */}
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link href="/" aria-label="home" className="flex items-center space-x-2">
                                <img src="/download.svg" alt="Quiz Eagle" style={{ height: '90px', width: 'auto' }} />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-5 duration-200 text-[#1a1d3b]" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 -rotate-180 scale-0 opacity-0 duration-200 text-[#1a1d3b]" />
                            </button>
                        </div>

                        {/* Desktop nav links */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-7 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-[#6b6f9a] hover:text-[#1a1d3b] block duration-150 font-medium">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA area */}
                        <div className={cn(
                            'in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
                            'bg-white dark:bg-zinc-900 dark:shadow-none dark:lg:bg-transparent'
                        )}>
                            {/* Mobile menu links */}
                            <div className="lg:hidden">
                                <ul className="space-y-5 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-[#6b6f9a] hover:text-[#1a1d3b] block duration-150 font-medium">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit items-center">
                                <AuthLoading>
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="size-5 animate-spin text-[#4255ff]" />
                                    </div>
                                </AuthLoading>

                                <Authenticated>
                                    <Button
                                        asChild
                                        size="sm"
                                        style={{ background: '#4255ff', color: '#fff' }}
                                        className="rounded-xl font-semibold px-4 hover:opacity-90 transition-opacity">
                                        <Link href="/dashboard">
                                            <span>Dashboard</span>
                                        </Link>
                                    </Button>
                                    <UserButton appearance={appearance} />
                                </Authenticated>

                                <Unauthenticated>
                                    <SignUpButton mode="modal">
                                        <Button
                                            size="sm"
                                            style={{ background: '#4255ff', color: '#fff' }}
                                            className="rounded-xl font-semibold px-5 hover:opacity-90 transition-opacity shadow-sm shadow-[#4255ff]/30">
                                            Get Started
                                        </Button>
                                    </SignUpButton>
                                </Unauthenticated>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
