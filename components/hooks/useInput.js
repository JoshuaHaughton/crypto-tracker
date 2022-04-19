//Custom hook created to make input validation more modular
import { useReducer } from "react";

//Init state
let initialInputState = {
  value: "",
  isTouched: false,
};


//Dispatched actions sent here
const inputStateReducer = (state, action) => {
  if (action.type === "INPUT" && typeof action.value === "string") {
    return { value: action.value, isTouched: state.isTouched };
  }

  if (action.type === "BLUR") {
    return { isTouched: true, value: state.value };
  }

  if (action.type === "RESET") {
    return { isTouched: false, value: "" };
  }

  if (action.type === "SUBMIT") {
    return { isTouched: true, value: state.value };
  }

  throw new Error();
};

const useInputValidate = (validateValue) => {
  const [inputState, dispatch] = useReducer(
    inputStateReducer,
    initialInputState,
  );

  const valueIsValid = validateValue(inputState.value);
  const hasError = !valueIsValid && inputState.isTouched;

  const valueChangeHandler = (
    event) => {
    dispatch({ type: "INPUT", value: event.target.value });
  };

  const inputBlurHandler = () => {
    dispatch({ type: "BLUR" });
  };

  const reset = () => {
    dispatch({ type: "RESET" });
  };

  const submitHandler = () => {
    dispatch({ type: "SUBMIT" });
  };

  return {
    value: inputState.value,
    hasError,
    inputBlurHandler,
    valueChangeHandler,
    isValid: valueIsValid,
    reset,
    submitHandler,
    inputState,
  };
};

export default useInputValidate;
