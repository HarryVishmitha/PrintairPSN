import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-md",
        outline: "border-2",
        ghost: "border-transparent shadow-none",
      },
      hover: {
        none: "",
        lift: "hover:shadow-lg",
        border: "hover:border-primary/50",
        glow: "hover:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      rounded: {
        md: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      padding: "none",
      rounded: "md",
    },
  }
)

const Card = React.forwardRef(
  ({ className, variant, hover, padding, rounded, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, padding, rounded }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }