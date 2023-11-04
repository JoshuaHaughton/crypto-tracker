import { parse } from "cookie";
import { adminAuth } from "../config/firebaseAdmin";

/**
 * Checks if the user session is valid based on the session cookie and returns user info if available.
 * To be used on the serverside only (Firebase Admin SDK).
 *
 * @param {IncomingMessage} req - The HTTP incoming message (request) object.
 * @returns {Promise<{ isLoggedIn: boolean, user?: Object }>} A promise that resolves to an object indicating whether the user is logged in and their info if they are.
 */
export async function getUserSessionFromServer(req) {
  // Parse the cookies from the request
  const cookies = parse(req.headers.cookie || "");
  const sessionCookie = cookies.__session || "";

  try {
    // Verify the session cookie.
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    // If there are decodedClaims, fetch user details using the UID.
    const userRecord = await adminAuth.getUser(decodedClaims.uid);

    // You can add more user details as needed from the userRecord or other sources.
    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };

    return { isLoggedIn: true, user };
  } catch (error) {
    // Session cookie is invalid, expired, or revoked.
    return { isLoggedIn: false };
  }
}

/**
 * Performs user authentication checks within Next.js data fetching functions.
 * It checks the user's session, sets the necessary response headers, and prepares the auth-related data
 * for the initial Redux state. This ensures a consistent authentication state throughout the application
 * and allows for personalized content delivery based on the user's login status.
 *
 * @param {Object} context - The Next.js context object with request and response objects.
 * @returns {Object} An object containing the user's authentication status and the associated Redux state.
 */
export async function getAuthDataFromServer(context) {
  let authState = {
    isLoggedIn: false,
    user: null,
  };

  try {
    // Check the user session and get the user details
    const { isLoggedIn, user } = await getUserSessionFromServer(context.req);

    // Update the auth state based on the user's login status
    authState = {
      isLoggedIn,
      user: isLoggedIn ? user : null,
    };

    // Set the X-User-Status header to reflect the user's login status for cache management
    context.res.setHeader(
      "X-User-Status",
      isLoggedIn ? "Logged-In" : "Logged-Out",
    );
  } catch (error) {
    // If there's an error during the auth check, log it and maintain the default state
    console.error("Error during auth checks:", error);
  }

  return authState;
}
