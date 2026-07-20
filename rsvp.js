const form = document.querySelector("#rsvp-form");
const thankYou = document.querySelector("#thank-you");
const savedName = document.querySelector("#saved-name");
const editButton = document.querySelector("#edit-response");
const message = document.querySelector("#message");
const messageCount = document.querySelector("#message-count");

if (message && messageCount) {
  const updateCount = () => {
    messageCount.textContent = String(message.value.length);
  };
  message.addEventListener("input", updateCount);
  updateCount();
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem("andiAndrewRsvpPreview", JSON.stringify(data));
    savedName.textContent = data.name || "guest";
    form.hidden = true;
    thankYou.hidden = false;
    thankYou.focus({ preventScroll: true });
    thankYou.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

if (editButton) {
  editButton.addEventListener("click", () => {
    thankYou.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
