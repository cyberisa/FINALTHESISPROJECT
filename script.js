const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("strength-text");
const meterFill = document.getElementById("meter-fill");
const meter = document.querySelector(".meter");
const criteriaList = document.getElementById("criteria-list");
const toggleVisibility = document.getElementById("toggle-visibility");
const clearNotes = document.getElementById("clear-notes");
const clearAll = document.getElementById("clear-all");
const participantCode = document.getElementById("participant-code");
const observerNotes = document.getElementById("observer-notes");
const participantName = document.getElementById("participant-name");
const participantEmail = document.getElementById("participant-email");
const studentId = document.getElementById("student-id");
const ageGroup = document.getElementById("age-group");
const department = document.getElementById("department");
const deviceSelect = document.getElementById("device");
const entropyText = document.getElementById("entropy-text");
const crackTimeText = document.getElementById("crack-time-text");
const warningList = document.getElementById("warning-list");
const recommendationList = document.getElementById("recommendation-list");
const explainList = document.getElementById("explain-list");
const strengthBadge = document.getElementById("strength-badge");
const togglePii = document.getElementById("toggle-pii");
const togglePatterns = document.getElementById("toggle-patterns");
const toggleCommon = document.getElementById("toggle-common");
const toggleSurvey = document.getElementById("toggle-survey");
const toggleTooltips = document.getElementById("toggle-tooltips");
const consentCheckbox = document.getElementById("consent-checkbox");
const policySelect = document.getElementById("policy-select");
const themeToggle = document.getElementById("theme-toggle");
const chartBar = document.getElementById("chart-bar");
const chipGrid = document.getElementById("chip-grid");
const generateBtn = document.getElementById("generate-btn");
const genLength = document.getElementById("gen-length");
const genSymbols = document.getElementById("gen-symbols");
const genPassphrase = document.getElementById("gen-passphrase");
const generatedPassword = document.getElementById("generated-password");
const copyBtn = document.getElementById("copy-btn");
const exportBtn = document.getElementById("export-btn");

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

const dictionaryWords = [
  "student",
  "university",
  "campus",
  "admin",
  "welcome",
  "football",
  "monkey",
  "dragon",
  "iloveyou",
  "princess",
  "computer",
  "security",
  "college",
];

const keyboardPatterns = ["qwerty", "asdf", "zxcv", "1q2w3e", "password", "1234"];

const passphraseWords = [
  "river",
  "cloud",
  "campus",
  "puzzle",
  "maple",
  "studio",
  "amber",
  "signal",
  "orbit",
  "harbor",
  "winter",
  "jungle",
  "story",
];

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeLeet = (value) =>
  value
    .toLowerCase()
    .replace(/4/g, "a")
    .replace(/@/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/7/g, "t");

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

const hasRepeatedSubstring = (value) => /(.{2,})\1/.test(value);

const hasDatePattern = (value) => /(19|20)\d{2}/.test(value) || /\d{2}[/-]\d{2}/.test(value);

const hasDictionaryWord = (value) => {
  const cleaned = normalize(value);
  return dictionaryWords.some((word) => cleaned.includes(word));
};

const hasLeetspeak = (value) => {
  const converted = normalizeLeet(value);
  return dictionaryWords.some((word) => converted.includes(word));
};

const hasKeyboardPattern = (value) => {
  const cleaned = normalize(value);
  return keyboardPatterns.some((pattern) => cleaned.includes(pattern));
};

