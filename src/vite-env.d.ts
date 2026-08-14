/// <reference types="vite/client" />

export {}

declare global {
  interface Window {
    __deskoraQuickFile?: File
    __deskoraFile?: File
  }
}
