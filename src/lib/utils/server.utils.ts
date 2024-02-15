"use server";

import { CookieAction } from "@/lib/types/cookieTypes";
import { cookies } from "next/headers";

/**
 * Manages cookies by either deleting or updating them based on the specified action.
 *
 * @param actionType - The action to perform on the cookie, either DELETE or UPDATE.
 * @param cookieName - The name of the cookie to manage.
 * @param cookieValue - The value for the cookie, relevant for the UPDATE action. Defaults to an empty string if not provided.
 */
export async function manageCookies(
  actionType: CookieAction,
  cookieName: string,
  cookieValue?: string,
) {
  const cookieHandler = cookies();

  if (actionType === CookieAction.DELETE) {
    cookieHandler.delete(cookieName);
  } else if (actionType === CookieAction.UPDATE) {
    cookieHandler.set(cookieName, cookieValue || "", {
      path: "/",
      httpOnly: true,
    });
  }
}
