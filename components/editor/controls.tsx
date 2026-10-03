import type { ReactNode } from "react";

/** Section heading with an optional trailing affordance. */
export function SectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex h-9 items-center justify-between px-4">
      <h2 className="text-[13px] font-medium text-ed-text">{title}</h2>
      {trailing ? <span className="text-ed-muted">{trailing}</span> : null}
    </div>
  );
}
