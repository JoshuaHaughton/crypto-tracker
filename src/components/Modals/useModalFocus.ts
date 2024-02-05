// import { useEffect } from "react";

// /**
//  * A hook that sets up focus trapping within a dialog element and handles closing the dialog on Escape key press.
//  *
//  * @param {React.RefObject} dialogRef - A ref object pointing to the dialog element.
//  * @param {Function} closeModal - A function to call when the dialog should be closed.
//  */
// const useModalFocus = (dialogRef, closeModal) => {
//   useEffect(() => {
//     // Get the current dialog element from the ref.
//     const dialog = dialogRef.current;
//     if (!dialog) return;

//     // Define a selector for all focusable elements within the dialog.
//     const focusableElementsSelector =
//       'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

//     // Retrieve all focusable elements within the dialog.
//     const focusableElements = dialog.querySelectorAll(
//       focusableElementsSelector,
//     );

//     // Determine the first and last focusable elements for focus trapping.
//     const firstFocusableElement = focusableElements[0];
//     const lastFocusableElement =
//       focusableElements[focusableElements.length - 1];

//     // Define a function to trap the focus within the dialog.
//     const trapFocus = (event) => {
//       if (event.key === "Tab") {
//         // Shift + Tab pressed on the first focusable element.
//         if (
//           event.shiftKey &&
//           document.activeElement === firstFocusableElement
//         ) {
//           lastFocusableElement.focus();
//           event.preventDefault();
//         }
//         // Tab pressed on the last focusable element.
//         else if (
//           !event.shiftKey &&
//           document.activeElement === lastFocusableElement
//         ) {
//           firstFocusableElement.focus();
//           event.preventDefault();
//         }
//       }
//     };

//     // Define a function to close the dialog on Escape key press.
//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         closeModal();
//       }
//     };

//     // Attach the focus trapping and escape key handlers to the dialog.
//     dialog.addEventListener("keydown", trapFocus);
//     document.addEventListener("keydown", handleEscape);

//     // Set initial focus to the first focusable element.
//     if (firstFocusableElement) {
//       firstFocusableElement.focus();
//     }

//     // Open the dialog modal.
//     dialog.showModal();

//     // Cleanup function to remove event listeners when the component unmounts or the dependencies change.
//     return () => {
//       dialog.removeEventListener("keydown", trapFocus);
//       document.removeEventListener("keydown", handleEscape);

//       // Close the dialog if it's still part of the document.
//       if (dialog.isConnected) {
//         dialog.close();
//       }
//     };
//   }, [closeModal, dialogRef]);
// };

// export default useModalFocus;
