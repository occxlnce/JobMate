
import * as React from "react"
import { cn } from "@/lib/utils"

const ExternalLink = React.forwardRef<
  HTMLAnchorElement, 
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, ...props }, ref) => {
  return (
    <a 
      ref={ref} 
      className={cn("inline-flex items-center", className)} 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
    >
      {children}
    </a>
  )
})
ExternalLink.displayName = "ExternalLink"

export { ExternalLink }
