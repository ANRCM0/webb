import { QueryClient } from "@tanstack/react-query";

/** 原件默认行为：无全局 staleTime，页面自行声明 refetchInterval（节点列表 30s、排序模式暂停） */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
