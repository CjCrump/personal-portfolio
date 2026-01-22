const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const honeypot = form.querySelector('input[name="bot-field"]');

form.addEventListener("submit", function (e) {
  e.preventDefault(); // Stop normal form submit

  let isValid = true;
  clearErrors();
  status.textContent = "";
  status.className = "";

  // honeypot

  if (honeypot.value !== "") {
  // Bot detected – silently fail
  status.textContent = "❌ Submission blocked.";
  status.classList.add("error");
  return;
}

  if (nameInput.value.trim() === "") {
    showError(nameInput, "Name is required");
    isValid = false;
  }

  if (emailInput.value.trim() === "") {
    showError(emailInput, "Email is required");
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, "Enter a valid email address");
    isValid = false;
  }

  if (messageInput.value.trim() === "") {
    showError(messageInput, "Message is required");
    isValid = false;
  }

  if (!isValid) return;

  const formData = new FormData(form);

  fetch("/", {
  method: "POST",
  body: formData
})
  .then(() => {
    status.textContent = "✅ Thanks! Your message has been sent.";
    status.classList.add("success");
    form.reset();
  })
  .catch(() => {
    status.textContent = "❌ Something went wrong. Please try again.";
    status.classList.add("error");
  });

});

function showError(input, message) {
  const error = input.nextElementSibling;
  error.textContent = message;
  input.classList.add("error-border");
}

function clearErrors() {
  document.querySelectorAll(".error").forEach(err => err.textContent = "");
  document.querySelectorAll(".error-border").forEach(el => el.classList.remove("error-border"));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// clear errors while typing 

[nameInput, emailInput, messageInput].forEach(input => {
  input.addEventListener("input", () => {
    input.classList.remove("error-border");
    input.nextElementSibling.textContent = "";
  });
});

// ======================
// Smooth scroll to contact section
// ======================

const scrollButton = document.querySelector(".scroll-contact");

if (scrollButton) {
  scrollButton.addEventListener("click", () => {
    const contactSection = document.getElementById("contact");

    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
}

//==============//
//disable button during submit
//==============//

const submitBtn = form.querySelector("button");

submitBtn.disabled = true;

fetch("/")
  .then(() => {
    status.textContent = "✅ Thanks! Your message has been sent.";
    status.classList.add("success");
    form.reset();
  })
  .finally(() => {
    submitBtn.disabled = false;
  });

