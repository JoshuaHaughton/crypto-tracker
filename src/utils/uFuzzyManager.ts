import { uFuzzyOptions } from "@/lib/constants/globalConstants";
import { TUFuzzyConstructor } from "@/lib/store/search/searchSlice";

/**
 * Singleton manager for uFuzzy instance.
 * Ensures that only one instance of uFuzzy is created throughout the application.
 * This class utilizes private static members to maintain a single instance
 * and public static methods to provide global access to that instance.
 */
class UFuzzyManager {
  /**
   * The single instance of uFuzzy.
   * Marked as private and static to ensure it's only accessible within this class
   * and shared across all instances of this class.
   */
  private static instance: ReturnType<TUFuzzyConstructor> | null = null;

  /**
   * Initializes the uFuzzy instance with predefined options, if not already initialized.
   * This method is idempotent - if called multiple times, it will only initialize uFuzzy once.
   * Uses `Object.freeze()` to make the instance immutable, preventing further modifications.
   */
  public static initialize(): void {
    console.log("uFuzzy - initialize");
    if (!window.uFuzzy) {
      console.error("uFuzzy is not available on window.");
      return;
    }
    if (!UFuzzyManager.instance) {
      UFuzzyManager.instance = window.uFuzzy(uFuzzyOptions);
      // Remove uFuzzy from window to encapsulate access and avoid global usage
      (window as any).uFuzzy = undefined;
      // Freeze the instance to prevent modifications, enhancing the immutability of the singleton.
      UFuzzyManager.instance = Object.freeze(UFuzzyManager.instance);
      console.log("uFuzzy initialized", UFuzzyManager.instance);
    }
  }

  /**
   * Provides global access to the uFuzzy singleton instance.
   * Ensures that the instance is initialized before returning it.
   * Throws an error if `initialize` has not been called before accessing the instance.
   *
   * @returns The initialized and immutable uFuzzy instance.
   * @throws {Error} If the instance has not been initialized.
   */
  public static getInstance(): ReturnType<TUFuzzyConstructor> | null {
    console.log("uFuzzy getInstance");
    if (!UFuzzyManager.instance) {
      console.error(
        "uFuzzy has not been initialized. Call UFuzzyManager.initialize() first.",
      );
      return null;
    }
    return UFuzzyManager.instance;
  }
}

export default UFuzzyManager;
