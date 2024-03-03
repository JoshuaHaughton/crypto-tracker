import { Options } from "@leeoniya/ufuzzy";
// https://github.com/leeoniya/uFuzzy?tab=readme-ov-file#options

// Define custom options for uFuzzy to enhance search flexibility and accuracy.
export const uFuzzyOptions: Options = {
  // interIns: Allows additional characters between search terms.
  // This option helps to accommodate common typos such as accidental extra characters
  // or missed spaces between words, making the search more forgiving and likely to
  // return relevant results even when the query is slightly incorrect.
  interIns: Infinity,

  // intraIns: Permits one extra character within a term itself.
  // Useful for handling misspellings within single words, where a user might accidentally
  // insert an extra character. For example, searching for "apple" could still match "aapple".
  intraIns: 1,

  // intraMode: Determines the error tolerance within each term of the search query.
  // When set to 1, activates single-error mode, allowing one substitution, transposition,
  // deletion, or insertion error within each term. This setting helps to improve search
  // resilience by accommodating common typing errors, enhancing usability for end-users.
  // In contrast, the default mode or multi-line mode (intraMode set to 0) requires exact
  // matches for each term within the search query, without allowing any errors. This strict
  // matching approach is suited for scenarios where precision is critical.
  intraMode: 1,

  // intraSlice: Defines the range within terms where errors are allowed, from the second character
  // to the end of the word. This prevents the first character of a word from being altered by
  // the error tolerance mechanism, ensuring that the beginning of the term remains as the user
  // intended, which is often critical for the search's context and accuracy.
  // intraSlice: [1, Infinity],

  // intraSub, intraTrn, intraDel: Specifically enable the algorithm to tolerate
  // single-character substitutions, transpositions, and deletions within terms.
  // These settings work together to robustly handle various common typing errors,
  // ensuring that the search remains effective even with minor inaccuracies in the query.
  // - intraSub: Allows one character to be replaced by another, e.g., "cat" to "cot".
  // - intraTrn: Allows two adjacent characters to swap places, e.g., "form" to "from".
  // - intraDel: Allows one character to be removed, e.g., "hello" to "hllo".
  intraSub: 1,
  intraTrn: 1,
  intraDel: 1,

  // Customize the sorting function as needed to refine how search results are ordered
  // based on the relevance and the nature of the typos corrected. This could involve
  // prioritizing results based on the number of errors corrected, the type of errors,
  // or other criteria specific to the application's context.
};
