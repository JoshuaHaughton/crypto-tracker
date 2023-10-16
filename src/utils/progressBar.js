import nProgress from "nprogress";

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: true,
});

let nProgressInProgress = false;

// Function to start the progress bar
export const startProgressBar = () => {
  if (!nProgressInProgress) {
    nProgress.start();
    nProgressInProgress = true;
  }
};

// Function to complete the progress bar
export const completeProgressBar = () => {
  if (nProgressInProgress) {
    nProgress.done();
    nProgressInProgress = false;
  }
};

// Function to terminate the progress bar
export const terminateProgressBar = () => {
  if (nProgressInProgress) {
    nProgress.remove();
    nProgressInProgress = false;
  }
};
