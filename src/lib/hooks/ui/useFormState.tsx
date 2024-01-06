import useInputValidate from "./useInputValidate";

// Function to get the appropriate class for each input based on its error state
function getInputClasses(classes, inputField) {
  return !inputField.hasError
    ? classes.control
    : `${classes.control} ${classes.invalid}`;
}

const useFormState = (isSignUp, classes) => {
  const validateName = (value) => value.trim() !== "";
  const validateEmail = (value) =>
    value.trim() !== "" && value.includes("@") && value.includes(".");
  const validatePassword = (value) => value.trim().length >= 5;
  const validatePasswordConfirm = (value, password) =>
    value.trim().length >= 5 && value === password;

  const name = useInputValidate(validateName);
  const email = useInputValidate(validateEmail);
  const password = useInputValidate(validatePassword);
  const passwordConfirm = useInputValidate((value) =>
    validatePasswordConfirm(value, password.value),
  );

  // Function to check if all fields are valid
  const isFormValid = () =>
    (!isSignUp || name.isValid) &&
    email.isValid &&
    password.isValid &&
    (!isSignUp || passwordConfirm.isValid);

  // Function to "touch" all fields to trigger the display of errors
  const touchAllFields = () => {
    name.touchHandler();
    email.touchHandler();
    password.touchHandler();
    if (isSignUp) {
      passwordConfirm.touchHandler();
    }
  };

  // Function to reset all fields
  const resetForm = () => {
    name.reset();
    email.reset();
    password.reset();
    passwordConfirm.reset();
  };

  const nameInputClasses = getInputClasses(classes, name);
  const emailInputClasses = getInputClasses(classes, email);
  const passwordInputClasses = getInputClasses(classes, password);
  const passwordConfirmInputClasses = isSignUp
    ? getInputClasses(classes, passwordConfirm)
    : null;

  return {
    name,
    email,
    password,
    passwordConfirm,
    resetForm,
    isFormValid,
    touchAllFields,
    nameInputClasses,
    emailInputClasses,
    passwordInputClasses,
    passwordConfirmInputClasses,
  };
};

export default useFormState;
