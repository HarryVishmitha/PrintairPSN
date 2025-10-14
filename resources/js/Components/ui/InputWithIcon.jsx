import * as React from "react"
import { cn } from "@/lib/utils"

export function InputWithIcon({
  className,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  helperText,
  error,
  inputClassName,
  ...props
}) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex h-10 w-full items-center rounded-md border bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error ? "border-destructive" : "border-input",
          className
        )}
      >
        {LeftIcon ? (
          <LeftIcon className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        ) : null}
        <input
          className={cn(
            "h-full w-full bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none",
            LeftIcon && "pl-9",
            RightIcon && "pr-9",
            inputClassName
          )}
          {...props}
        />
        {RightIcon ? (
          <RightIcon className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
        ) : null}
      </div>
      {(helperText || error) && (
        <p
          className={cn(
            "mt-1 text-xs",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}
