const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const honeypot = form.querySelector('input[name="company"]');

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

  fetch(form.action, {
    method: "POST",
    body: formData,
    headers: {
      "Accept": "application/json"
    }
  })
    .then(response => {
      if (response.ok) {
        status.textContent = "✅ Message sent successfully!";
        status.classList.add("success");
        form.reset();
      } else {
        return response.json().then(data => {
          throw new Error(data.error || "Something went wrong");
        });
      }
    })
    .catch(() => {
      status.textContent = "❌ Oops! There was a problem sending your message.";
      status.classList.add("error");
    });
});

function scrollToContact() {
  document.getElementById("contact").scrollIntoView({
    behavior: "smooth"
  });
}

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
