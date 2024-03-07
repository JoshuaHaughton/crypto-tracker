"use server";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { E_COOKIE_NAMES } from "@/lib/types/cookieTypes";
import { revalidatePath } from "next/cache";

interface ICookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
  httpOnly?: boolean;
}

/**
 * Interface for the expected structure of the request body.
 */
interface ICookieUpdateRequest {
  name: E_COOKIE_NAMES;
  value: string;
  options?: Partial<ICookieOptions>;
}

/**
 * Default cookie options to ensure consistency and security across the application.
 */
const defaultCookieOptions: ICookieOptions = {
  path: "/",
  sameSite: "strict",
  secure: true,
  httpOnly: true,
};

/**
 * Handles updating of cookies based on client requests.
 * Allows updating predefined cookies and customizing their options.
 *
 * @param req - The incoming Next.js request object.
 * @returns A Next.js response object indicating the outcome of the cookie update operation.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: ICookieUpdateRequest = await req.json();
  const { name, value, options } = body;
  const cookieHandler = cookies();

  // Validate that the cookie name is one of the predefined names and a value is provided.
  if (
    !Object.values(E_COOKIE_NAMES).includes(name) ||
    typeof value !== "string"
  ) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid cookie name or value." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Merge user-provided options with default options
  const cookieOptions = { ...defaultCookieOptions, ...options };

  // Revalidate the paths so that we don't return invalid cached data from the previous currency
  revalidatePath("/");
  revalidatePath("/coin/[symbol]");
  revalidatePath("/", "page");
  revalidatePath("/coin/[symbol]", "page");
  revalidatePath("/", "layout");

  // Update the cookie with the new value and options
  cookieHandler.set(name, value, cookieOptions);

  revalidatePath("/");
  revalidatePath("/coin/[symbol]");
  revalidatePath("/", "page");
  revalidatePath("/coin/[symbol]", "page");
  revalidatePath("/", "layout");

  // Respond with success status and the name of the updated cookie.
  return new NextResponse(
    JSON.stringify({
      status: "success",
      cookieName: name,
      newValue: value,
      revalidated: true,
      now: Date.now(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
