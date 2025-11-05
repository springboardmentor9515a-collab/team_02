"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DayPicker, useDayPicker, useNavigation } from "react-day-picker"

import { format } from "date-fns"
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  fromYear = new Date().getFullYear() - 10,
  toYear = new Date().getFullYear() + 10,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      fromYear={fromYear}
      toYear={toYear}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({ ...props }) => {
          const { goToMonth } = useNavigation()
          const { month } = useDayPicker() as any

          if (props.name === "months") {
            const months = Array.from({ length: 12 }, (_, i) => new Date(2000, i))
            return (
              <Select
                onValueChange={(value) => {
                  const newDate = new Date(month)
                  newDate.setMonth(parseInt(value))
                  goToMonth(newDate)
                }}
                value={month.getMonth().toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder={format(month, "MMMM")} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m: Date) => (
                    <SelectItem key={m.getMonth()} value={m.getMonth().toString()}>
                      {format(m, "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }

          if (props.name === "years") {
            const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i)
            return (
              <Select
                onValueChange={(value) => {
                  const newDate = new Date(month)
                  newDate.setFullYear(parseInt(value))
                  goToMonth(newDate)
                }}
                value={month.getFullYear().toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder={format(month, "yyyy")} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year: number) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }

          return <></>;
        },
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
