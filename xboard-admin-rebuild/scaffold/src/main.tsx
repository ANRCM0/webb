import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./lib/i18n";
import "./styles/globals.css";
import { router } from "./router";

const qc = new QueryClient();

/** 原件根节点挂 `<Toaster richColors position="top-right"/>`（bundle byte 4,437,426），此处对齐。 */
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);
