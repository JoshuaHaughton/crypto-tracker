import store from "../store";

export const useSilentRedux = (selector) => {
  return selector(store.getState());
};
