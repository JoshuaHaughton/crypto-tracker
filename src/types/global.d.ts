import {
  FuzzySearchInstance,
  TUFuzzyConstructor,
} from "@/lib/store/search/searchSlice";

declare global {
  interface Window {
    uFuzzy: TUFuzzyConstructor;
  }
}

export {};
