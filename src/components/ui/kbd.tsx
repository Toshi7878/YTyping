import { cva } from "class-variance-authority"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "bottom-card-kbd rounded border border-b-[1px] border-border bg-background px-1.5 py-0.5 text-3xl  transition-transform duration-100 ease-in-out hover:scale-120 md:text-xl",
  {
    variants: {
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "cursor-pointer opacity-80",
      },
    },
  },
)

interface KbdProps {
  disabled?: boolean
  children: ReactNode
  className?: string
}

const Kbd = ({ disabled, children, onClick, className, ...rest }: KbdProps & ComponentPropsWithoutRef<"kbd">) => {
  return (
    <kbd className={cn(kbdVariants({ disabled }), className)} onClick={disabled ? undefined : onClick} {...rest}>
      {children}
    </kbd>
  )
}

export default Kbd
