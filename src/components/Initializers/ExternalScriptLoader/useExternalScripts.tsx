import { ScriptProps } from "next/script";
import { useAppDispatch } from "@/lib/store";
import { ScriptConfig } from "@/lib/constants/externalScriptConstants";
import { curryScriptsWithDispatch } from "@/lib/utils/script.utils";

interface IUseExternalScriptsParams {
  scriptConfigs: ScriptConfig | ScriptConfig[];
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
  const dispatch = useAppDispatch();

  // Normalize scriptConfigs to an array to simplify processing.
  const scriptsArray: ScriptConfig[] = Array.isArray(scriptConfigs)
    ? scriptConfigs
    : [scriptConfigs];

  // Dynamically attach dispatch to scripts that interact with the Redux store.
  const preparedScriptElementProps = curryScriptsWithDispatch(
    scriptsArray,
    dispatch,
  );

  // Return the prepared script elements
  return {
    scriptElementProps: preparedScriptElementProps,
  };
}
