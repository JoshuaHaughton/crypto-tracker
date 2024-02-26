import { useCallback } from "react";
import { ScriptProps } from "next/script";

interface IUseExternalScriptsParams {
  scriptConfigs: ScriptProps | ScriptProps[];
}

interface IUseExternalScriptsState {
  scriptElementProps: ScriptProps[];
}

/**
 * Custom hook for loading external scripts dynamically.
 * It handles both single and multiple script loading scenarios.
 *
 * @param scriptConfigs - Configuration for the script or scripts to be loaded.
 * @returns Object containing scripts array to render
 */
export function useExternalScripts({
  scriptConfigs,
}: IUseExternalScriptsParams): IUseExternalScriptsState {
  // Normalize scriptConfigs to an array to simplify processing.
  const scriptsArray: ScriptProps[] = Array.isArray(scriptConfigs)
    ? scriptConfigs
    : [scriptConfigs];

  // Handles individual script load events.
  const handleScriptLoad = useCallback(
    (e: Event, scriptOnLoad?: (e: Event) => void) => {
      scriptOnLoad?.(e); // Execute individual script's onLoad function if provided.
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
  };
}
