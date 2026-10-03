import Link from "next/link";

export function AuthFooterLink({
  text,
  linkLabel,
  href,
}: {
  text: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="mt-6 text-center text-[13px] text-auth-muted">
      {text}{" "}
      <Link href={href} className="font-medium text-accent hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}
