document.addEventListener("DOMContentLoaded", function () {
  // Store sample text options for each difficulty setting.
  // The typing test randomly selects one of these passages when the
  // user chooses a difficulty or starts a new test.
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

  // Get references to the interactive elements on the page.
  // These are used to read user input, update the sample text,
  // and show the computed results in the UI.
  const difficultySelect = document.getElementById("difficulty");
  const sampleText = document.getElementById("sample-text");
  const userInput = document.getElementById("user-input");
  const retryBtn = document.getElementById("retry-btn");
  const levelOutput = document.getElementById("level-result");
  const timeOutput = document.getElementById("time-result");
  const wpmOutput = document.getElementById("wpm-result");

  // This variable stores the timestamp when the user begins typing.
  // It is later used to compute the elapsed time for the WPM calculation.
  let startTime = null;

  // This variable stores the sample text currently shown to the user.
  // We compare the user's final typed text against this exact sample.
  let currentSample = "";

  // Current UI state for the typing test.
  // idle   -> waiting for the first keystroke
  // running -> timer is active
  // completed -> test finished and results are shown
  let testState = "idle";

  // Change the UI state and update controls accordingly.
  function updateUiState(state) {
    testState = state;

    if (state === "idle") {
      userInput.disabled = false;
      userInput.placeholder = "Type here to start the test";
      retryBtn.disabled = false;
    } else if (state === "running") {
      userInput.disabled = false;
      userInput.placeholder = "Typing... press Enter to stop";
      retryBtn.disabled = true;
    } else if (state === "completed") {
      userInput.disabled = true;
      userInput.placeholder = "Test complete. Press Retry to try again";
      retryBtn.disabled = false;
    }
  }

  // Choose a random sample text for the selected difficulty.
  // This function updates both the displayed sample text and the
  // difficulty label shown in the Results area.
  function updateSampleText() {
    const selectedDifficulty = difficultySelect.value.toLowerCase();
    const texts = typingTexts[selectedDifficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);

    currentSample = texts[randomIndex];
    sampleText.textContent = currentSample;
    updateResultLevel();
  }

  // Update the level indicator in the Results box.
  // This keeps the UI in sync with the difficulty selected by the user.
  function updateResultLevel() {
    const selectedDifficulty = difficultySelect.value;
    levelOutput.textContent = `Level: ${selectedDifficulty}`;
  }

  // Convert elapsed seconds into a simple display string.
  // This ensures the time result appears as "0s", "1s", "15s", etc.
  function formatTime(seconds) {
    return `${seconds}s`;
  }

  // Count how many words the user typed correctly.
  // The function compares each typed word against the corresponding
  // word in the sample text and counts only exact matches.
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

  // Calculate the words per minute result.
  // The formula uses the number of correctly typed words and the elapsed
  // time (in seconds), then converts to minutes and rounds to a whole number.
  function calculateWpm(correctWords, seconds) {
    if (seconds <= 0) {
      return 0;
    }
    return Math.round((correctWords / seconds) * 60);
  }

  // Helper function to escape HTML special characters to prevent injection.
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Highlight the sample text in real-time based on what the user has typed.
  // Correctly typed words are shown in blue, incorrectly typed words in red.
  function highlightSampleText() {
    const sampleWords = currentSample.trim().split(/\s+/);
    const typedText = userInput.value;
    const typedWords = typedText.trim().split(/\s+/);

    let highlightedHTML = "";

    for (let i = 0; i < sampleWords.length; i++) {
      const sampleWord = sampleWords[i];
      const typedWord = typedWords[i] || "";

      if (typedWord === sampleWord) {
        // Correct word - highlight in blue
        highlightedHTML += `<span style="color: blue; font-weight: bold;">${escapeHtml(sampleWord)}</span> `;
      } else if (typedWord.length > 0) {
        // Incorrect word - highlight in red
        highlightedHTML += `<span style="color: red; font-weight: bold;">${escapeHtml(sampleWord)}</span> `;
      } else {
        // Not yet typed - keep normal color
        highlightedHTML += `<span>${escapeHtml(sampleWord)}</span> `;
      }
    }

    sampleText.innerHTML = highlightedHTML;
  }

  // Start the typing test.
  // When triggered by a button, this clears previous input.
  // When triggered by the first keystroke, it keeps the first character.
  function startTest({ clearInput = false } = {}) {
    if (testState === "running") {
      return;
    }

    if (clearInput) {
      userInput.value = "";
    }

    userInput.disabled = false;
    userInput.focus();

    if (!startTime) {
      startTime = Date.now();
    }

    timeOutput.textContent = "Time: 0s";
    wpmOutput.textContent = "WPM: 0";
    updateUiState("running");
  }

  // Stop the test and calculate the final results.
  // This reads the typed text, computes elapsed seconds, counts correct words,
  // and then calculates the rounded WPM value.
  function stopTest() {
    if (testState !== "running" || !startTime) {
      return;
    }

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const typedText = userInput.value;
    const correctWords = countCorrectWords(currentSample, typedText);
    const wpm = calculateWpm(correctWords, elapsedSeconds);

    timeOutput.textContent = `Time: ${formatTime(elapsedSeconds)}`;
    wpmOutput.textContent = `WPM: ${wpm}`;

    userInput.disabled = true;
    startTime = null;
    updateUiState("completed");
  }

  // Reset the test state back to its initial values.
  // This clears the text area, resets the timer and results, and loads a new sample.
  function resetTest() {
    userInput.value = "";
    startTime = null;
    timeOutput.textContent = "Time: 0s";
    wpmOutput.textContent = "WPM: 0";
    updateSampleText();
    sampleText.innerHTML = escapeHtml(currentSample);
    updateUiState("idle");
  }

  // Add event listeners for user actions.
  // The difficulty selector loads a new sample text when changed.
  // The input field triggers the test start on first keystroke.
  difficultySelect.addEventListener("change", updateSampleText);
  retryBtn.addEventListener("click", resetTest);
  userInput.addEventListener("input", highlightSampleText);
  userInput.addEventListener("keydown", function (event) {
    if (testState === "idle") {
      const isModifierKey = event.ctrlKey || event.metaKey || event.altKey;
      if (!isModifierKey && event.key !== "Enter" && event.key !== "Tab") {
        startTest();
      }
    }

    if (testState === "running" && event.key === "Enter") {
      event.preventDefault();
      stopTest();
    }
  });

  // Initialize the page with a sample text and reset the results.
  updateSampleText();
  resetTest();
});

