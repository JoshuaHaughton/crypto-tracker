import UFuzzyManager from "@/utils/uFuzzyManager";
import { ScriptProps } from "next/script";

export const FUZZY_SEARCH_SCRIPT: ScriptProps = {
  src: "https://cdn.jsdelivr.net/npm/@leeoniya/ufuzzy@1.0.14/dist/uFuzzy.iife.min.js",
  strategy: "beforeInteractive",
  async: false,
  defer: false,
  // onReady: () => {
  //   UFuzzyManager.initialize();
  //   console.log("UFuzzy loaded");
  // },
};

export const EXTERNAL_SCRIPTS = [FUZZY_SEARCH_SCRIPT];
