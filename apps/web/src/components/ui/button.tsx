import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 text-center rounded font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-cyan-ink hover:text-white",
        cyan: "bg-cyan text-ink hover:bg-cyan-hover",
        outline: "border border-line bg-white text-ink hover:border-cyan-ink hover:text-cyan-ink",
        ghost: "text-ink hover:bg-paper",
        link: "rounded-none px-0 text-cyan-ink underline-offset-4 hover:underline",
      },
      size: {
        sm: "min-h-9 px-4 py-1.5 text-[13px]",
        default: "min-h-11 px-5 py-2 text-sm",
        lg: "min-h-12 px-6 py-2.5 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render the child element (for example a Next.js Link) with button styles. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
