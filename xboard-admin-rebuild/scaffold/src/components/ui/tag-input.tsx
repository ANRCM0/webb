import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 复刻原件 `W2t`（InputTags，bundle offset ≈6,043,2xx）：
 * 回车或逗号提交、Backspace 删末项、项内 × 删除，输入框随内容伸缩。
 */
export function TagInput({
  value,
  onChange,
  placeholder,
  className,
  id,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const tags = Array.isArray(value) ? value : [];
  const [draft, setDraft] = React.useState("");

  const commit = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    onChange(Array.from(new Set([...tags, text])));
    setDraft("");
  };

  return (
    <div
      className={cn(
        "flex w-full flex-wrap gap-2 rounded-md border border-input px-3 py-2 text-sm shadow-sm",
        "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 h-3 w-3"
            onClick={(e) => {
              e.preventDefault();
              onChange(tags.filter((x) => x !== tag));
            }}
          >
            <IconX className="w-3" />
          </Button>
        </Badge>
      ))}
      <input
        id={id}
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && draft.length === 0 && tags.length > 0) {
            e.preventDefault();
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
      />
    </div>
  );
}
