import * as React from "react";

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={`shrink-0 bg-border h-[1px] w-full my-2 ${className ?? ""}`}
      {...props}
    />
  );
}
