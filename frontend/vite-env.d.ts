/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_API_MODE: 'mock' | 'live';
  readonly VITE_GEMINI_API_KEY: string;
  // add more env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}