import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Quiz Eagle's terms of service — the rules and guidelines for using our AI flashcard generator.",
  alternates: { canonical: "https://quizeagle.com/terms" },
};

const LAST_UPDATED = "May 28, 2025";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-[#9499c0]">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 sm:p-8 shadow-sm space-y-8 text-[15px] text-[#34384f] leading-relaxed">

        <section>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of Quiz Eagle,
            operated by Quiz Eagle (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including the
            website at{" "}
            <a href="https://quizeagle.com" className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium">
              quizeagle.com
            </a>{" "}
            and all related services (collectively, the &quot;Service&quot;).
          </p>
          <p className="mt-3">
            By accessing or using the Service, you agree to be bound by these Terms. If you do not
            agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            1. Eligibility
          </h2>
          <p>
            You must be at least 13 years old to use Quiz Eagle. By using the Service, you represent
            that you meet this requirement. If you are using the Service on behalf of an organization,
            you represent that you have authority to bind that organization to these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            2. Accounts
          </h2>
          <p>
            Some features of the Service require an account. You are responsible for maintaining the
            confidentiality of your login credentials and for all activity that occurs under your account.
          </p>
          <p className="mt-3">
            You agree to provide accurate and current information when creating your account and to
            update it as needed. We reserve the right to suspend or terminate accounts that violate
            these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            3. Free and Paid Plans
          </h2>
          <p>
            Quiz Eagle offers a free tier that allows you to generate flashcard decks and quizzes
            without an account, subject to usage limits. Paid plans are available that provide higher
            limits and additional features.
          </p>
          <p className="mt-3">
            Paid plans are billed in advance on a recurring basis. You may cancel your paid plan at
            any time. Cancellation takes effect at the end of the current billing period; no partial
            refunds are issued unless required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            4. Acceptable Use
          </h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc list-outside pl-5 space-y-2 mt-3">
            <li>Upload content that infringes any third party&apos;s intellectual property rights.</li>
            <li>Upload content that is unlawful, harmful, threatening, or harassing.</li>
            <li>Attempt to circumvent any usage limits, rate limits, or access controls.</li>
            <li>Reverse engineer, scrape, or extract data from the Service in an automated manner.</li>
            <li>Resell or sublicense access to the Service without our prior written consent.</li>
            <li>Use the Service in any way that could damage, disable, or impair its operation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            5. Your Content
          </h2>
          <p>
            You retain ownership of all files and content you upload to the Service
            (&quot;Your Content&quot;). By uploading content, you grant us a limited, non-exclusive
            license to process it for the sole purpose of providing the Service — specifically,
            generating flashcards and quizzes from your files.
          </p>
          <p className="mt-3">
            You represent that you have all necessary rights to upload Your Content and that it does
            not violate any law or third-party rights. We do not claim ownership of Your Content and
            do not use it to train AI models.
          </p>
          <p className="mt-3">
            Uploaded files are processed transiently and are not stored after generation is complete.
            Generated decks saved to your account remain accessible until you delete them or your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            6. AI-Generated Content
          </h2>
          <p>
            Flashcards, quizzes, and other content generated by Quiz Eagle are produced by AI models
            and may contain inaccuracies or errors. Generated content is provided for study assistance
            only and should not be relied upon as authoritative or verified information.
          </p>
          <p className="mt-3">
            We make no warranties about the accuracy, completeness, or fitness for any particular
            purpose of AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            7. Intellectual Property
          </h2>
          <p>
            The Service, including its design, code, branding, and all content created by us, is
            owned by Quiz Eagle and protected by applicable intellectual property laws. Nothing in
            these Terms grants you any right to use our trademarks, logos, or brand features without
            our prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            8. Disclaimer of Warranties
          </h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
            OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT
            WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            9. Limitation of Liability
          </h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, QUIZ EAGLE SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR
            USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="mt-3">
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL
            NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRIOR TO THE EVENT GIVING RISE TO
            THE CLAIM, OR $50, WHICHEVER IS GREATER.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            10. Indemnification
          </h2>
          <p>
            You agree to indemnify and hold harmless Quiz Eagle and its officers, employees, and
            agents from any claims, damages, or expenses (including reasonable legal fees) arising
            from your use of the Service, Your Content, or your violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            11. Termination
          </h2>
          <p>
            We may suspend or terminate your access to the Service at any time, with or without notice,
            for any reason including violation of these Terms. You may stop using the Service at any
            time by deleting your account.
          </p>
          <p className="mt-3">
            Sections 5 through 10 of these Terms survive any termination.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            12. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. When we do, we will update the &quot;Last
            updated&quot; date at the top of this page. Your continued use of the Service after any
            changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            13. Governing Law
          </h2>
          <p>
            These Terms are governed by the laws of the applicable jurisdiction, without regard to
            conflict of law principles. Any disputes arising from these Terms or the Service shall
            be resolved in the competent courts of that jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            14. Contact
          </h2>
          <p>
            Questions about these Terms? Contact us at{" "}
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
