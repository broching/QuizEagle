import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Quiz Eagle's privacy policy — how we collect, use, and protect your data.",
  alternates: { canonical: "https://quizeagle.com/privacy" },
};

const LAST_UPDATED = "May 28, 2025";

export default function PrivacyPage() {
  return (
    <article>
      <div className="mb-10">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{ background: "#eef0ff", color: "#4255ff" }}
        >
          Legal
        </span>
        <h1 className="text-3xl font-extrabold text-[#1a1d3b] tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#9499c0]">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 sm:p-8 shadow-sm space-y-8 text-[15px] text-[#34384f] leading-relaxed">

        <section>
          <p>
            Quiz Eagle (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates{" "}
            <a href="https://quizeagle.com" className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium">
              quizeagle.com
            </a>{" "}
            (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, and share information
            when you use our Service, and the choices you have about that information.
          </p>
          <p className="mt-3">
            By using Quiz Eagle, you agree to the collection and use of information as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            1. Information We Collect
          </h2>
          <h3 className="text-base font-bold text-[#1a1d3b] mt-4 mb-2">Account Information</h3>
          <p>
            When you create an account, we collect your name and email address through Clerk, our
            authentication provider. You may also sign in via Google or other OAuth providers, in which
            case we receive only the information those providers share with us.
          </p>
          <h3 className="text-base font-bold text-[#1a1d3b] mt-4 mb-2">Uploaded Files</h3>
          <p>
            When you upload a file (PDF, PPTX, DOCX, or video/audio), it is transmitted to our servers
            and then to Google&apos;s Gemini API for AI processing. Files are used solely to generate your
            flashcard deck and quiz. We do not store your uploaded files after processing is complete.
          </p>
          <h3 className="text-base font-bold text-[#1a1d3b] mt-4 mb-2">Generated Content</h3>
          <p>
            If you have an account, the flashcard decks, quiz questions, and study programs generated
            from your files are saved to your account in our Convex database so you can access them later.
          </p>
          <h3 className="text-base font-bold text-[#1a1d3b] mt-4 mb-2">Usage Data</h3>
          <p>
            We collect usage data such as pages visited, features used, and session duration through
            PostHog, our analytics platform. This data is used to understand how the Service is used and
            to improve it. We do not sell this data.
          </p>
          <h3 className="text-base font-bold text-[#1a1d3b] mt-4 mb-2">Log & Error Data</h3>
          <p>
            We automatically collect error and exception information to diagnose bugs and improve stability.
            This may include browser type, error messages, and page URLs at the time of the error.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>To provide, maintain, and improve the Service.</li>
            <li>To generate flashcards and quizzes from your uploaded content.</li>
            <li>To save and retrieve your study decks if you have an account.</li>
            <li>To send transactional emails (account creation, password reset) via Clerk.</li>
            <li>To process payments for paid plans through Clerk Billing.</li>
            <li>To monitor for errors and improve Service stability.</li>
            <li>To understand aggregate usage patterns and improve features.</li>
          </ul>
          <p className="mt-3">
            We do not use your content to train AI models. Your uploaded files are processed by
            Google Gemini according to{" "}
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium"
            >
              Google&apos;s API Terms of Service
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            3. Third-Party Services
          </h2>
          <p>Quiz Eagle uses the following third-party services that may collect or process your data:</p>
          <ul className="list-disc list-outside pl-5 space-y-2 mt-3">
            <li>
              <strong>Clerk</strong> — Authentication, user account management, and billing.{" "}
              <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#4255ff] underline underline-offset-2 font-medium">
                Privacy Policy
              </a>
            </li>
            <li>
              <strong>Convex</strong> — Database storage for your decks, flashcards, and quiz data.{" "}
              <a href="https://www.convex.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-[#4255ff] underline underline-offset-2 font-medium">
                Privacy Policy
              </a>
            </li>
            <li>
              <strong>Google Gemini API</strong> — AI model used to generate flashcards and quizzes
              from your uploaded content.{" "}
              <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-[#4255ff] underline underline-offset-2 font-medium">
                Terms of Service
              </a>
            </li>
            <li>
              <strong>PostHog</strong> — Product analytics and error tracking.{" "}
              <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#4255ff] underline underline-offset-2 font-medium">
                Privacy Policy
              </a>
            </li>
            <li>
              <strong>Google AdSense</strong> — Advertising on free tier pages. Google may use cookies
              to serve ads based on your prior visits to our site or other sites.{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#4255ff] underline underline-offset-2 font-medium">
                Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            4. Cookies
          </h2>
          <p>
            Quiz Eagle uses cookies and similar technologies to maintain your session, remember your
            preferences (such as dark mode), and enable analytics. Third-party services (Google AdSense,
            PostHog) may set their own cookies.
          </p>
          <p className="mt-3">
            You can configure your browser to refuse cookies, but some parts of the Service may not
            function correctly without them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            5. Data Retention
          </h2>
          <p>
            We retain your account data for as long as your account is active. You may delete your
            account at any time from the dashboard settings, which will permanently remove your saved
            decks and personal information.
          </p>
          <p className="mt-3">
            Uploaded files are not retained after processing. Analytics data is retained by PostHog
            according to their data retention policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            6. Your Rights
          </h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-outside pl-5 space-y-2 mt-3">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict certain processing of your data.</li>
            <li>Port your data to another service.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:support@quizeagle.com" className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium">
              support@quizeagle.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            7. Children&apos;s Privacy
          </h2>
          <p>
            Quiz Eagle is not directed at children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have inadvertently collected such
            information, please contact us and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            8. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the
            &quot;Last updated&quot; date at the top of this page. Continued use of the Service after
            any changes constitutes your acceptance of the new policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            9. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:support@quizeagle.com" className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium">
              support@quizeagle.com
            </a>
            .
          </p>
        </section>

      </div>
    </article>
  );
}
