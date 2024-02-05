/* eslint-disable react-hooks/exhaustive-deps */
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import classes from "./AuthModal.module.scss";
// import useAuthModal from "./useAuthModal";

// const AuthModalOverlay = (props) => {
//   // Use the useAuthModal hook to manage state and submission
//   const {
//     name,
//     email,
//     password,
//     passwordConfirm,
//     isLoading,
//     nameInputClasses,
//     emailInputClasses,
//     passwordInputClasses,
//     passwordConfirmInputClasses,
//     error,
//     isSignUp,
//     submitHandler,
//     closeModal,
//     toggleSignupOrLogin,
//   } = useAuthModal(classes);

//   return (
//     <div className={`${classes.modal} ${classes.card}`}>
//       <header className={classes.header}>
//         <h2 className={classes.title}>{isSignUp ? "Sign Up" : "Log In"}</h2>
//         <div className={classes.exit} onClick={closeModal}>
//           <FontAwesomeIcon icon={faTimes} className={classes.exitIcon} />
//         </div>
//       </header>

//       <div className={classes.content}>
//         <div className={classes.row}>
//           <form className={classes.form} onSubmit={submitHandler}>
//             {isSignUp && (
//               <div className={nameInputClasses}>
//                 <input
//                   type="username"
//                   id="username"
//                   name="username"
//                   placeholder="Enter your Username"
//                   onChange={nameChangeHandler}
//                   onBlur={nameBlurHandler}
//                   value={enteredName}
//                 />
//                 {name.hasError && (
//                   <p className={classes.errorText}>
//                     Username can&apos;t be empty
//                   </p>
//                 )}
//               </div>
//             )}
//             <div className={emailInputClasses}>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 placeholder="Enter your Email"
//                 onChange={emailChangeHandler}
//                 onBlur={emailBlurHandler}
//                 value={enteredEmail}
//               />
//               {email.hasError && (
//                 <p className={classes.errorText}>
//                   Please enter a valid email address
//                 </p>
//               )}
//             </div>
//             <div className={passwordInputClasses}>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 placeholder="Enter your Password"
//                 onChange={passwordChangeHandler}
//                 onBlur={passwordBlurHandler}
//                 value={enteredPassword}
//               />
//               {password.hasError && (
//                 <p className={classes.errorText}>
//                   Password must be at least 5 characters long
//                 </p>
//               )}
//             </div>
//             {isSignUp && (
//               <div className={passwordConfirmInputClasses}>
//                 <input
//                   type="password"
//                   id="password-confirmation"
//                   name="password-confirmation"
//                   placeholder="Confirm your Password"
//                   onChange={passwordConfirmChangeHandler}
//                   onBlur={passwordConfirmBlurHandler}
//                   value={enteredPasswordConfirm}
//                 />
//                 {passwordConfirm.hasError && (
//                   <p className={classes.errorText}>
//                     Passwords must be valid and match
//                   </p>
//                 )}
//               </div>
//             )}

//             {isLoading ? (
//               <button className={classes.loadingButton}>
//                 <FontAwesomeIcon icon={faSpinner} className={classes.spinner} />
//               </button>
//             ) : (
//               <button className={classes.button}>
//                 {isSignUp ? `Sign Up` : `Log In`}
//               </button>
//             )}
//             {error && <p className={classes.formError}>{error}</p>}
//           </form>
//         </div>
//         <div className={classes.option}>
//           <p>{isSignUp ? `Not signing up?` : `Not logging in?`} </p>
//           <div className={classes.toggle} onClick={toggleSignupOrLogin}>
//             {isSignUp ? `Log In` : `Sign Up`}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModalOverlay;
