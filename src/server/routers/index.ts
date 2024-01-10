import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import {
  fetchCoinDetailsData,
  fetchPopularCoinsData,
} from "@/utils/api.server.utils";
import { ALL_CURRENCIES } from "@/lib/constants";
import { createCallerFactory } from "@trpc/server";

// Manually create a tuple of Zod schemas for each currency (TCurrencyString)
const currencyUnionSchema = z.union([
  z.literal(ALL_CURRENCIES[0]),
  z.literal(ALL_CURRENCIES[1]),
  z.literal(ALL_CURRENCIES[2]),
  z.literal(ALL_CURRENCIES[3]),
]);

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  // Procedure for fetching popular coins
  fetchPopularCoins: publicProcedure
    .input(
      z.object({
        targetCurrency: currencyUnionSchema,
      }),
    )
    .query(async ({ input }) => {
      // Directly calling the function which encapsulates the fetching logic
      const targetCurrency = input.targetCurrency;
      return await fetchPopularCoinsData(targetCurrency);
    }),
  // Procedure for fetching selected coin details
  fetchCoinDetails: publicProcedure
    .input(
      z.object({
        id: z.string(),
        targetCurrency: currencyUnionSchema,
      }),
    )
    .query(async ({ input }) => {
      // Directly calling the function which encapsulates the fetching logic
      const { id, targetCurrency } = input;
      return await fetchCoinDetailsData(id, targetCurrency);
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

// Initialize the factory function
const createServerCaller = createCallerFactory();

// Create the server-side caller
export const serverClient = createServerCaller(appRouter)({});
