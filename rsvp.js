const form = document.querySelector("#rsvp-form");
const thankYou = document.querySelector("#thank-you");
const savedName = document.querySelector("#saved-name");
const editButton = document.querySelector("#edit-response");

const message = document.querySelector("#message");
const messageCount = document.querySelector("#message-count");

const attendingFields = document.querySelector("#attending-fields");
const attendanceRadios = Array.from(
  document.querySelectorAll('input[name="attendance"]')
);

const dietaryCheckboxes = Array.from(
  document.querySelectorAll('input[name="dietaryType"]')
);

const dietaryDetailsWrap = document.querySelector(
  "#dietary-details-wrap"
);

const dietaryDetails = document.querySelector(
  'textarea[name="dietaryDetails"]'
);

const submitButton = form?.querySelector('button[type="submit"]');

let formStatus = document.querySelector("#form-status");

if (form && !formStatus) {
  formStatus = document.createElement("p");
  formStatus.id = "form-status";
  formStatus.className = "form-help";
  formStatus.setAttribute("role", "status");
  formStatus.setAttribute("aria-live", "polite");

  if (submitButton) {
    submitButton.insertAdjacentElement("afterend", formStatus);
  } else {
    form.appendChild(formStatus);
  }
}


/* Message character counter */

if (message && messageCount) {
  const updateCount = () => {
    messageCount.textContent = String(message.value.length);
  };

  message.addEventListener("input", updateCount);
  updateCount();
}


/* Show or hide fields depending on attendance */

function updateAttendanceFields() {
  const selectedAttendance = document.querySelector(
    'input[name="attendance"]:checked'
  )?.value;

  const isAttending = selectedAttendance === "yes";

  if (attendingFields) {
    attendingFields.hidden = !isAttending;

    attendingFields
      .querySelectorAll("input, select, textarea")
      .forEach((field) => {
        field.disabled = !isAttending;
      });
  }
}

attendanceRadios.forEach((radio) => {
  radio.addEventListener("change", updateAttendanceFields);
});

updateAttendanceFields();


/* Dietary checkbox behaviour */

function updateDietaryFields(changedCheckbox) {
  const noneCheckbox = dietaryCheckboxes.find(
    (checkbox) => checkbox.value === "None"
  );

  if (
    changedCheckbox?.value === "None" &&
    changedCheckbox.checked
  ) {
    dietaryCheckboxes.forEach((checkbox) => {
      if (checkbox !== noneCheckbox) {
        checkbox.checked = false;
      }
    });
  } else if (changedCheckbox?.checked && noneCheckbox) {
    noneCheckbox.checked = false;
  }

  const selectedDietary = dietaryCheckboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const needsDetails =
    selectedDietary.includes("Nut allergy") ||
    selectedDietary.includes(
      "Other allergy or dietary requirement"
    );

  const showDetails = selectedDietary.some(
    (value) => value !== "None"
  );

  if (dietaryDetailsWrap) {
    dietaryDetailsWrap.hidden = !showDetails;
  }

  if (dietaryDetails) {
    dietaryDetails.required = needsDetails;
    dietaryDetails.setCustomValidity("");

    if (!showDetails) {
      dietaryDetails.value = "";
    }
  }
}

dietaryCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    updateDietaryFields(checkbox);
  });
});

updateDietaryFields();


/* Convert visible dietary labels into database values */

function mapDietaryValue(value) {
  const valueMap = {
    None: "none",
    Vegetarian: "vegetarian",
    Vegan: "vegan",
    "Gluten-free": "gluten-free",
    "Dairy-free": "dairy-free",
    "Nut allergy": "nut-allergy",
    "Other allergy or dietary requirement": "other"
  };

  return valueMap[value] || value.toLowerCase();
}


/* Convert the other guest names field into an array */

function getGuestNames(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}


/* Safely read the API response */

async function readJsonResponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {};
  }
}


/* Submit the RSVP to the Vercel API */

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (formStatus) {
      formStatus.textContent = "";
    }

    const selectedDietaryLabels = dietaryCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const requiresDietaryDetails =
      selectedDietaryLabels.includes("Nut allergy") ||
      selectedDietaryLabels.includes(
        "Other allergy or dietary requirement"
      );

    if (dietaryDetails) {
      dietaryDetails.setCustomValidity(
        requiresDietaryDetails &&
          !dietaryDetails.value.trim()
          ? "Please provide details of the allergy or dietary requirement."
          : ""
      );
    }

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);

    const attendance = String(
      formData.get("attendance") || ""
    );

    const leadGuestName = String(
      formData.get("name") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim();

    const guestCount =
      attendance === "yes"
        ? Number.parseInt(
            String(formData.get("guestCount") || "1"),
            10
          )
        : 0;

    const guestNames =
      attendance === "yes"
        ? getGuestNames(
            String(formData.get("guestNames") || "")
          )
        : [];

    const dietaryRequirements =
      attendance === "yes"
        ? selectedDietaryLabels.map(mapDietaryValue)
        : [];

    const dietaryDetailsValue =
      attendance === "yes"
        ? String(
            formData.get("dietaryDetails") || ""
          ).trim()
        : "";

    const guestMessage = String(
      formData.get("message") || ""
    ).trim();

    const payload = {
      attendance,
      leadGuestName,
      email,
      guestCount,
      guestNames,
      dietaryRequirements,
      dietaryDetails: dietaryDetailsValue,
      guestMessage
    };

    const originalButtonText =
      submitButton?.textContent || "Submit RSVP";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending RSVP…";
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await readJsonResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "We could not save your RSVP. Please try again."
        );
      }

      if (savedName) {
        savedName.textContent =
          leadGuestName || "guest";
      }

      form.hidden = true;

      if (thankYou) {
        thankYou.hidden = false;
        thankYou.setAttribute("tabindex", "-1");
        thankYou.focus({
          preventScroll: true
        });

        thankYou.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    } catch (error) {
      console.error("RSVP submission error:", error);

      if (formStatus) {
        formStatus.textContent =
          error instanceof Error
            ? error.message
            : "We could not save your RSVP. Please try again.";

        formStatus.setAttribute("tabindex", "-1");
        formStatus.focus();
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}


/* Allow the guest to return to the form */

if (editButton) {
  editButton.addEventListener("click", () => {
    if (thankYou) {
      thankYou.hidden = true;
    }

    if (form) {
      form.hidden = false;

      form.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}
