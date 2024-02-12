"use client";

import Script, { ScriptProps } from "next/script";

interface IExternalScriptLoaderParams {
  scriptConfig: ScriptProps | ScriptProps[];
}

/**
 * Component to dynamically load a list of scripts using Next.js's Script component.
 *
 * The ExternalScriptLoader takes an array of script configurations and renders a Script component
 * for each, handling the loading strategy, asynchronous loading, deferring, and custom
 * onLoad callbacks as specified in the script configurations.
 *
 * @param {ScriptProps[]} scriptConfig - Either a single script configuration or an array of them.
 * @returns A React Fragment containing a list of Script components for loading external scripts.
 */
const ExternalScriptLoader = ({
  scriptConfig,
}: IExternalScriptLoaderParams) => {
  console.log("ExternalScriptLoader", scriptConfig);

  // Ensure 'scripts' is an array to simplify rendering logic.
  const normalizedScripts = Array.isArray(scriptConfig)
    ? scriptConfig
    : [scriptConfig];

  return (
    <>
      {normalizedScripts.map((script, index) => (
        <Script
          key={index}
          src={script.src}
          strategy={script.strategy}
          async={script.async}
          defer={script.defer}
          onReady={script.onReady}
          onLoad={script.onLoad}
        />
      ))}
    </>
  );
};

export default ExternalScriptLoader;
