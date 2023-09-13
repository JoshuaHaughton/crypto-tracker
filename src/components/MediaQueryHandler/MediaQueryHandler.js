import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { mediaQueryActions } from "../../store/mediaQuery";
import { debounce } from "../../utils/globalUtils";

export const MediaQueryHandler = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const setMediaQueries = () => {
      dispatch(mediaQueryActions.setBreakpoint380(window.innerWidth <= 380));
      dispatch(mediaQueryActions.setBreakpoint520(window.innerWidth <= 520));
      dispatch(mediaQueryActions.setBreakpoint555(window.innerWidth <= 555));
      dispatch(mediaQueryActions.setBreakpoint680(window.innerWidth <= 680));
      dispatch(mediaQueryActions.setBreakpoint1040(window.innerWidth <= 1040));
      dispatch(mediaQueryActions.setBreakpoint1250(window.innerWidth <= 1250));
    };

    setMediaQueries();

    const handleResize = debounce(() => {
      setMediaQueries();
    }, 250); // 250ms delay for debouncing

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  return children;
};
