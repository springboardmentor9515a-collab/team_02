/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add other VITE_ env variables you use here, e.g.
  // readonly VITE_SOME_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
