import { FAQS } from "@/components/faq";
import { LEGAL } from "@/components/legal/legal-data";
import { SITE } from "@/components/site";

/**
 * /llms.txt — a plain-markdown summary of the site for AI assistants
 * (the llmstxt.org convention). Built from the same site config and FAQ the
 * pages use, so it stays in step with them. Only public pages are listed.
 */
export const dynamic = "force-static";

const page = (path: string) => `${SITE.url}${path}`;

export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

snapdesign is an AI design generator. You describe what you need in a sentence, it returns a finished, high-resolution design, and you can ask for another version or refine it in a chat before downloading. It makes websites and landing pages, marketing visuals and social posts, slide decks, invoices, and graphic design such as posters and ads. Designs are yours to use commercially, with no attribution required.

How it works: Describe (write what you want in plain words) → Design (snapdesign lays out type, color and spacing, and you can try other versions) → Download (export the finished design in high resolution).

## Pages

- [Home](${page("/")}): what snapdesign makes, how it works, and the FAQ
- [Mockups & AI design examples](${page("/showcase")}): real designs made with snapdesign from a written description
- [How it works](${page("/#how-it-works")}): the three steps, Describe, Design and Download
- [About](${page("/about")}): the idea behind snapdesign and what the team believes about design
- [Create an account](${page("/signup")}): start designing with a free trial

## FAQ

${FAQS.map(({ q, a }) => `- **${q}** ${a}`).join("\n")}

## Privacy

Full policy: [Privacy Policy](${page("/privacy")})

- **No AI training.** Prompts, uploaded images and generated designs are never used to train AI models, and snapdesign's AI providers are not permitted to either.
- **Never sold.** Personal data is not sold or shared for advertising.
- **Private by default.** Designs are not shown to other users or used in marketing without permission.
- **Limited sharing.** Prompts and attached images go to the AI model providers only to generate the design, under contracts that restrict them to that. Other data is shared only with the service providers that run snapdesign (hosting, database and sign-in, payments, email, error monitoring), or when the law requires it.
- **No advertising cookies.** Only essential cookies and browser storage, to keep people signed in and save work.
- **Deletion.** Deleting a design removes it; closing an account deletes the data within 30 days, apart from records the law requires (such as invoices).
- **Your rights.** Anyone can ask for a copy of their data, a correction or deletion by emailing ${LEGAL.email}; replies within 30 days.

## Terms

- [Terms of Service](${page("/terms")}): accounts, acceptable use, credits and ownership of designs
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
