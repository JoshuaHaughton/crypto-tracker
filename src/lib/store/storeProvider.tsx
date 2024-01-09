import { useRef } from "react";
import { Provider } from "react-redux";
import { TAppStore, makeStore } from ".";
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";
import { TCurrencyExchangeRates, TCurrencyRates } from "@/types/currencyTypes";
import { initializeStore } from "@/utils/reduxStore.utils";

/**
 * `StoreProvider` is a higher-order component designed for providing a Redux store to the React component tree in a Next.js Single Page Application (SPA). This component is responsible for initializing the Redux store with server-side fetched data, allowing for an efficient hydration process when the application is first loaded. It's particularly effective in scenarios where initial data needs to be fetched on the server and then passed down to the client when using Nextjs 14 with the App Router. This setup allows the SPA to maintain state consistency across client-side navigations while benefiting from server-side rendering optimizations.
 *
 * The component accepts several optional parameters for initializing different parts of the Redux store. This includes data for popular coins, specific coin details, carousel coins, and currency exchange rates. Upon mounting, the StoreProvider uses these data to dispatch actions that populate the respective slices of the Redux store. This approach ensures that the initial render of the application on the client side has access to the pre-fetched data, thereby aligning with SPA best practices in a server-rendered environment.
 *
 * @param children - The child components of the application that require access to the Redux store.
 * @param popularCoins - The initial set of data for popular coins. This data is used to populate the corresponding slice of the Redux store.
 * @param coinDetails - The initial data for a specific coin's details. This is used to update the store with detailed information about a particular coin.
 * @param carouselCoins - The initial data for carousel coins. This data is used to update the carousel section in the Redux store.
 * @param currencyExchangeRates - The initial currency exchange rates. This data is used to populate the currency-related information in the Redux store.
 * @returns A React component that wraps its children with a Redux store provider, ensuring that the entire SPA has consistent and pre-initialized state.
 */

export const StoreProvider: React.FC<{
  children: React.ReactNode;
  currencyExchangeRates?: TCurrencyExchangeRates;
  popularCoins?: ICoinOverview[];
  carouselCoins?: ICoinOverview[];
  coinDetails?: ICoinDetails;
}> = ({
  children,
  popularCoins,
  coinDetails,
  carouselCoins,
  currencyExchangeRates,
}) => {
  // useRef to persist the store reference across re-renders and navigation events
  const storeRef = useRef<TAppStore | null>(null);

  // Initialize the store only once during the server-side rendering or initial client render
  if (!storeRef.current) {
    // Creates a new Redux store instance
    storeRef.current = makeStore();

    // Initialize the store with data provided as props
    // This is primarily for server-side rendering to hydrate the Redux store with initial data
    initializeStore(storeRef.current, {
      popularCoins,
      coinDetails,
      carouselCoins,
      currencyExchangeRates,
    });
  }

  // Wrap the application with the Redux Provider and pass the store reference
  // This enables Redux state management across the application
  return <Provider store={storeRef.current}>{children}</Provider>;
};
