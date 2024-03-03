import { memo } from "react";
import Script, { ScriptProps } from "next/script";
import { useExternalScripts } from "./useExternalScripts";

interface IExternalScriptLoaderClientParams {
  scriptConfig: ScriptProps | ScriptProps[];
}

/**
 * Client-side component for dynamically loading external scripts using Next.js's Script component.
 * Unlike the server version, this component utilizes the `useExternalScripts` hook,
 * which potentially could incorporate client-specific logic such as dispatching Redux actions
 * upon script load. This component is meant to be used exclusively on the client side,
 * where interaction with the browser's 'window' object is required or when scripts
 * interact with client-side state.
 *
 * Use this component for scripts that need to be executed and managed after the initial
 * server-side rendering, particularly those that include interactions with the client-side
 * store or require access to browser-specific APIs.
 *
 * @param {IExternalScriptLoaderClientParams} props - The configurations for scripts to be loaded.
 *        Can accommodate multiple scripts configuration.
 * @returns {React.ReactElement} A fragment containing Script components for each external script.
 */
const ExternalScriptLoaderClient: React.FC<
  IExternalScriptLoaderClientParams
> = ({
  scriptConfig,
}: IExternalScriptLoaderClientParams): React.ReactElement => {
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

export default memo(ExternalScriptLoaderClient);
