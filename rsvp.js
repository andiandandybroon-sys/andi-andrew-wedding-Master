const form = document.querySelector("#rsvp-form");
const thankYou = document.querySelector("#thank-you");
const savedName = document.querySelector("#saved-name");
const editButton = document.querySelector("#edit-response");
const message = document.querySelector("#message");
const messageCount = document.querySelector("#message-count");
const dietaryCheckboxes = Array.from(document.querySelectorAll('input[name="dietaryType"]'));
const dietaryDetailsWrap = document.querySelector("#dietary-details-wrap");
const dietaryDetails = document.querySelector('textarea[name="dietaryDetails"]');

if (message && messageCount) {
  const updateCount = () => { messageCount.textContent = String(message.value.length); };
  message.addEventListener("input", updateCount);
  updateCount();
}

function updateDietaryFields(changedCheckbox) {
  const none = dietaryCheckboxes.find((box) => box.value === "None");
  if (changedCheckbox?.value === "None" && changedCheckbox.checked) {
    dietaryCheckboxes.forEach((box) => { if (box !== none) box.checked = false; });
  } else if (changedCheckbox?.checked && none) {
    none.checked = false;
  }

  const selected = dietaryCheckboxes.filter((box) => box.checked).map((box) => box.value);
  const needsDetails = selected.includes("Nut allergy") || selected.includes("Other allergy or dietary requirement");
  const showDetails = selected.some((value) => value !== "None");

  if (dietaryDetailsWrap) dietaryDetailsWrap.hidden = !showDetails;
  if (dietaryDetails) {
    dietaryDetails.required = needsDetails;
    dietaryDetails.setCustomValidity("");
    if (!showDetails) dietaryDetails.value = "";
  }
}

dietaryCheckboxes.forEach((box) => box.addEventListener("change", () => updateDietaryFields(box)));
updateDietaryFields();

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedDietary = dietaryCheckboxes.filter((box) => box.checked).map((box) => box.value);
    const requiresDietaryDetails = selectedDietary.includes("Nut allergy") || selectedDietary.includes("Other allergy or dietary requirement");

    if (dietaryDetails) {
      dietaryDetails.setCustomValidity(
        requiresDietaryDetails && !dietaryDetails.value.trim()
          ? "Please provide details of the allergy or dietary requirement."
          : ""
      );
    }

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.dietaryTypes = formData.getAll("dietaryType");
    localStorage.setItem("andiAndrewRsvpPreview", JSON.stringify(data));
    if (savedName) savedName.textContent = data.name || "guest";
    form.hidden = true;
    if (thankYou) {
      thankYou.hidden = false;
      thankYou.setAttribute("tabindex", "-1");
      thankYou.focus({ preventScroll: true });
      thankYou.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

if (editButton) {
  editButton.addEventListener("click", () => {
    if (thankYou) thankYou.hidden = true;
    if (form) {
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
