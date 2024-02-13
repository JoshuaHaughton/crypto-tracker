import React, { useState, useEffect } from "react";
import Script, { ScriptProps } from "next/script";
import { FUZZY_SEARCH_SCRIPT } from "@/lib/constants/externalScripts";

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
  const scriptsArray = Array.isArray(scriptConfig)
    ? scriptConfig
    : [scriptConfig];
  const [loadedScripts, setLoadedScripts] = useState<number>(0);

  useEffect(() => {
    // Check if all scripts have loaded
    if (loadedScripts === scriptsArray.length) {
      afterScriptsLoad?.();
    }
  }, [loadedScripts, scriptsArray.length, afterScriptsLoad]);

  const handleScriptLoad = (e: any, scriptOnLoad?: (e: any) => void) => {
    scriptOnLoad?.(e); // Call the individual script's onLoad if provided
    // Increment the count of loaded scripts
    setLoadedScripts((prevLoaded) => prevLoaded + 1);
  };

  return (
    <>
      {scriptsArray.map((script, index) => (
        <Script
          key={index}
          {...script}
          onLoad={(e) => handleScriptLoad(e, script.onLoad)}
        />
      ))}
    </>
  );
};

export default ExternalScriptLoader;
