//Custom hook created to make input validation more modular
import { useReducer } from "react";

//Init state
const initialInputState = {
  value: "",
  isTouched: false,
};

// Reducer outside the hook
const inputStateReducer = (state, action) => {
  switch (action.type) {
    case "INPUT":
      return { ...state, value: action.value };
    case "BLUR":
      return { ...state, isTouched: true };
    case "RESET":
      return initialInputState;
    case "SUBMIT":
      return { ...state, isTouched: true };
    default:
      return state; // Always return the current state for unknown actions
  }
};

const useInputValidate = (validateValue) => {
  const [inputState, dispatch] = useReducer(
    inputStateReducer,
    initialInputState,
  );

  const valueIsValid = validateValue(inputState.value);
  const hasError = !valueIsValid && inputState.isTouched;

  const valueChangeHandler = useCallback((event) => {
    dispatch({ type: "INPUT", value: event.target.value });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const submitHandler = useCallback(() => {
    dispatch({ type: "SUBMIT" });
  }, []);

  const touchHandler = useCallback(() => {
    dispatch({ type: "BLUR" });
  }, []);

  return {
    value: inputState.value,
    hasError,
    isValid: valueIsValid,
    valueChangeHandler,
    inputBlurHandler,
    reset,
    submitHandler,
    touchHandler,
  };
};

export default useInputValidate;
