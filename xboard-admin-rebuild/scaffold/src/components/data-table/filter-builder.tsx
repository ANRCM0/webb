import * as React from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { Filter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type FilterFieldType = "text" | "number" | "date" | "select" | "boolean";
export interface FilterField {
  /** 列 id */
  value: string;
  label: string;
  type: FilterFieldType;
  unit?: string;
  options?: { label: string; value: string }[];
  operators: { label: string; value: string }[];
}
export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

/**
 * 复刻原件过滤器构建器：字段带类型/单位/操作符集合，产出 `field=op:value` 形式的查询串。
 * 原件示例：email(contains|eq)、id(eq|gt|lt)、total_used(gt|lt|eq, GB)、expired_at(date)、is_admin(boolean)
 */
export function FilterBuilder({
  fields, rules, onRulesChange, onApply,
}: {
  fields: FilterField[];
  rules: FilterRule[];
  onRulesChange: (rules: FilterRule[]) => void;
  onApply?: (query: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<FilterRule>({ id: "", field: fields[0]?.value ?? "", operator: fields[0]?.operators[0]?.value ?? "eq", value: "" });

  const fieldOf = (v: string) => fields.find((f) => f.value === v);
  const active = rules.length > 0;

  const add = () => {
    if (!draft.value) return;
    onRulesChange([...rules, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ ...draft, value: "" });
  };

  const query = rules.map((r) => `${r.field}=${r.operator}:${r.value}`).join("&");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Filter className="mr-1 h-4 w-4" /> 筛选
            {active && (
              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {rules.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] space-y-3" align="start">
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <Select value={draft.field} onValueChange={(v) => setDraft({ ...draft, field: v, operator: fieldOf(v)?.operators[0]?.value ?? "eq" })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={draft.operator} onValueChange={(v) => setDraft({ ...draft, operator: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(fieldOf(draft.field)?.operators ?? []).map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input className="h-8" placeholder={fieldOf(draft.field)?.unit ? `数值（${fieldOf(draft.field)?.unit}）` : "值"} value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" onClick={() => { add(); setOpen(false); }}>
              <Plus className="mr-1 h-4 w-4" /> 添加
            </Button>
          </div>
          {rules.length > 0 && (
            <div className="space-y-1 border-t pt-2">
              {rules.map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">{fieldOf(r.field)?.label ?? r.field}</Badge>
                  <span className="text-muted-foreground">{fieldOf(r.field)?.operators.find((o) => o.value === r.operator)?.label}</span>
                  <span className="truncate">{r.value}</span>
                  <Button variant="ghost" size="icon" className="ml-auto h-5 w-5" onClick={() => onRulesChange(rules.filter((x) => x.id !== r.id))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => onApply?.(query)}>
                应用
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {active && (
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onRulesChange([])}>
          重置
          <X className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/** 把 FilterRule[] 映射成 TanStack 的 columnFilters（原件用同样的字段名） */
export function toColumnFilters(rules: FilterRule[]): ColumnFiltersState {
  return rules.map((r) => ({ id: r.field, value: r.value }));
}
