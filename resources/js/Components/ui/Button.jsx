import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        subtle: "bg-muted text-foreground hover:bg-muted/80",
        shadow: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90",
      },
      size: {
        default: "h-10 gap-2 px-4 py-2",
        sm: "h-9 gap-1.5 rounded-md px-3",
        lg: "h-11 gap-2.5 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      rounded: {
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      rounded: "md",
    },
  }
)

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      fullWidth = false,
      rounded = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, fullWidth, rounded }),
          loading && "cursor-wait",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : LeftIcon ? (
          <LeftIcon className="mr-2 h-4 w-4" />
        ) : null}
        <span className="inline-flex items-center">{children}</span>
        {RightIcon ? <RightIcon className="ml-2 h-4 w-4" /> : null}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }