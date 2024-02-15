import { uFuzzyOptions } from "@/lib/constants/searchConstants";
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
      Object.freeze(UFuzzyManager.instance);
      console.log("uFuzzy initialized", UFuzzyManager.instance);
    }
  }

  /**
   * Provides global access to the uFuzzy singleton instance.
   * Attempts to automatically initialize the instance if it has not been done so before accessing it.
   * Logs an error and returns null if the instance cannot be initialized.
   *
   * @returns The initialized and immutable uFuzzy instance, or null if initialization fails.
   */
  public static getInstance(): ReturnType<TUFuzzyConstructor> | null {
    console.log("Attempting to access uFuzzy instance.");
    if (!UFuzzyManager.instance) {
      console.error("uFuzzy instance not found. Attempting to initialize...");
      UFuzzyManager.initialize();
      if (!UFuzzyManager.instance) {
        // After an attempt to initialize, if the instance is still not available, log an error and return null.
        console.error(
          "Failed to initialize uFuzzy instance after another attempt. Please ensure uFuzzy is correctly set up.",
        );
        return null;
      }
    }
    console.log("uFuzzy instance accessed successfully.");
    return UFuzzyManager.instance;
  }
}

export default UFuzzyManager;
