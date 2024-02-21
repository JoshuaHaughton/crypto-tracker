import React, { useState, useEffect } from "react";
import Script, { ScriptProps } from "next/script";
import { FUZZY_SEARCH_SCRIPT } from "@/lib/constants/externalScriptConstants";
import useWhyDidComponentUpdate from "@/lib/hooks/debug/useWhyDidComponentUpdate";
import { useExternalScripts } from "./useExternalScripts";

interface IExternalScriptLoaderParams {
  scriptConfig: ScriptProps | ScriptProps[];
  /**
   * Optional callback to be called once after all scripts have loaded.
   * This is useful for initializing or executing logic dependent on multiple scripts,
   * ensuring all scripts are loaded before proceeding.
   */
  afterScriptsLoad?: () => void;
}

/**
 * Dynamically loads external scripts using Next.js's Script component.
 * It supports loading a single script or an array of scripts.
 *
 * @param scriptConfig Either a single script configuration or an array of script configurations.
 * @param onLoad Optional callback executed after all scripts have loaded. Useful for post-load operations.
 * @returns A React Fragment containing Script components for loading external scripts.
 */
const ExternalScriptLoader: React.FC<IExternalScriptLoaderParams> = ({
  scriptConfig = FUZZY_SEARCH_SCRIPT,
  afterScriptsLoad,
}) => {
  useWhyDidComponentUpdate("ExternalScriptLoader", {
    scriptConfig,
    afterScriptsLoad,
  });
  console.log("ExternalScriptLoader render");
  const { scriptElementProps } = useExternalScripts({
    scriptConfigs: scriptConfig,
    afterScriptsLoad,
  });

  return (
    <>
      {scriptElementProps.map((elementProps, index) => (
        <Script key={index} {...elementProps} />
      ))}
    </>
  );
};

export default React.memo(ExternalScriptLoader);
