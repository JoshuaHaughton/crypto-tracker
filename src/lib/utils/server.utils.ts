"use server";

import { cookies } from "next/headers";
import {
  COOKIE_ACTIONS,
  COOKIE_ACTION,
  E_COOKIE_NAMES,
} from "@/lib/types/cookieTypes";

// Define valid SameSite options for type checking
type TSameSiteOptions = "strict" | "lax" | "none";
// IcookieOptions.types.ts
interface ICookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: TSameSiteOptions;
  secure?: boolean;
  httpOnly?: boolean;
}

const defaultCookieOptions: ICookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "strict", // Use the TSameSiteOptions type for strict type checking
};

/**
 * Parameters for the manageCookies function.
 */
interface IManageCookiesParams {
  actionType: COOKIE_ACTION;
  cookieName: E_COOKIE_NAMES;
  cookieValue?: string;
  options?: ICookieOptions;
}

/**
 * Manages cookies by either deleting or updating them based on the specified parameters.
 *
 * @param {IManageCookiesParams} params - The parameters for cookie management.
 * @returns {Promise<void>} A promise that resolves when the cookie has been successfully managed.
 *
 */
export async function manageCookies({
  actionType,
  cookieName,
  cookieValue,
  options = {},
}: IManageCookiesParams): Promise<void> {
  const cookieHandler = cookies();

  if (actionType === COOKIE_ACTIONS.DELETE) {
    cookieHandler.delete(cookieName);
  } else if (actionType === COOKIE_ACTIONS.UPDATE) {
    if (typeof cookieValue === "undefined") {
      throw new Error("Cookie value must be provided for update action");
    }

    // Merge the provided options with default values
    const finalOptions = {
      ...defaultCookieOptions,
      ...options, // User-provided options
    };
    cookieHandler.set(cookieName, cookieValue, finalOptions);
  }
}
