import { auth, db } from "../../../../firebase";
import firebase from "firebase/compat/app";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'

export const signup = async (
  username,
  email,
  password,
  enteredProfilePicture,
  setError,
  setLoading,
  reduxLogin,
  dispatch, 
) => {
  setLoading(true);

  const response = await createUserWithEmailAndPassword(auth, email, password)
    .then((userAuth) => {
      console.log('test')
      updateProfile(auth.currentUser, {
        displayName: username,
        photoUrl: enteredProfilePicture ? enteredProfilePicture : null
      })
        .then( async () => {
          dispatch(
            reduxLogin({
              username,
              uid: userAuth.user.uid,
            }),
          );

          const emptyPortfolio = {
            assets: {},
            orders: [],
            portfolioCreated: new Date(),
            userId: userAuth.user.uid,
            totalFunds: 0
          }


          try {
            const docRef = await setDoc(doc(db, "portfolios", userAuth.user.uid), emptyPortfolio);
            console.log(docRef);

          } catch(err) {

          }



                // const emptyPortfolio = {
                //   assets: {
                //     bitcoin: {
                //       symbol: "BTC",
                //       name: "Bitcoin",
                //       units: 1.5
                //     },
                //     }
                //   ,
                //   orders: [
                //     {
                //     id: 1,
                //     name: 'bitcoin',
                //     symbol: 'BTC',
                //     createdAt: 1,
                //     closedAt: 1,
                //     exitPoint: null,
                //     buy: true,
                //     priceAtTransaction: 20000,
                //     units: 1.5,
                //   },
                //   ],
                //   portfolioCreated: 0,
                //   userId,
                //   totalFunds: 0
                // }

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
