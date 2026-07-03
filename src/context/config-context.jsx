/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { createContext, useContext } from "react";

const Ctx = createContext(null);

export function ConfigProvider({ value, children }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConfig() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfig must be used within ConfigProvider");
  return v;
}
