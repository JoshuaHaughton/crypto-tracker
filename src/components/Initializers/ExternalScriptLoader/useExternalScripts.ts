import { useState, useEffect, useCallback } from "react";
import { ScriptProps } from "next/script";

interface IUseExternalScriptsParams {
  scriptConfigs: ScriptProps | ScriptProps[];
  afterScriptsLoad?: () => void;
}

interface IUseExternalScriptsState {
  scriptElementProps: ScriptProps[];
  allScriptsLoaded: boolean;
}

/**
 * Custom hook for loading external scripts dynamically.
 * It handles both single and multiple script loading scenarios.
 *
 * @param scriptConfigs - Configuration for the script or scripts to be loaded.
 * @param afterScriptsLoad - Callback to be executed once all scripts are successfully loaded.
 * @returns Object containing scripts array to render and a boolean indicating if all scripts are loaded.
 */
export function useExternalScripts({
  scriptConfigs,
  afterScriptsLoad,
}: IUseExternalScriptsParams): IUseExternalScriptsState {
  // Normalize scriptConfigs to an array to simplify processing.
  const scriptsArray: ScriptProps[] = Array.isArray(scriptConfigs)
    ? scriptConfigs
    : [scriptConfigs];
  const [loadedScriptsCount, setLoadedScriptsCount] = useState(0); // Tracks the number of scripts loaded.

  // Increment loaded script count and call afterScriptsLoad if all scripts are loaded.
  useEffect(() => {
    if (loadedScriptsCount === scriptsArray.length) {
      afterScriptsLoad?.(); // Execute the callback once all scripts have loaded.
    }
  }, [loadedScriptsCount, scriptsArray.length, afterScriptsLoad]);

  // Handles individual script load events.
  const handleScriptLoad = useCallback(
    (e: Event, scriptOnLoad?: (e: Event) => void) => {
      scriptOnLoad?.(e); // Execute individual script's onLoad function if provided.
      setLoadedScriptsCount((prevCount) => prevCount + 1); // Increment the loaded scripts count.
    },
    [],
  );

  // Prepare the script elements for rendering.
  const scriptElementProps = scriptsArray.map((script, index) => ({
    ...script,
    onLoad: (e: Event) => handleScriptLoad(e, script.onLoad),
  }));

  // Return the prepared script elements and a boolean indicating if all scripts are loaded.
  return {
    scriptElementProps,
    allScriptsLoaded: loadedScriptsCount === scriptsArray.length,
  };
}
