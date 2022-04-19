import { auth } from "../../../../firebase";
import firebase from "firebase/compat/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'

export const signup = async (
  username,
  email,
  password,
  enteredProfilePicture,
  setError,
  resetEmailInput,
  setLoading,
  reduxLogin,
  dispatch
) => {
  setLoading(true);

  const response = await createUserWithEmailAndPassword(auth, email, password)
    .then((userAuth) => {
      console.log('test')
      updateProfile(auth.currentUser, {
        displayName: username,
        photoUrl: enteredProfilePicture ? enteredProfilePicture : null
      })
        .then(() => {
          dispatch(
            reduxLogin({
              username,
              uid: userAuth.user.uid,
            }),
          );
          setLoading(false);
          setError(null);
          return { status: 200 };
        });
      return { status: 200 };
    })
    .catch((err) => {
      if (err !== "TypeError: e.preventDefault is not a function") {
        console.log(err);
        console.log(err.message);
        setLoading(false);
        // resetEmailInput();
        setError(err.message);
        console.log('err set')
        return { status: 400 };
      }
      return { status: 400 };
    });

  return response;
};

export const login = async (
  enteredEmail,
  enteredPassword,
  setError,
  emailSubmitHandler,
  passwordSubmitHandler,
  dispatch,
  reduxLogin,
  setLoading,
) => {
  setLoading(true);

  //Login only requires email and password
  emailSubmitHandler();
  passwordSubmitHandler();

  //If valid, continue
  const response = await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword)
    .then((userAuth) => {
      dispatch(
        reduxLogin({
          username: userAuth.user.displayName,
          uid: userAuth.user.uid,
        }),
      );
      console.log("LOGIN SUCCESSFUL", userAuth.user);
      setLoading(false);
      setError(null);
      return { status: 200 };
    })
    .catch((err) => {
      if (err !== "TypeError: e.preventDefault is not a function") {
        console.log(err);
        setLoading(false);
        setError(err.message);
        return { status: 400 };
      }
      return;
    });

  return response;
};
