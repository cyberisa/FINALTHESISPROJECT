const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("strength-text");
const meterFill = document.getElementById("meter-fill");
const meter = document.querySelector(".meter");
const criteriaList = document.getElementById("criteria-list");
const toggleVisibility = document.getElementById("toggle-visibility");
const clearNotes = document.getElementById("clear-notes");
const participantCode = document.getElementById("participant-code");
const observerNotes = document.getElementById("observer-notes");
const entropyText = document.getElementById("entropy-text");
const crackTimeText = document.getElementById("crack-time-text");
const warningList = document.getElementById("warning-list");
const recommendationList = document.getElementById("recommendation-list");
const strengthBadge = document.getElementById("strength-badge");
const togglePii = document.getElementById("toggle-pii");
const togglePatterns = document.getElementById("toggle-patterns");
const toggleCommon = document.getElementById("toggle-common");
const policySelect = document.getElementById("policy-select");

const policyPresets = {
  baseline: { minLength: 12 },
  strict: { minLength: 14 },
  survey: { minLength: 10 },
};

const commonPasswords = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
  "student",
  "university",
  "password123",
  "abc123",
];


const getPolicy = () => policyPresets[policySelect.value] ?? policyPresets.baseline;

const hasSequence = (value) => {
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"];
  return sequences.some((sequence) => {
    for (let i = 0; i < sequence.length - 3; i += 1) {
      if (value.includes(sequence.slice(i, i + 4))) {
        return true;
      }
    }
    return false;
  });
};

const hasRepeatedCharacters = (value) => /(.)\1{2,}/.test(value);

const containsPii = (value) => {
  const emailLike = /@/.test(value);
  const studentId = /\b\d{6,}\b/.test(value);
  return emailLike || studentId;
};

const estimateEntropy = (value) => {
  if (!value) return 0;
  const pools = [
    /[a-z]/.test(value) ? 26 : 0,
    /[A-Z]/.test(value) ? 26 : 0,
    /\d/.test(value) ? 10 : 0,
    /[^A-Za-z0-9\s]/.test(value) ? 32 : 0,
  ];
  const poolSize = pools.reduce((sum, count) => sum + count, 0) || 1;
  return Math.round(value.length * Math.log2(poolSize));
};

const estimateCrackTime = (entropy) => {
  if (entropy === 0) return "—";
  const guessesPerSecond = 1e10;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;
  if (seconds < 60) return "seconds";
  if (seconds < 3600) return "minutes";
  if (seconds < 86400) return "hours";
  if (seconds < 31536000) return "days";
  if (seconds < 315360000) return "years";
  return "centuries";
};

const criteria = [
  {
    key: "length",
    test: (value) => value.length >= getPolicy().minLength,
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
  {
    key: "unique",
    test: (value) => !hasRepeatedCharacters(value),
    weight: 1,
  },
  {
    key: "sequence",
    test: (value) => !hasSequence(value),
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
  let percentage = Math.round((score / totalWeight) * 100);

  if (togglePatterns.checked && hasRepeatedCharacters(value)) {
    percentage = Math.max(percentage - 10, 0);
  }
  if (togglePatterns.checked && hasSequence(value)) {
    percentage = Math.max(percentage - 10, 0);
  }
  if (toggleCommon.checked && commonPasswords.includes(value.toLowerCase())) {
    percentage = Math.max(percentage - 20, 0);
  }
  if (togglePii.checked && containsPii(value)) {
    percentage = Math.max(percentage - 10, 0);
  }

  const levelIndex = Math.min(
    strengthLevels.length - 1,
    Math.floor((percentage / 100) * strengthLevels.length)
  );
  const level = strengthLevels[levelIndex];

  meterFill.style.width = `${percentage}%`;
  meterFill.style.background = level.color;
  meter.setAttribute("aria-valuenow", `${percentage}`);
  strengthText.textContent = value ? `Strength: ${level.label} (${percentage}%)` : "Strength: —";
  strengthBadge.textContent = value ? `${level.label}` : "Strength: —";
  strengthBadge.style.background = value ? level.color : "#edf1f9";
  strengthBadge.style.color = value ? "#fff" : "var(--text)";

  const entropy = estimateEntropy(value);
  entropyText.textContent = value ? `Estimated entropy: ${entropy} bits` : "Estimated entropy: —";
  crackTimeText.textContent = value
    ? `Estimated offline crack time: ${estimateCrackTime(entropy)}`
    : "Estimated offline crack time: —";
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

const updateWarnings = (value) => {
  const warnings = [];
  if (!value) {
    warningList.innerHTML = "<li class=\"muted\">No warnings yet.</li>";
    recommendationList.innerHTML = "<li class=\"muted\">Start typing to see recommendations.</li>";
    return;
  }

  if (value.length < getPolicy().minLength) {
    warnings.push(`Password is shorter than ${getPolicy().minLength} characters.`);
  }
  if (togglePatterns.checked && hasSequence(value)) {
    warnings.push("Contains predictable sequences (e.g., 1234 or abcd).");
  }
  if (togglePatterns.checked && hasRepeatedCharacters(value)) {
    warnings.push("Contains repeated characters (e.g., aaaa).");
  }
  if (toggleCommon.checked && commonPasswords.includes(value.toLowerCase())) {
    warnings.push("Matches a common or leaked password phrase.");
  }
  if (togglePii.checked && containsPii(value)) {
    warnings.push("May contain personal information (email or ID-like pattern).");
  }

  const recommendations = [];
  if (!/[A-Z]/.test(value)) recommendations.push("Add at least one uppercase letter.");
  if (!/[a-z]/.test(value)) recommendations.push("Add at least one lowercase letter.");
  if (!/\d/.test(value)) recommendations.push("Include a number.");
  if (!/[^A-Za-z0-9\s]/.test(value)) recommendations.push("Include a symbol for diversity.");
  if (/\s/.test(value)) recommendations.push("Avoid spaces for compatibility.");
  if (value.length < getPolicy().minLength) {
    recommendations.push(`Extend to ${getPolicy().minLength}+ characters.`);
  }

  warningList.innerHTML = warnings.length
    ? warnings.map((item) => `<li>${item}</li>`).join("")
    : "<li class=\"muted\">No warnings detected.</li>";
  recommendationList.innerHTML = recommendations.length
    ? recommendations.map((item) => `<li>${item}</li>`).join("")
    : "<li class=\"muted\">Nice work! This password meets the selected policy.</li>";
};

const updatePolicyLabel = () => {
  const lengthItem = criteriaList.querySelector('[data-criterion="length"]');
  if (lengthItem) {
    lengthItem.textContent = `At least ${getPolicy().minLength} characters`;
  }
};

const handleUpdate = (value) => {
  updateMeter(value);
  updateCriteria(value);
  updateWarnings(value);
};

passwordInput.addEventListener("input", (event) => {
  const value = event.target.value;
  handleUpdate(value);
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

["change", "input"].forEach((eventName) => {
  [togglePii, togglePatterns, toggleCommon, policySelect].forEach((control) => {
    control.addEventListener(eventName, () => {
      updatePolicyLabel();
      handleUpdate(passwordInput.value);
    });
  });
});

updatePolicyLabel();
handleUpdate("");
