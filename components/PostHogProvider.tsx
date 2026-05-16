"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

function PostHogIdentify() {
  const { userId } = useAuth();
  const { user } = useUser();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    if (userId && user) {
      ph.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    } else {
      ph.reset();
    }
  }, [userId, user, ph]);

  return null;
}

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
    ui_host: "https://us.posthog.com",
    capture_pageview: false, // handled manually above
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
        <PostHogIdentify />
      </Suspense>
      {children}
    </PHProvider>
  );
}
