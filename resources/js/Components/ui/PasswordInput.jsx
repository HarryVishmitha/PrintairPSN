import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export const PasswordInput = React.forwardRef(
  ({ className, inputClassName, error, helperText, ...props }, ref) => {
    const [show, setShow] = React.useState(false)

    return (
      <div className="w-full">
        <div
          className={cn(
            "relative flex h-10 w-full items-center rounded-md border bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            error ? "border-destructive" : "border-input",
            className
          )}
        >
          <input
            ref={ref}
            type={show ? "text" : "password"}
            className={cn(
              "h-full w-full bg-transparent px-3 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none",
              inputClassName
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
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
)
PasswordInput.displayName = "PasswordInput"
