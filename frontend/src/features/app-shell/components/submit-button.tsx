"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  pendingText?: string;
  isLoadingData?: boolean;
}

export function SubmitButton({
  children,
  pendingText = "Envoi...",
  className,
  isLoadingData = false,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || isLoadingData || props.disabled}
      className={cn("w-full", className)}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
