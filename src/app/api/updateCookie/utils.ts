import { E_COOKIE_NAMES } from "@/lib/types/cookieTypes";

/**
 * Sends an asynchronous request to update the currency cookie.
 * This functions does not wait for the response from the server.
 * It sends a POST request to the '/api/updateCookie' endpoint
 * with the new currency value. If the request fails, it logs the error.
 *
 * @param {string} newCurrency - The new currency value to be set in the cookie.
 * @example
 * // Update the currency cookie to 'USD'
 * updateCurrencyCookie('USD');
 */
export async function updateCurrencyCookie(newCurrency: string): Promise<void> {
  fetch("/api/updateCookie", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: E_COOKIE_NAMES.CURRENT_CURRENCY,
      value: newCurrency,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
    })
    .catch((error) => {
      console.error("Error updating currency cookie:", error);
    });
}
