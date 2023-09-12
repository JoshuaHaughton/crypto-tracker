import { Provider, useDispatch } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import store from "../src/store";
import "../styles/globals.css";
import nProgress from "nprogress";
import { Router } from "next/router";

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: true,
});

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

Router.events.on("routeChangeComplete", () => {
  window.scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

function MyApp({ Component, pageProps }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(mediaQueryActions.setBreakpoint380(window.innerWidth <= 380));
    dispatch(mediaQueryActions.setBreakpoint520(window.innerWidth <= 520));
    dispatch(mediaQueryActions.setBreakpoint555(window.innerWidth <= 555));
    dispatch(mediaQueryActions.setBreakpoint680(window.innerWidth <= 680));
    dispatch(mediaQueryActions.setBreakpoint1040(window.innerWidth <= 1040));
    dispatch(mediaQueryActions.setBreakpoint1250(window.innerWidth <= 1250));

    const handleResize = () => {
      dispatch(mediaQueryActions.setBreakpoint380(window.innerWidth <= 380));
      dispatch(mediaQueryActions.setBreakpoint520(window.innerWidth <= 520));
      dispatch(mediaQueryActions.setBreakpoint555(window.innerWidth <= 555));
      dispatch(mediaQueryActions.setBreakpoint680(window.innerWidth <= 680));
      dispatch(mediaQueryActions.setBreakpoint1040(window.innerWidth <= 1040));
      dispatch(mediaQueryActions.setBreakpoint1250(window.innerWidth <= 1250));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}

export default MyApp;
