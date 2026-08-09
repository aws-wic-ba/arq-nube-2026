/**
 * App bootstrap — initializes the Secure Design Advisor frontend.
 */

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("btn-new-assessment");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("landing").classList.add("d-none");
      document.getElementById("wizard-container").classList.remove("d-none");
      Wizard.init();
    });
  }
});
