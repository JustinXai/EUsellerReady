/// <reference path="../.astro/types.d.ts" />

// GA4 gtag type declaration
interface Window {
  gtag: (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
}