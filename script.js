const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("strength-text");
const meterFill = document.getElementById("meter-fill");
const meter = document.querySelector(".meter");
const criteriaList = document.getElementById("criteria-list");
const toggleVisibility = document.getElementById("toggle-visibility");
const clearNotes = document.getElementById("clear-notes");
const participantCode = document.getElementById("participant-code");
const observerNotes = document.getElementById("observer-notes");

const criteria = [
  {
    key: "length",
    test: (value) => value.length >= 12,
    weight: 2,
  },
  {
    key: "lowercase",
    test: (value) => /[a-z]/.test(value),
    weight: 1,
  },
  {
    key: "uppercase",
    test: (value) => /[A-Z]/.test(value),
    weight: 1,
  },
  {
    key: "number",
    test: (value) => /\d/.test(value),
    weight: 1,
  },
  {
    key: "symbol",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
    weight: 1,
  },
  {
    key: "spaces",
    test: (value) => value.length > 0 && !/\s/.test(value),
    weight: 1,
  },
];

const strengthLevels = [
  { label: "Very weak", color: "#d64545" },
  { label: "Weak", color: "#e07a3f" },
  { label: "Fair", color: "#e0a800" },
  { label: "Good", color: "#4c9f70" },
  { label: "Strong", color: "#2e8b57" },
];

const updateMeter = (value) => {
  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const score = criteria.reduce((sum, item) => sum + (item.test(value) ? item.weight : 0), 0);
  const percentage = Math.round((score / totalWeight) * 100);

  const levelIndex = Math.min(
    strengthLevels.length - 1,
    Math.floor((percentage / 100) * strengthLevels.length)
  );
  const level = strengthLevels[levelIndex];

  meterFill.style.width = `${percentage}%`;
  meterFill.style.background = level.color;
  meter.setAttribute("aria-valuenow", `${percentage}`);
  strengthText.textContent = value
    ? `Strength: ${level.label} (${percentage}%)`
    : "Strength: —";
};

const updateCriteria = (value) => {
  const items = criteriaList.querySelectorAll("li");
  items.forEach((item) => {
    const key = item.getAttribute("data-criterion");
    const rule = criteria.find((entry) => entry.key === key);
    const met = rule ? rule.test(value) : false;

    item.classList.toggle("met", met);
  });
};

passwordInput.addEventListener("input", (event) => {
  const value = event.target.value;
  updateMeter(value);
  updateCriteria(value);
});

toggleVisibility.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleVisibility.textContent = isHidden ? "Hide" : "Show";
  toggleVisibility.setAttribute("aria-pressed", `${isHidden}`);
});

clearNotes.addEventListener("click", () => {
  participantCode.value = "";
  observerNotes.value = "";
});

updateMeter("");
