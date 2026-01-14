"use client";

import { ReactQueryProvider } from "@/providers/react-query";
import type * as React from "react";

export default function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