const containsPii = (value) => {
  const emailLike = /@/.test(value);
  const studentIdPattern = /\b\d{6,}\b/.test(value);
  const name = normalize(participantName.value || "");
  const email = normalize(participantEmail.value || "");
  const id = normalize(studentId.value || "");
  const cleaned = normalize(value);
  const matchesProfile =
    (name && cleaned.includes(name)) ||
    (email && cleaned.includes(email.split("@")[0])) ||
    (id && cleaned.includes(id));
  return emailLike || studentIdPattern || matchesProfile;
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
  {
    key: "dictionary",
    test: (value) => !hasDictionaryWord(value),
    weight: 1,
  },
  {
    key: "leet",
    test: (value) => !hasLeetspeak(value),
    weight: 1,
  },
  {
    key: "date",
    test: (value) => !hasDatePattern(value),
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
  if (togglePatterns.checked && hasKeyboardPattern(value)) {
    percentage = Math.max(percentage - 10, 0);
  }
  if (togglePatterns.checked && hasRepeatedSubstring(value)) {
    percentage = Math.max(percentage - 10, 0);
  }
  if (togglePatterns.checked && hasDatePattern(value)) {
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
  strengthBadge.textContent = value
    ? `${level.label} ${percentage >= 80 ? "🟢" : "🟡"}`
    : "Strength: —";
  strengthBadge.style.background = value ? level.color : "#edf1f9";
  strengthBadge.style.color = value ? "#fff" : "var(--text)";
  meterFill.classList.toggle("pulse", percentage >= 80);
  chartBar.style.width = `${percentage}%`;

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

  const chips = chipGrid.querySelectorAll(".chip");
  chips.forEach((chip) => {
    const label = chip.textContent.toLowerCase();
    if (label.includes("length")) chip.classList.toggle("met", value.length >= getPolicy().minLength);
    if (label.includes("uppercase")) chip.classList.toggle("met", /[A-Z]/.test(value));
    if (label.includes("lowercase")) chip.classList.toggle("met", /[a-z]/.test(value));
    if (label.includes("number")) chip.classList.toggle("met", /\d/.test(value));
    if (label.includes("symbol")) chip.classList.toggle("met", /[^A-Za-z0-9\s]/.test(value));
    if (label.includes("repeats")) chip.classList.toggle("met", !hasRepeatedCharacters(value));
    if (label.includes("sequences")) chip.classList.toggle("met", !hasSequence(value));
  });
};

const updateWarnings = (value) => {
  const warnings = [];
  if (!value) {
    warningList.innerHTML = "<li class=\"muted\">No warnings yet.</li>";
    recommendationList.innerHTML = "<li class=\"muted\">Start typing to see recommendations.</li>";
    explainList.innerHTML = "<li class=\"muted\">We will explain once you start typing.</li>";
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
  if (togglePatterns.checked && hasKeyboardPattern(value)) {
    warnings.push("Contains a keyboard pattern (e.g., qwerty).");
  }
  if (togglePatterns.checked && hasRepeatedSubstring(value)) {
    warnings.push("Contains repeated substring patterns.");
  }
  if (togglePatterns.checked && hasDatePattern(value)) {
    warnings.push("Contains a date or year pattern.");
  }
  if (hasDictionaryWord(value)) {
    warnings.push("Includes a common dictionary word.");
  }
  if (hasLeetspeak(value)) {
    warnings.push("Leetspeak substitution detected (e.g., p@ssw0rd).");
  }

  const easy = [];
  const medium = [];
  const strong = [];
  if (!/[A-Z]/.test(value)) easy.push("Add at least one uppercase letter.");
  if (!/[a-z]/.test(value)) easy.push("Add at least one lowercase letter.");
  if (!/\d/.test(value)) easy.push("Include a number.");
  if (!/[^A-Za-z0-9\s]/.test(value)) easy.push("Include a symbol for diversity.");
  if (/\s/.test(value)) medium.push("Avoid spaces for compatibility.");
  if (value.length < getPolicy().minLength) {
    strong.push(`Extend to ${getPolicy().minLength}+ characters.`);
  }
  if (hasDictionaryWord(value)) medium.push("Replace dictionary words with a phrase.");
  if (hasLeetspeak(value)) medium.push("Avoid obvious substitutions (e.g., @ for a).");
  if (hasDatePattern(value)) medium.push("Remove years or date patterns.");
  if (togglePatterns.checked && hasRepeatedCharacters(value)) strong.push("Reduce repeated characters.");

  warningList.innerHTML = warnings.length
    ? warnings.map((item) => `<li>${item}</li>`).join("")
    : "<li class=\"muted\">No warnings detected.</li>";

  const buildSection = (label, items) =>
    items.length
      ? `<li class=\"muted\"><strong>${label}</strong></li>${items
          .map((item) => `<li>${item}</li>`)
          .join("")}`
      : "";

  const recommendationHtml =
    buildSection("Easy fixes", easy) +
    buildSection("Medium fixes", medium) +
    buildSection("Stronger upgrades", strong);

  recommendationList.innerHTML = recommendationHtml
    ? recommendationHtml
    : "<li class=\"muted\">Nice work! This password meets the selected policy.</li>";

  explainList.innerHTML = warnings.length
    ? warnings.map((item) => `<li>${item}</li>`).join("")
    : "<li class=\"muted\">No obvious weaknesses detected.</li>";
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

const setConsentState = () => {
  const enabled = consentCheckbox.checked;
  passwordInput.disabled = !enabled;
  toggleVisibility.disabled = !enabled;
  generateBtn.disabled = !enabled;
  if (!enabled) {
    passwordInput.value = "";
    handleUpdate("");
  }
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

clearAll.addEventListener("click", () => {
  passwordInput.value = "";
  participantCode.value = "";
  observerNotes.value = "";
  participantName.value = "";
  participantEmail.value = "";
  studentId.value = "";
  ageGroup.value = "";
  department.value = "";
  deviceSelect.value = "";
  generatedPassword.value = "";
  handleUpdate("");
});

["change", "input"].forEach((eventName) => {
  [togglePii, togglePatterns, toggleCommon, policySelect, toggleSurvey, toggleTooltips].forEach(
    (control) => {
      control.addEventListener(eventName, () => {
        updatePolicyLabel();
        document.body.classList.toggle("survey", toggleSurvey.checked);
        document.body.classList.toggle("show-tooltips", toggleTooltips.checked);
        handleUpdate(passwordInput.value);
      });
    }
  );
});

consentCheckbox.addEventListener("change", setConsentState);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", `${isDark}`);
});

generateBtn.addEventListener("click", () => {
  const length = Number(genLength.value) || 16;
  const includeSymbols = genSymbols.checked;
  const usePassphrase = genPassphrase.checked;
  if (usePassphrase) {
    const words = Array.from({ length: 3 }, () => passphraseWords[Math.floor(Math.random() * passphraseWords.length)]);
    generatedPassword.value = `${words.join("-")}${includeSymbols ? "!" : ""}`;
    return;
  }
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}";
  let chars = letters + numbers;
  if (includeSymbols) chars += symbols;
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  generatedPassword.value = output;
});

copyBtn.addEventListener("click", async () => {
  if (!generatedPassword.value) return;
  await navigator.clipboard.writeText(generatedPassword.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = "Copy";
  }, 1500);
});

exportBtn.addEventListener("click", () => {
  const data = [
    ["Participant Code", participantCode.value],
    ["Name", participantName.value],
    ["Email", participantEmail.value],
    ["Student ID", studentId.value],
    ["Age Group", ageGroup.value],
    ["Department", department.value],
    ["Device", deviceSelect.value],
    ["Strength", strengthText.textContent],
    ["Entropy", entropyText.textContent],
    ["Crack Time", crackTimeText.textContent],
    ["Warnings", warningList.textContent.trim()],
  ];
  const csv = data
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "password-study-summary.csv";
  link.click();
  URL.revokeObjectURL(url);
});

[
  participantName,
  participantEmail,
  studentId,
  ageGroup,
  department,
  deviceSelect,
].forEach((field) => {
  field.addEventListener("input", () => handleUpdate(passwordInput.value));
});

updatePolicyLabel();
document.body.classList.toggle("show-tooltips", toggleTooltips.checked);
document.body.classList.toggle("survey", toggleSurvey.checked);
setConsentState();
handleUpdate("");
