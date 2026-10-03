import { PlusIcon, XIcon } from "@phosphor-icons/react/ssr";

/** Also feeds the FAQPage structured data on the home page. */
export const FAQS = [
  {
    q: "What can I generate with snapdesign?",
    a: "Websites, marketing visuals, slides, invoices and graphic design — posters, ads, social posts. Each one comes back as a high-resolution image you can refine and download.",
  },
  {
    q: "Do I need design experience?",
    a: "No. Describe what you want in plain words and snapdesign handles the layout, type and color. If something is not right, say so and ask for another version.",
  },
  {
    q: "Who owns the designs I generate?",
    a: "You do. Everything you make is yours to use commercially, with no attribution required.",
  },
  {
    q: "What makes it different from other AI tools?",
    a: "Most AI tools hand back something that looks AI-made. snapdesign returns real layouts, considered type and proper spacing — work you would be happy to put your name on.",
  },
  {
    q: "How does pricing work?",
    a: "Designs are metered in credits, and there is a free trial so you can try it properly before you pay.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-6 pb-28"
    >
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-ink-900">
        FAQ
      </p>

      <h2 className="mx-auto mt-4 max-w-[520px] text-center font-serif text-[clamp(2rem,4.2vw,3rem)] font-bold leading-[1.12] tracking-[-0.025em] text-ink-900">
        Frequently asked questions
      </h2>

      <div className="mx-auto mt-10 flex max-w-[640px] flex-col gap-2.5">
        {/* Native <details>: every browser toggles it on tap with no
            JavaScript, so it cannot get stuck open, and each question opens
            and closes on its own. The first starts open. */}
        {FAQS.map(({ q, a }, index) => (
          <details
            key={q}
            open={index === 0}
            className="group rounded-[18px] border border-transparent bg-surface-muted transition-[background-color,border-color,box-shadow] duration-300 ease-out open:border-line open:bg-surface open:shadow-[0_1px_2px_rgba(20,15,10,0.04),0_10px_30px_-12px_rgba(20,15,10,0.16)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2.5 pl-6 pr-2.5 text-left [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden">
              <h3 className="text-[17px] font-medium text-ink-900">{q}</h3>
              {/* Closed: solid black with a white plus. Open: a quiet chip
                  with a cross, so the answer is what carries. */}
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-ink-900 text-surface transition-colors group-open:bg-surface-muted group-open:text-ink-500"
              >
                <PlusIcon size={15} className="group-open:hidden" />
                <XIcon size={15} className="hidden group-open:block" />
              </span>
            </summary>
            <p className="faq-answer px-6 pb-6 pr-16 text-[14px] leading-relaxed text-ink-500">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
