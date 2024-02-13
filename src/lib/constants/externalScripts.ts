import UFuzzyManager from "@/utils/uFuzzyManager";
import { ScriptProps } from "next/script";

export const FUZZY_SEARCH_SCRIPT: ScriptProps = {
  src: "https://cdn.jsdelivr.net/npm/@leeoniya/ufuzzy@1.0.14/dist/uFuzzy.iife.min.js",
  strategy: "afterInteractive",
  async: false,
  defer: false,
  onLoad: () => {
    console.log("UFuzzy script loaded. window.uFuzzy:", window?.uFuzzy);
    UFuzzyManager.initialize();
  },
};

export const EXTERNAL_SCRIPTS = [FUZZY_SEARCH_SCRIPT];
