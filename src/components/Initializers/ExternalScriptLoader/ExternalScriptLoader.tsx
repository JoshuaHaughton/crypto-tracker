import { memo } from "react";
import Script, { ScriptProps } from "next/script";
import useWhyDidComponentUpdate from "@/lib/hooks/debug/useWhyDidComponentUpdate";
import { FUZZY_SEARCH_SCRIPT } from "@/lib/constants/externalScriptConstants";
import { useExternalScripts } from "./useExternalScripts";

interface IExternalScriptLoaderParams {
  scriptConfig: ScriptProps | ScriptProps[];
}

/**
 * Component for dynamically loading external scripts using Next.js's Script component.
 * This supports either a single script or multiple scripts configurations.
 *
 * @param {IExternalScriptLoaderParams} props - The script configurations for loading.
 * @returns {React.ReactElement} A fragment containing the Script components for the external scripts.
 */
const ExternalScriptLoader: React.FC<IExternalScriptLoaderParams> = ({
  scriptConfig = FUZZY_SEARCH_SCRIPT, // Default to a predefined script if no config provided.
}) => {
  // Debug hook to log component updates and their causes.
  useWhyDidComponentUpdate("ExternalScriptLoader", { scriptConfig });

  // Obtain script element properties from the custom hook.
  const { scriptElementProps } = useExternalScripts({
    scriptConfigs: scriptConfig,
  });

  return (
    <>
      {scriptElementProps.map((elementProps, index) => (
        <Script key={index} {...elementProps} />
      ))}
    </>
  );
};

export default memo(ExternalScriptLoader);
