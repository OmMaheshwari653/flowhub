"use client";

import { Loader2Icon } from "lucide-react";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

/*
 * useLinkStatus sirf <Link> ke andar (descendant me) chalta hai. Jab tak agla
 * route load ho raha hai, ye chhota spinner dikha deta hai - to click "lag"
 * nahi lagta, turant response feel hota hai.
 */
export const LinkPendingIndicator = ({ className }: { className?: string }) => {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <Loader2Icon className={cn("size-3.5 animate-spin opacity-60", className)} />
  );
};
