// https://github.com/leeoniya/uFuzzy?tab=readme-ov-file#options

// Define custom options for uFuzzy to enhance search flexibility and accuracy.
export const uFuzzyOptions = {
  // interIns: Allows additional characters between search terms.
  // This option helps to accommodate common typos such as accidental extra characters
  // or missed spaces between words, making the search more forgiving and likely to
  // return relevant results even when the query is slightly incorrect.
  interIns: Infinity,

  // intraIns: Permits one extra character within a term itself.
  // Useful for handling misspellings within single words, where a user might accidentally
  // insert an extra character. For example, searching for "apple" could still match "aapple".
  intraIns: 1,

  // intraMode: Activates single-error mode within each term of the search query.
  // In this mode, the search algorithm will tolerate one error (substitution, transposition,
  // deletion, or insertion) within each term, helping to catch and correct simple mistakes
  // made by the user while typing.
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
