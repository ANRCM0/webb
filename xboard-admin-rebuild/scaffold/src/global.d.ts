export {};

declare global {
  interface Window {
    settings?: {
      base_url?: string;
      title?: string;
      version?: string;
      logo?: string;
      secure_path?: string;
    };
  }
}

/* Vite `?worker` 导入的类型声明（见 src/lib/monaco.ts） */
declare module "*?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}
