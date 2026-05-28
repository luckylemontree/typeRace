document.addEventListener("DOMContentLoaded", function () {
  // Store sample texts for each difficulty level
  const typingTexts = {
    easy: [
      "The cat sat on the mat.",
      "I like to read books.",
      "The sun is bright today."
    ],
    medium: [
      "Typing every day helps improve speed and accuracy.",
      "A good morning routine can make the whole day better.",
      "Learning new skills takes patience, focus, and practice."
    ],
    hard: [
      "Success in typing tests depends on concentration, consistency, and correct finger placement.",
      "Technology continues to shape communication, education, and the way people work every day.",
      "Practising difficult typing passages regularly can improve both accuracy and confidence over time."
    ]
  };

  // Get page elements
const difficultySelect = document.getElementById("difficulty"); // Get the difficulty dropdown
const sampleText = document.getElementById("sample-text"); // Get the sample text display box
const userInput = document.getElementById("user-input"); // Get the textarea where the user types
const startBtn = document.getElementById("start-btn"); // Get the Start button
const stopBtn = document.getElementById("stop-btn"); // Get the Stop button
const retryBtn = document.getElementById("retry-btn"); // Get the Retry button
const levelOutput = document.getElementById("level-result"); // Get the element that shows the selected level
const timeOutput = document.getElementById("time-result"); // Get the element that shows the test time
const wpmOutput = document.getElementById("wpm-result"); // Get the element that shows the WPM result


  let startTime = null;
  let currentSample = "";

  // Function to choose and display a random text
  function updateSampleText() {
    const selectedDifficulty = difficultySelect.value.toLowerCase();
    const texts = typingTexts[selectedDifficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);

    currentSample = texts[randomIndex];
    sampleText.textContent = currentSample;
    updateResultLevel();
  }

  function updateResultLevel() {
    const selectedDifficulty = difficultySelect.value;
    levelOutput.textContent = `Level: ${selectedDifficulty}`;
  }

  function formatTime(seconds) {
    return `${seconds}s`;
  }

  function countCorrectWords(sample, typed) {
    const sampleWords = sample.trim().split(/\s+/);
    const typedWords = typed.trim().split(/\s+/);

    let correctCount = 0;
    for (let i = 0; i < typedWords.length && i < sampleWords.length; i++) {
      if (typedWords[i] === sampleWords[i]) {
        correctCount += 1;
      }
    }

    return correctCount;
  }

  function calculateWpm(correctWords, seconds) {
    if (seconds <= 0) {
      return 0;
    }
    return Math.round((correctWords / seconds) * 60);
  }

  function startTest() {
    startTime = Date.now();
    userInput.value = "";
    userInput.disabled = false;
    userInput.focus();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    retryBtn.disabled = false;
    timeOutput.textContent = "Time: 0s";
    wpmOutput.textContent = "WPM: 0";
    updateResultLevel();
  }

  function stopTest() {
    if (!startTime) {
      return;
    }

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const typedText = userInput.value || "";
    const correctWords = countCorrectWords(currentSample, typedText);
    const wpm = calculateWpm(correctWords, elapsedSeconds);

    timeOutput.textContent = `Time: ${formatTime(elapsedSeconds)}`;
    wpmOutput.textContent = `WPM: ${wpm}`;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    startTime = null;
  }

  function resetTest() {
    userInput.value = "";
    userInput.disabled = true;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    retryBtn.disabled = false;
    startTime = null;
    timeOutput.textContent = "Time: 0s";
    wpmOutput.textContent = "WPM: 0";
    updateResultLevel();
  }

  // Update text when difficulty changes
  difficultySelect.addEventListener("change", updateSampleText);

  // Start, stop, and retry buttons
  startBtn.addEventListener("click", startTest);
  stopBtn.addEventListener("click", stopTest);
  retryBtn.addEventListener("click", resetTest);

  // Initialize page state
  updateSampleText();
  resetTest();
});

