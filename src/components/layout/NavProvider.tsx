"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HeaderA } from "./HeaderA";
import { HeaderB } from "./HeaderB";
import { HeaderC } from "./HeaderC";

function NavSelector() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("nav") || "a";

  switch (variant) {
    case "b":
      return <HeaderB />;
    case "c":
      return <HeaderC />;
    default:
      return <HeaderA />;
  }
}

export function NavProvider() {
  return (
    <Suspense fallback={<HeaderA />}>
      <NavSelector />
    </Suspense>
  );
}
