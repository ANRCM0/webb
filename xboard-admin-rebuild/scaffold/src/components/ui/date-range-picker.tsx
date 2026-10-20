import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** 复刻原件优惠券有效期控件：触发按钮显示「起 - 止」，弹层内为双月范围日历。 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "选择日期范围",
  className,
}: {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-9 w-full justify-start gap-0 font-mono text-xs font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "yyyy-MM-dd HH:mm")} - {format(value.to, "yyyy-MM-dd HH:mm")}
              </>
            ) : (
              format(value.from, "yyyy-MM-dd HH:mm")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
