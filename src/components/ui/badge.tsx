import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-status-completed text-status-completed-foreground hover:bg-status-completed/80",
        secondary:
          "border-transparent bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/80",
        destructive:
          "border-transparent bg-status-active text-status-active-foreground hover:bg-status-active/80",
        outline: "border-transparent bg-status-hold text-status-hold-foreground hover:bg-status-hold/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
