/**
 * The facts the Terms and Privacy Policy depend on, in one place. Anything in
 * [brackets] is a placeholder that must be filled in before launch — it shows
 * on the live pages as-is, deliberately, so an unfilled value is obvious.
 *
 * Have both documents reviewed by a lawyer before relying on them.
 */
export const LEGAL = {
  /** The registered company that operates snapdesign. */
  company: "[Company legal name]",
  /** Where legal notices, data requests and general contact go. */
  email: "me.mayank.pal@gmail.com",
  /** Registered postal address. */
  address: "[Registered address]",
  /** Law that governs the Terms, and where disputes are heard. */
  jurisdiction: "[Governing law and courts, e.g. the laws of England and Wales]",
  /** Minimum age to hold an account. */
  minimumAge: 16,
  /** Shown as "Last updated" on both pages. Change it whenever either changes. */
  updated: "26 September 2026",
} as const;
