import { memo } from "react";
import Script, { ScriptProps } from "next/script";

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
  scriptConfig,
}) => {
  // Normalize scriptConfigs to an array to simplify processing.
  const scriptsArray: ScriptProps[] = Array.isArray(scriptConfig)
    ? scriptConfig
    : [scriptConfig];

  return (
    <>
      {scriptsArray.map((elementProps, index) => (
        <Script key={index} {...elementProps} />
      ))}
    </>
  );
};

export default memo(ExternalScriptLoader);
