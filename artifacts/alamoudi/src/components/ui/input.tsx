import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // radius-sm = 14px (brand guide: Inputs Radius 14px)
          "flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 " +
          "text-base shadow-[0_1px_3px_rgba(0,0,0,0.06)] " +
          "transition-all duration-[180ms] ease-out " +
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
          "placeholder:text-muted-foreground " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring " +
          "hover:border-ring/50 " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
