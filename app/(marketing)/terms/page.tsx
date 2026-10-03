import type { Metadata } from "next";

import { OG_BASE } from "@/components/site";
import Link from "next/link";
import {
  ArrowsClockwiseIcon,
  CoinsIcon,
  CopyrightIcon,
  EnvelopeSimpleIcon,
  GavelIcon,
  HandshakeIcon,
  IdentificationCardIcon,
  PaintBrushIcon,
  ProhibitIcon,
  ScalesIcon,
  ShieldWarningIcon,
  SignOutIcon,
  UploadSimpleIcon,
  UserCircleIcon,
  WarningCircleIcon,
  WrenchIcon,
} from "@phosphor-icons/react/ssr";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { LEGAL } from "@/components/legal/legal-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you use snapdesign: your account, acceptable use, credits, and ownership of the designs you make.",
  alternates: { canonical: "/terms" },
  openGraph: { ...OG_BASE, url: "/terms", title: "Terms of Service", description: "The terms that apply when you use snapdesign: your account, acceptable use, credits, and ownership of the designs you make." },
};

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    heading: "Agreeing to these terms",
    icon: <HandshakeIcon size={16} />,
    body: (
      <>
        <p>
          These terms are an agreement between you and {LEGAL.company} (&ldquo;snapdesign&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using snapdesign, you agree
          to them. If you use snapdesign for an organisation, you confirm you can accept these
          terms on its behalf, and &ldquo;you&rdquo; includes that organisation.
        </p>
        <p>If you do not agree, please do not use snapdesign.</p>
      </>
    ),
  },
  {
    id: "eligibility",
    heading: "Who can use snapdesign",
    icon: <IdentificationCardIcon size={16} />,
    body: (
      <p>
        You must be at least {LEGAL.minimumAge} years old, or the age of digital consent where you
        live if that is higher. To buy credits you must be old enough to enter a binding contract.
      </p>
    ),
  },
  {
    id: "account",
    heading: "Your account",
    icon: <UserCircleIcon size={16} />,
    body: (
      <ul>
        <li>Give accurate details when you sign up and keep them up to date.</li>
        <li>
          Keep your password safe. You are responsible for what happens under your account, so tell
          us straight away if you think someone else has access.
        </li>
        <li>One person per account. Do not share or sell accounts.</li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Using snapdesign responsibly",
    icon: <ProhibitIcon size={16} />,
    body: (
      <>
        <p>You agree not to use snapdesign to create, upload or share anything that:</p>
        <ul>
          <li>is illegal, or promotes illegal activity;</li>
          <li>
            infringes someone else&rsquo;s rights, including copyright, trademarks, privacy or
            publicity rights;
          </li>
          <li>sexualises minors in any way, or is sexually explicit;</li>
          <li>harasses, threatens or promotes hatred or violence against anyone;</li>
          <li>
            impersonates a real person, brand or organisation, or is designed to deceive (for
            example fake documents, receipts or official notices);
          </li>
          <li>contains malware or is meant to phish or defraud.</li>
        </ul>
        <p>
          You also agree not to disrupt or overload the service, get around usage limits or
          security, scrape it, or reverse engineer it, and not to use it to build a competing
          product.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    heading: "What you put in",
    icon: <UploadSimpleIcon size={16} />,
    body: (
      <>
        <p>
          Your prompts, messages and uploaded images (&ldquo;inputs&rdquo;) stay yours. You give us
          permission to store, process and transmit them only as needed to run snapdesign for you —
          for example, sending a prompt to the model that generates your design.
        </p>
        <p>
          Only upload material you have the right to use. If you upload a logo, photo or artwork,
          you confirm you own it or have permission to use it this way.
        </p>
      </>
    ),
  },
  {
    id: "your-designs",
    heading: "The designs you generate",
    icon: <PaintBrushIcon size={16} />,
    body: (
      <>
        <p>
          <strong>You own the designs you generate.</strong> To the extent we have any rights in
          them, we assign those rights to you. You can use them for any purpose, including
          commercially, with no attribution to snapdesign.
        </p>
        <p>A few things to know, because designs are made with AI:</p>
        <ul>
          <li>
            Another user who writes a similar prompt may receive a similar design. Ownership of your
            design does not stop others generating their own.
          </li>
          <li>
            In some countries, content generated with AI may not qualify for copyright protection.
            Your ownership is subject to what the law where you are allows.
          </li>
          <li>
            A design can unintentionally resemble an existing logo, brand or work. Before using a
            design as a trademark, logo or in a large campaign, check that it is clear to use.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "credits",
    heading: "Credits, trials and payment",
    icon: <CoinsIcon size={16} />,
    body: (
      <ul>
        <li>
          Generating designs uses credits. The price of credits and what each action costs are shown
          before you buy or spend them.
        </li>
        <li>
          New accounts may get a free trial. Trials are one per person and can end or change at any
          time.
        </li>
        <li>
          Payments are handled by our payment provider. Prices include or exclude tax as shown at
          checkout.
        </li>
        <li>
          Credits are not refundable or exchangeable for cash, except where the law requires
          otherwise. If you are a consumer, nothing here affects your statutory rights.
        </li>
        <li>
          We may change prices for the future. Credits you have already bought keep their value.
        </li>
      </ul>
    ),
  },
  {
    id: "service",
    heading: "Changes to the service",
    icon: <WrenchIcon size={16} />,
    body: (
      <p>
        snapdesign is being actively developed. We may add, change or remove features, and we
        cannot promise it will always be available or free of errors. If we make a change that
        significantly reduces what paid credits get you, we will tell you in advance.
      </p>
    ),
  },
  {
    id: "our-property",
    heading: "Our property",
    icon: <CopyrightIcon size={16} />,
    body: (
      <p>
        snapdesign itself — the software, the name and brand, and the example designs we show on
        our site — belongs to us or our licensors. These terms do not give you any rights in it
        beyond using the service as intended. If you send us feedback or ideas, we may use them
        without owing you anything.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Suspension and closing your account",
    icon: <SignOutIcon size={16} />,
    body: (
      <>
        <p>
          You can stop using snapdesign and close your account at any time. We may suspend or close
          an account that breaks these terms, puts others at risk, or where the law requires us to.
          Where reasonable, we will tell you why and give you a chance to download your designs
          first.
        </p>
        <p>
          The sections on your designs, our property, disclaimers, liability and disputes continue
          to apply after an account is closed.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers",
    icon: <WarningCircleIcon size={16} />,
    body: (
      <p>
        snapdesign is provided &ldquo;as is&rdquo;. Designs are generated automatically and may
        contain mistakes, such as misspelled text, and may not suit your purpose. You are
        responsible for reviewing a design before you publish or rely on it. To the extent the law
        allows, we make no other promises about the service.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limits on liability",
    icon: <ScalesIcon size={16} />,
    body: (
      <>
        <p>
          To the extent the law allows, we are not liable for indirect or consequential losses, or
          for lost profits, revenue or data. Our total liability to you for any claim is limited to
          the greater of the amount you paid us in the 12 months before the claim, or 50 in your
          local currency.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited by law, such as for fraud,
          or for death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    heading: "Your responsibility for misuse",
    icon: <ShieldWarningIcon size={16} />,
    body: (
      <p>
        If someone brings a claim against us because of content you uploaded, or because you used a
        design in breach of these terms or the law, you agree to cover the reasonable costs of that
        claim. This does not apply to consumers where the law does not allow it.
      </p>
    ),
  },
  {
    id: "law",
    heading: "Governing law and disputes",
    icon: <GavelIcon size={16} />,
    body: (
      <p>
        These terms are governed by {LEGAL.jurisdiction}. If you are a consumer, you also keep any
        protection the law of the country you live in gives you, and you can bring a claim there.
        Please contact us first — most problems can be sorted out quickly.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    icon: <ArrowsClockwiseIcon size={16} />,
    body: (
      <p>
        We may update these terms. If a change is significant, we will tell you by email or in the
        app before it takes effect. Continuing to use snapdesign after that means you accept the
        updated terms.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    icon: <EnvelopeSimpleIcon size={16} />,
    body: (
      <p>
        {LEGAL.company}, {LEGAL.address}. Email{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. How we handle your data is covered in
        our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      subtitle="The rules for using snapdesign, and what you can do with your designs."
      introHeading="The short version"
      title="Terms of Service"
      intro={
        <p>
          Be decent, only upload what you have the right to use, and the designs
          you make are yours. The full terms below are what actually apply, so please read them.
        </p>
      }
      sections={SECTIONS}
      sibling={{ label: "Privacy Policy", href: "/privacy" }}
    />
  );
}
