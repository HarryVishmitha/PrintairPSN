import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const RequiredMark = () => (
  <span className="ml-1 align-middle text-destructive" aria-hidden>
    *
  </span>
)

const OptionalMark = () => (
  <span className="ml-1 align-middle text-muted-foreground text-xs" aria-hidden>
    (optional)
  </span>
)

const Label = React.forwardRef(
  ({ className, required, optional, children, ...props }, ref) => (
    <label ref={ref} className={cn(labelVariants(), className)} {...props}>
      {children}
      {required ? <RequiredMark /> : optional ? <OptionalMark /> : null}
    </label>
  )
)
Label.displayName = "Label"

export { Label }