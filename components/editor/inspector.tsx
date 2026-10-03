import { GenerateControls } from "@/components/editor/generate-controls";
import { ZoomControl } from "@/components/editor/zoom-control";
import { ThemeToggle } from "@/components/theme-toggle";

export function Inspector() {
  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto bg-ed-panel">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-ed-border px-4">
        <h2 className="text-[14px] font-medium text-ed-text">Editor</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle
            fallback="dark"
            className="h-9 w-9 rounded-lg bg-ed-field text-ed-text ring-1 ring-inset ring-ed-hairline hover:bg-ed-raised"
          />
          <ZoomControl />
        </div>
      </div>

      <div className="flex-1 pb-8">
        <GenerateControls />
      </div>
    </aside>
  );
}
