
document.addEventListener("DOMContentLoaded", async () => {
    const welcomeSection = document.getElementById('welcomeSection');
    const quizListContainer = document.querySelector(".quiz-list");
    const username = localStorage.getItem("username");
    const quizTakingSection = document.getElementById("quizTakingSection");
    const quizResultsSection = document.getElementById("quizResultsSection");
    const questionContainer = document.getElementById("questionContainer");
    const timerElement = document.getElementById("timer");
    const questionGridContainer = document.getElementById("questionGridContainer");
    const uniqueCodeInput = document.getElementById("uniqueCodeInput");
    const fetchQuizButton = document.getElementById("fetchQuizButton");
    const quicodeBtn=document.getElementById("quizCode");

    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let selectedAnswers = [];
    let timerInterval;
    let timeRemaining;

    let attemptedQuizzes = JSON.parse(localStorage.getItem("attemptedQuizzes")) || {};
    let resultData = JSON.parse(localStorage.getItem("resultData")) || {};

    if (username) {
       quicodeBtn.classList.remove('hidden');
        try {
            const response = await fetch(`https://vishveshwaran-quizwebapp-server.vercel.app/get-quizzes?username=${username}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const quizzes = await response.json();

            quizzes.forEach(quiz => {
                const quizDiv = document.createElement('div');
                quizDiv.className = 'quiz-item';
                const previousScore = resultData[quiz._id] !== undefined ? `${resultData[quiz._id]}/${quiz.questions.length}` : 'Not attempted';
                const attemptLabel = `<span class="attempt-label">Previous Attempt Score: ${previousScore}</span>`;
                quizDiv.innerHTML = `
                    <h3>${quiz.title}</h3>
                    <p>Time: ${quiz.time} minutes</p>
                    ${attemptLabel}
                    <button onclick="startQuiz('${quiz._id}')">Start Quiz</button>
                `;
                quizListContainer.appendChild(quizDiv);
            });
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            alert("Failed to load quizzes. Please try again.");
        }
    }
/////
fetchQuizButton.addEventListener("click", async () => {
    const uniqueCode = uniqueCodeInput.value.trim();
    if (!uniqueCode) {
        alert("Please enter a unique code.");
        return;
    }

    try {
        const response = await fetch(`https://vishveshwaran-quizwebapp-server.vercel.app/get-quizzes/${uniqueCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Quiz by Code:", data);
        currentQuiz = data;

        currentQuestionIndex = 0;
        selectedAnswers = new Array(currentQuiz.questions.length).fill(null);
        timeRemaining = currentQuiz.time * 60; // convert minutes to seconds
        startTimer();
        displayQuestion();
        displayQuestionGrid();
        
        // Ensure quizTakingSection is visible and other sections are hidden
        quizTakingSection.style.display = "block";
        quizListContainer.style.display = "none";
        quizResultsSection.style.display = "none";
        welcomeSection.style.display = 'none';
    } catch (error) {
        console.error("Error fetching quiz by code:", error);
        alert("Failed to fetch quiz. Please try again.");
    }
});
/////
    window.startQuiz = async function (quizId) {
        try {
            const response = await fetch(`https://vishveshwaran-quizwebapp-server.vercel.app/get-quiz/${quizId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched Quiz:", data);
            currentQuiz = data;

            currentQuestionIndex = 0;
            selectedAnswers = new Array(currentQuiz.questions.length).fill(null);
            timeRemaining = currentQuiz.time * 60; // convert minutes to seconds
            startTimer();
            displayQuestion();
            displayQuestionGrid();
            
            // Ensure quizTakingSection is visible and other sections are hidden
            quizTakingSection.style.display = "block";
            quizListContainer.style.display = "none";
            quizResultsSection.style.display = "none";
            welcomeSection.style.display = 'none';
        } catch (error) {
            console.error("Error starting quiz:", error);
            alert("Failed to start quiz. Please try again.");
        }
    };

    function startTimer() {
        timerElement.style.display = "block";
        timerInterval = setInterval(() => {
            timeRemaining--;
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                submitQuiz();
            }
        }, 1000);
    }

    function displayQuestion() {
        const question = currentQuiz.questions[currentQuestionIndex];
        questionContainer.innerHTML = `
            <h2>Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</h2>
            <p>${question.question}</p>
        `;

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";

        question.options.forEach((option, index) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "option-item";
            optionDiv.innerHTML = `
                <input type="radio" name="option" id="option${index}" value="${option}" ${selectedAnswers[currentQuestionIndex] === option ? 'checked' : ''}>
                <label for="option${index}">${option}</label>
            `;
            optionDiv.addEventListener("click", () => {
                selectedAnswers[currentQuestionIndex] = option;
                updateQuestionGrid();
            });
            optionsContainer.appendChild(optionDiv);
        });

        questionContainer.appendChild(optionsContainer);

        const navigationButtons = document.createElement("div");
        navigationButtons.className = "navigation-buttons";

        if (currentQuestionIndex > 0) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "Previous";
            prevButton.onclick = prevQuestion;
            navigationButtons.appendChild(prevButton);
        }

        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.onclick = nextQuestion;
            navigationButtons.appendChild(nextButton);
        } else {
            const submitButton = document.createElement("button");
            submitButton.textContent = "Submit";
            submitButton.onclick = submitQuiz;
            navigationButtons.appendChild(submitButton);
        }

        questionContainer.appendChild(navigationButtons);
    }

    function displayQuestionGrid() {
        questionGridContainer.innerHTML = ''; // Clear previous grid
        currentQuiz.questions.forEach((_, index) => {
            const gridItem = document.createElement("div");
            gridItem.className = "grid-item";
            gridItem.textContent = index + 1;
            gridItem.addEventListener("click", () => {
                currentQuestionIndex = index;
                displayQuestion();
            });
            questionGridContainer.appendChild(gridItem);
        });
        updateQuestionGrid();
    }

    function updateQuestionGrid() {
        const gridItems = questionGridContainer.querySelectorAll(".grid-item");
        gridItems.forEach((item, index) => {
            if (selectedAnswers[index] !== null) {
                item.classList.add("answered");
            } else {
                item.classList.remove("answered");
            }
        });
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    }

    function nextQuestion() {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        }
    }

    async function submitQuiz() {
        clearInterval(timerInterval); // Stop the timer
        try {
            const response = await fetch(`https://vishveshwaran-quizwebapp-server.vercel.app/submit-quiz/${currentQuiz._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    answers: selectedAnswers,
                }),
            });

            const quizResults = await response.json();

            if (response.ok) {
                attemptedQuizzes[currentQuiz._id] = true;
                resultData[currentQuiz._id] = quizResults.score;
                localStorage.setItem("attemptedQuizzes", JSON.stringify(attemptedQuizzes));
                localStorage.setItem("resultData", JSON.stringify(resultData));
                displayResults(quizResults);
            } else {
                alert("Failed to submit quiz.");
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Failed to submit quiz. Please try again.");
        }
    }

    function displayResults(resultData) {
        quizTakingSection.style.display = "none";
        quizResultsSection.style.display = "block";

        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = `
            <h2>Quiz Results</h2>
            <p>Score: ${resultData.score} / ${currentQuiz.questions.length}</p>
        `;

        currentQuiz.questions.forEach((question, index) => {
            const questionResult = document.createElement("div");
            questionResult.className = "question-result";
            questionResult.innerHTML = `
                <h3>Question ${index + 1}</h3>
                <p>${question.question}</p>
                <p><strong>Your Answer:</strong> ${selectedAnswers[index] || 'No Answer'}</p>
                <p><strong>Correct Answer:</strong> ${question.options[question.correct]}</p>
            `;
            resultContainer.appendChild(questionResult);
        });
    }

    const signInLink = document.getElementById("signInLink");
    if (username) {
        signInLink.classList.add('hidden');
        const userNameDisplay = document.getElementById("username-display");
        userNameDisplay.textContent = username;
    }


    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Clear user data from local storage
        localStorage.removeItem('username');
        // localStorage.removeItem('attemptedQuizzes');
        // localStorage.removeItem('resultData');
        
        // Redirect to login or home page
        window.location.href = 'index.html'; // Adjust the path as needed
    });
    



});
