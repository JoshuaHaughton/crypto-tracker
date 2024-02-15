import UFuzzyManager from "@/lib/search/uFuzzyManager";
import { ScriptProps } from "next/script";
import { setSearchIsInitialized } from "../store/search/searchSlice";
import { Dispatch } from "@reduxjs/toolkit";

export interface ScriptConfig extends ScriptProps {
  onLoadNeedsDispatch?: boolean;
  onLoad?: (dispatch: Dispatch<any>) => void;
}

export const FUZZY_SEARCH_SCRIPT: ScriptConfig = {
  src: "https://cdn.jsdelivr.net/npm/@leeoniya/ufuzzy@1.0.14/dist/uFuzzy.iife.min.js",
  strategy: "afterInteractive",
  async: false,
  defer: false,
  id: "uFuzzy",
  onLoadNeedsDispatch: true,
  onLoad: (dispatch) => {
    if (window) {
      console.log("UFuzzy script loaded. window.uFuzzy:", window.uFuzzy);
    }
    UFuzzyManager.initialize();
    dispatch(setSearchIsInitialized());
  },
};

export const EXTERNAL_SCRIPTS = [FUZZY_SEARCH_SCRIPT];
