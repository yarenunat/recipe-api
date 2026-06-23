import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
 "flex min-h-[120px] w-full rounded-2xl border border-slate-200/50 bg-white/60 px-4 py-3 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass transition-all resize-none",
 className
 )}
 ref={ref}
 {...props}
 />
 )
 }
)
Textarea.displayName = "Textarea"

export { Textarea }
