import { merge, isEmpty } from "lodash";

/**
 * Enhances the given Redux slice with common actions and reducers.
 *
 * @param {Object} slice - The original Redux slice definition.
 * @param {Object} slice.reducers - The reducers of the original Redux slice.
 * @returns {Object} - The enhanced Redux slice definition.
 */
export function withCommonActions(slice) {
  /**
   * Reducer to update the state based on the action payload using a deep merge.
   *
   * @param {Object} state - The current state of the slice.
   * @param {Object} action - The dispatched action.
   */
  function updateStateFromPayload(state, action) {
    for (const key in action.payload) {
      if (action.payload.hasOwnProperty(key) && !isEmpty(action.payload[key])) {
        if (
          typeof action.payload[key] === "object" &&
          action.payload[key] !== null
        ) {
          if (!state[key]) state[key] = {};
          merge(state[key], action.payload[key]); // Using Lodash's merge here
        } else {
          state[key] = action.payload[key];
        }
      }
    }
  }

  // Merge the provided slice reducers with the common reducers
  return {
    ...slice,
    reducers: {
      ...slice.reducers,
      updateSlice: updateStateFromPayload,
    },
  };
}
