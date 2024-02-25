/**
 * Cookie management actions.
 */
export const COOKIE_ACTIONS = {
  DELETE: "delete",
  UPDATE: "update",
} as const;

// This utility type helps to extract values from our const object.
export type COOKIE_ACTION =
  (typeof COOKIE_ACTIONS)[keyof typeof COOKIE_ACTIONS];

export enum E_COOKIE_NAMES {
  CURRENT_CURRENCY = "currentCurrency",
  INITIAL_ROUTE = "initialRoute",
}
