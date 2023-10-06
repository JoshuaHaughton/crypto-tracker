import nProgress from "nprogress";
import { Router } from "next/router";
import { useEffect } from "react";

export const useRouteEvents = (onComplete) => {
  useEffect(() => {
    Router.events.on("routeChangeStart", nProgress.start);
    Router.events.on("routeChangeError", nProgress.done);
    Router.events.on("routeChangeComplete", nProgress.done);
    Router.events.on("routeChangeComplete", onComplete);

    return () => {
      Router.events.off("routeChangeStart", nProgress.start);
      Router.events.off("routeChangeError", nProgress.done);
      Router.events.off("routeChangeComplete", nProgress.done);
      Router.events.off("routeChangeComplete", onComplete);
    };
  }, [onComplete]);
};
