import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./AuthModal.module.css";
import useInputValidate from "../../../hooks/useInput";
import { login, signup } from "./authHelpers";
import { reduxLogin } from "../../../../store/auth";

const ModalOverlay = (props) => {
  const [error, setError] = useState(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enteredProfilePicture, setEnteredProfilePicture] = useState("");
  const { isSignUp, setIsSignUp } = props;
  const dispatch = useDispatch();
  const uid = useSelector((state) => state.auth.uid);

  //Username
  const {
    value: enteredName,
    hasError: nameInputHasError,
    isValid: enteredNameIsValid,
    reset: resetNameInput,
    valueChangeHandler: nameChangeHandler,
    inputBlurHandler: nameBlurHandler,
    submitHandler: nameSubmitHandler,
  } = useInputValidate((value) => value.trim() !== '');

  const {
    value: enteredEmail,
    hasError: emailInputHasError,
    isValid: enteredEmailIsValid,
    reset: resetEmailInput,
    valueChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    submitHandler: emailSubmitHandler,
  } = useInputValidate((value) => {
    return value.trim() !== "" && value.includes("@") && value.includes(".");
  });

  const {
    value: enteredPassword,
    hasError: passwordInputHasError,
    isValid: enteredPasswordIsValid,
    reset: resetPasswordInput,
    valueChangeHandler: passwordChangeHandler,
    inputBlurHandler: passwordBlurHandler,
    submitHandler: passwordSubmitHandler,
  } = useInputValidate((value) => value.trim().length >= 6);

  const {
    value: enteredPasswordConfirm,
    hasError: passwordConfirmInputHasError,
    isValid: enteredPasswordConfirmIsValid,
    reset: resetPasswordConfirmInput,
    valueChangeHandler: passwordConfirmChangeHandler,
    inputBlurHandler: passwordConfirmBlurHandler,
    submitHandler: passwordConfirmSubmitHandler,
  } = useInputValidate(
    (value) => value.trim().length >= 5 && value === enteredPassword,
  );

  useEffect(() => {
    console.log('err,', error)
  }, [error])

  const submitHandler = async (e) => {
    e.preventDefault();

    //If Signup Form is enabled
    if (isSignUp) {
      // Sets all input fields to touched on submission so an error comes up if it is invalid
      nameSubmitHandler();
      emailSubmitHandler();
      passwordSubmitHandler();
      passwordConfirmSubmitHandler();

      //If a field is invalid, cancel submission
      if (
        !enteredNameIsValid ||
        !enteredEmailIsValid ||
        !enteredPasswordIsValid ||
        !enteredPasswordConfirmIsValid
      ) {
        return;
      }

      //Else if Login form is enabled
    } else {
      //Login only requires email and password
      emailSubmitHandler();
      passwordSubmitHandler();

      //If a field is invalid, cancel submission
      if (!enteredEmailIsValid || !enteredPasswordIsValid) {
        return;
      }
    }

    //If everything passes validation and works, attempt to submit

    if (isSignUp) {
      //If signup form, attempt to signup

      const response = await signup(
        enteredName,
        enteredEmail,
        enteredPassword,
        enteredProfilePicture,
        setError,
        resetEmailInput,
        setLoading,
        reduxLogin,
        dispatch,
      );

      const success = response.status === 200;
      console.log(response.status);

      //If successfull reset form inputs and render a success message to user
      if (success) {
        resetNameInput();
        resetEmailInput();
        resetPasswordInput();
        resetPasswordConfirmInput();

        props.openSuccessModal();
        props.closeModal();

        //Signed Up!
      }
      return;
    } else {
      //else If Login form instead of signup form, attempt to Login

      const response = await login(
        enteredEmail,
        enteredPassword,
        setError,
        emailSubmitHandler,
        passwordSubmitHandler,
        dispatch,
        reduxLogin,
        setLoading,
      );

      const success = response?.status === 200;

      //If successfull reset form inputs
      if (success) {
        resetNameInput();
        resetEmailInput();
        resetPasswordInput();
        resetPasswordConfirmInput();

        props.openSuccessModal();
        props.closeModal();

        //Logged In!
      }
    }
  };

  //Toggle form between Signup and Login
  const toggleOption = () => {
    setIsSignUp((prev) => !prev);
  };

  // Change styles of input field if error has been set by custom hook
  const nameInputstyles = !nameInputHasError
    ? styles.control
    : `${styles.control} ${styles.invalid}`;

  const emailInputstyles = !emailInputHasError
    ? styles.control
    : `${styles.control} ${styles.invalid}`;

  const passwordInputstyles = !passwordInputHasError
    ? styles.control
    : `${styles.control} ${styles.invalid}`;

  const passwordConfirmInputstyles = !passwordConfirmInputHasError
    ? styles.control
    : `${styles.control} ${styles.invalid}`;

  // Reset overall form error when email is changed (for invalid credentials on login)
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [enteredEmail, enteredPassword, enteredName]);

  return (
    <div className={`${styles.modal} ${styles.card}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>{isSignUp ? "Sign Up" : "Log In"}</h2>
        <div className={styles.exit} onClick={props.closeModal}>
          <FontAwesomeIcon icon={faTimes} className={styles.exitIcon} />
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.row}>
          <form className={styles.form} onSubmit={submitHandler}>
            {isSignUp && (
              <div className={nameInputstyles}>
                <input
                  type="username"
                  className={styles.input}
                  name="username"
                  placeholder="Enter username"
                  onChange={nameChangeHandler}
                  onBlur={() => {
                    setNameTouched(true);
                    nameBlurHandler();
                  }}
                  value={enteredName}
                />
                {nameInputHasError && (
                  <p className={styles.errorText}>
                    Please enter a username
                  </p>
                )}
              </div>
            )}
            <div className={emailInputstyles}>
              <input
                type="email"
                className={styles.input}
                name="email"
                id="email"
                placeholder="Enter your email"
                onChange={emailChangeHandler}
                onBlur={emailBlurHandler}
                value={enteredEmail}
              />
              {emailInputHasError && (
                <p className={styles.errorText}>
                  Please enter a valid Email Address
                </p>
              )}
            </div>
            <div className={passwordInputstyles}>
              <input
                type="password"
                className={styles.input}
                name="password"
                placeholder="Enter your Password"
                onChange={passwordChangeHandler}
                onBlur={passwordBlurHandler}
                value={enteredPassword}
              />
              {passwordInputHasError && (
                <p className={styles.errorText}>
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
            {isSignUp && (
              <div className={passwordConfirmInputstyles}>
                <input
                  type="password"
                  className={styles.input}
                  name="password-confirmation"
                  placeholder="Confirm your Password"
                  onChange={passwordConfirmChangeHandler}
                  onBlur={passwordConfirmBlurHandler}
                  value={enteredPasswordConfirm}
                />
                {passwordConfirmInputHasError && (
                  <p className={styles.errorText}>
                    Passwords must be valid and match
                  </p>
                )}
              </div>
            )}

            {isSignUp && <div className={styles.control}>
            {/* <label>Profile Picture (Optional)</label> */}
            <input
              type="text"
              placeholder="Profile Picture (Optional)"
              value={enteredProfilePicture}
              onChange={(e) => setEnteredProfilePicture(e.target.value)}
            />
          </div>
            }


          

            {loading ? (
              <button className={styles.loadingButton}>
                <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
              </button>
            ) : (
              <button className={styles.button}>
                {isSignUp ? `Sign Up` : `Log In`}
              </button>
            )}


            {error && <p className={styles.formError}>{error}</p>}


          </form>
        </div>
        <div className={styles.option}>
          <p>{isSignUp ? `Not signing up?` : `Not logging in?`} </p>
          <div className={styles.toggle} onClick={toggleOption}>
            {isSignUp ? `Log In` : `Sign Up`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalOverlay;
