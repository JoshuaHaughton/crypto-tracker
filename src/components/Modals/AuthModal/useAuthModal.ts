import { useState } from "react";
import { useDispatch } from "react-redux";
import { modalsActions } from "../../../store/modals";
import { loginUser, signupUser } from "../../../thunks/authThunk";
import useFormState from "../../../hooks/ui/useFormState";

const useAuthModal = (classes) => {
  const dispatch = useDispatch();
  const isSignUp = useSelector((state) => state.modals.isSignUp);

  // Import all necessary states and functions from useFormState
  const {
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
  } = useFormState(isSignUp, classes);

  // State to manage error messages and loading indicator
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupError = (error) => {
    setError(error);
    email.reset();
  };

  const handleLoginError = (error) => {
    setError(error);
    email.reset();
    password.reset();
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // First, ensure all fields are "touched" to show any validation errors
    touchAllFields();

    // If the form isn't valid, set an error and prevent submission
    if (!isFormValid()) {
      setError("Please fill out all fields correctly.");
      return;
    }

    // Begin the loading state
    setIsLoading(true);

    const commonPayload = {
      email: email.value,
      password: password.value,
    };

    // Determine the payload and error handler based on the action
    const payload = isSignUp
      ? {
          ...commonPayload,
          username: name.value,
          passwordConfirm: passwordConfirm.value,
        }
      : commonPayload;
    const errorHandler = isSignUp ? handleSignupError : handleLoginError;
    dispatch(isSignUp ? signupUser(payload) : loginUser(payload))
      .unwrap()
      .then((response) => {
        // Handle success
        if (response && response.status === 200) {
          dispatch(modalsActions.openSuccessModal());
          dispatch(modalsActions.setLogin());
          closeModal();
          resetForm();
        } else {
          throw new Error("An unexpected error occurred.", response);
        }
      })
      .catch((error) => {
        // Call the appropriate error handler
        errorHandler(error.message || "An unexpected error occurred.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Function to call on form submission
  async function submitHandler(event) {
    event.preventDefault();
    await handleSubmit();
  }

  // Function to call to close the modal
  function closeModal() {
    dispatch(modalsActions.closeAuthModal());
  }

  // Toggle between sign up and login
  const toggleSignupOrLogin = () => {
    isSignUp
      ? dispatch(modalsActions.setSignUp())
      : dispatch(modalsActions.setLogin());
  };

  // Reset the error state when the email changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email.value, error]);

  // Return all states and functions for use in the component
  return {
    // States and functions from useFormState
    name,
    email,
    password,
    passwordConfirm,
    isFormValid,
    resetForm,
    touchAllFields,
    nameInputClasses,
    emailInputClasses,
    passwordInputClasses,
    passwordConfirmInputClasses,
    // New states and functions from useAuthModal
    error,
    isLoading,
    isSignUp,
    submitHandler,
    closeModal,
    toggleSignupOrLogin,
  };
};

export default useAuthModal;
