import { useEffect } from "react";

interface IScriptOptions {
  src: string; // The source URL of the script to load
  async?: boolean; // Load script asynchronously
  defer?: boolean; // Defer loading of the script
  onload?: () => void; // Callback function to execute once the script is loaded
}

/**
 * Custom hook to dynamically load external scripts.
 *
 * @param scriptInput A single script configuration or an array of script configurations.
 * Each configuration includes the source URL and optionally, async, defer flags, and an onload callback.
 *
 * This hook ensures each script is loaded exactly once, even if the hook is called
 * multiple times with the same script source. It dynamically creates a script element
 * for each provided source URL, attaches it to the document, and sets the provided
 * options. The hook also cleans up the added scripts from the DOM when the component
 * using it unmounts.
 */
export const useScriptLoader = (
  scriptInput: IScriptOptions | IScriptOptions[],
): void => {
  // Normalize scriptInput to always be an array
  const scripts = Array.isArray(scriptInput) ? scriptInput : [scriptInput];

  useEffect(() => {
    const scriptElements: HTMLScriptElement[] = [];

    scripts.forEach(({ src, async = false, defer = false, onload }) => {
      const scriptId = `script-loader-${src}`;

      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = src;
        script.async = async;
        script.defer = defer;
        script.onload = () => {
          onload?.(); // Execute onload if provided
        };

        document.body.appendChild(script);
        scriptElements.push(script);
      }
    });

    return () => {
      // Cleanup: Remove the scripts from the DOM on component unmount.
      scriptElements.forEach((script) => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
    // The hook should only run once on the initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
