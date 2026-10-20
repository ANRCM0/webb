import { Toaster as Sonner } from "sonner";

/** 原件同时打包 sonner 与旧 useToast；重建保留 sonner 作为统一出口 */
export function Toaster() {
  return <Sonner position="top-center" richColors closeButton />;
}

export { toast } from "sonner";
