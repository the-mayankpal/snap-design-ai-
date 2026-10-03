import type { Metadata } from "next";

import { OG_BASE } from "@/components/site";
import Link from "next/link";
import {
  ArrowsClockwiseIcon,
  BabyIcon,
  BuildingsIcon,
  ClockCounterClockwiseIcon,
  CookieIcon,
  DatabaseIcon,
  GearSixIcon,
  GlobeHemisphereWestIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  SparkleIcon,
  UserCheckIcon,
} from "@phosphor-icons/react/ssr";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { LEGAL } from "@/components/legal/legal-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What snapdesign collects, why, who it is shared with, and the choices you have. We never sell your data or train AI on your designs.",
  alternates: { canonical: "/privacy" },
  openGraph: { ...OG_BASE, url: "/privacy", title: "Privacy Policy", description: "What snapdesign collects, why, who it is shared with, and the choices you have. We never sell your data or train AI on your designs." },
};

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    icon: <BuildingsIcon size={16} />,
    body: (
      <p>
        snapdesign is run by {LEGAL.company}, {LEGAL.address}. We are responsible for the personal
        data described here. You can reach us about privacy at{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    heading: "What we collect",
    icon: <DatabaseIcon size={16} />,
    body: (
      <ul>
        <li>
          <strong>Account details</strong> — your name, email address and a password (stored
          securely by our sign-in provider; we never see it in plain text). If you sign in with
          Google, GitHub or Apple, we receive your name and email from them.
        </li>
        <li>
          <strong>What you create</strong> — your prompts and chat messages, images you upload, the
          designs generated for you, and your settings such as ratio and design type.
        </li>
        <li>
          <strong>Payment details</strong> — handled by our payment provider. We receive a record of
          what you bought and the last digits of your card, never the full card number.
        </li>
        <li>
          <strong>Usage and device data</strong> — pages visited, features used, errors, and
          technical details like IP address, browser and device type.
        </li>
        <li>
          <strong>Messages to us</strong> — anything you send when you contact support.
        </li>
      </ul>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use it",
    icon: <GearSixIcon size={16} />,
    body: (
      <>
        <ul>
          <li>
            <strong>To run snapdesign</strong> — generating your designs, saving your work, and
            keeping you signed in. This is necessary to provide the service you asked for.
          </li>
          <li>
            <strong>To keep it safe</strong> — preventing abuse, fraud and content that breaks our{" "}
            <Link href="/terms">Terms</Link>.
          </li>
          <li>
            <strong>To improve it</strong> — understanding which features are used and fixing what
            breaks, using aggregated usage data wherever possible.
          </li>
          <li>
            <strong>To talk to you</strong> — service messages such as receipts and security
            notices, and, only if you opt in, product news. You can unsubscribe at any time.
          </li>
          <li>
            <strong>To meet legal obligations</strong> — such as tax records.
          </li>
        </ul>
        <p>Where the law requires a legal basis, these are contract, legitimate interests, consent and legal obligation respectively.</p>
      </>
    ),
  },
  {
    id: "ai",
    heading: "Your prompts, images and designs",
    icon: <SparkleIcon size={16} />,
    body: (
      <>
        <p>
          To generate a design, we send your prompt and any images you attach to the AI model
          providers that power snapdesign. They process it to produce your design, under contracts
          that restrict them to doing only that.
        </p>
        <p>
          <strong>
            We do not use your prompts, uploads or designs to train AI models, and our providers
            are not permitted to either.
          </strong>{" "}
          We do not show your designs to other users or use them in our marketing without your
          permission.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "Who we share it with",
    icon: <ShareNetworkIcon size={16} />,
    body: (
      <>
        <p>
          <strong>We do not sell your personal data</strong>, and we do not share it for
          advertising. We share it only with:
        </p>
        <ul>
          <li>
            <strong>Service providers</strong> who help run snapdesign — hosting, database and
            sign-in, AI model providers, payments, email and error monitoring — each limited to what
            they need to do their job;
          </li>
          <li>
            <strong>Authorities</strong>, when the law requires it or to protect people&rsquo;s
            safety;
          </li>
          <li>
            <strong>A buyer</strong>, if snapdesign is ever sold or merged, who would have to
            respect this policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "on-your-device",
    heading: "Cookies and storage on your device",
    icon: <CookieIcon size={16} />,
    body: (
      <>
        <p>
          We use essential cookies and your browser&rsquo;s local storage to keep you signed in, to
          remember preferences, and to save work in progress. Your designs, chat history and
          attached images are saved on our servers. Before you have an account, an essential
          cookie links this browser to the designs made in it; clearing your cookies removes that
          link, and those designs can no longer be opened.
        </p>
        <p>
          We do not use advertising cookies. If we add analytics that need consent, we will ask
          first.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep it",
    icon: <ClockCounterClockwiseIcon size={16} />,
    body: (
      <p>
        We keep your account and designs for as long as your account is open. When you delete a
        design it is removed from our systems, and when you close your account we delete your data
        within 30 days — except for records we must keep by law, such as invoices, and short-lived
        backups that expire on their own schedule.
      </p>
    ),
  },
  {
    id: "security",
    heading: "Security",
    icon: <ShieldCheckIcon size={16} />,
    body: (
      <p>
        Data is encrypted in transit and access is limited to people and systems that need it. No
        system is perfectly secure, so if we ever learn of a breach affecting your data, we will
        tell you and the relevant authorities as the law requires.
      </p>
    ),
  },
  {
    id: "rights",
    heading: "Your rights",
    icon: <UserCheckIcon size={16} />,
    body: (
      <>
        <p>Depending on where you live, you can ask us to:</p>
        <ul>
          <li>give you a copy of your data, or send it to another service;</li>
          <li>correct data that is wrong;</li>
          <li>delete your data;</li>
          <li>stop or limit certain uses, including any marketing;</li>
          <li>withdraw consent you have given, at any time.</li>
        </ul>
        <p>
          Email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> and we will respond within 30
          days. You also have the right to complain to your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    heading: "International transfers",
    icon: <GlobeHemisphereWestIcon size={16} />,
    body: (
      <p>
        Our providers may process data in other countries. When data leaves your region, we use
        safeguards the law recognises, such as standard contractual clauses.
      </p>
    ),
  },
  {
    id: "children",
    heading: "Children",
    icon: <BabyIcon size={16} />,
    body: (
      <p>
        snapdesign is not for anyone under {LEGAL.minimumAge}. We do not knowingly collect their
        data, and we delete it if we learn we have.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    icon: <ArrowsClockwiseIcon size={16} />,
    body: (
      <p>
        We will update the date at the top when this policy changes, and tell you by email or in the
        app before any significant change takes effect.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      subtitle="How we collect, use and protect your information."
      introHeading="Your privacy, in plain words"
      title="Privacy Policy"
      intro={
        <p>
          We collect what we need to make your designs and run the service, and nothing more. We
          never sell your data, and we do not train AI models on your prompts or designs. Here is
          the detail.
        </p>
      }
      sections={SECTIONS}
      sibling={{ label: "Terms of Service", href: "/terms" }}
    />
  );
}
