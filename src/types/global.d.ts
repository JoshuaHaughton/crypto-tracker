import { FuzzySearchInstance } from "@/lib/store/search/searchSlice";

declare global {
  interface Window {
    uFuzzy: (opts?: any) => FuzzySearchInstance;
  }
}

export {};
