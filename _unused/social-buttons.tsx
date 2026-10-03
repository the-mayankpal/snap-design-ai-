import {
  GoogleLogo,
  GithubLogo,
  AppleLogo,
} from "@/components/icons/brand-logos";

const PROVIDERS = [
  { label: "Google", Logo: GoogleLogo },
  { label: "GitHub", Logo: GithubLogo },
  { label: "Apple", Logo: AppleLogo },
];

export function SocialButtons() {
  return (
    <>
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-auth-border" />
        <span className="text-[12px] text-auth-muted">or continue with</span>
        <span className="h-px flex-1 bg-auth-border" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PROVIDERS.map(({ label, Logo }) => (
          <button
            key={label}
            type="button"
            aria-label={`Continue with ${label}`}
            className="flex h-11 items-center justify-center rounded-lg border border-auth-border bg-white text-auth-ink transition-colors hover:bg-black/[0.03]"
          >
            <Logo size={19} />
          </button>
        ))}
      </div>
    </>
  );
}
