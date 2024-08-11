document.addEventListener("DOMContentLoaded", () => {

  const username = localStorage.getItem('username'); // Retrieve the username from localStorage
  const signInLink = document.getElementById('signInLink');

  // Update the navigation bar if the user is signed in
  if (username) {
      signInLink.textContent = username; 
  }


  let uniCode= Math.random().toString(36).slice(2, 8).toUpperCase();
  document.getElementById('uniqueCodeDisplay').textContent = uniCode; 
  const createQuizForm = document.getElementById("createQuizForm");
  const questionsContainer = document.getElementById("questionsContainer");
  const addQuestionButton = document.getElementById("addQuestionButton");
  addQuestionButton.addEventListener("click", () => {
      addQuestion();
  });

  function addQuestion() {
      const questionCount = questionsContainer.children.length + 1;

      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
      questionDiv.innerHTML = `
          <div class="question-number">Question ${questionCount}</div>
          <textarea class="questionText" rows="3" required style="margin: 15px;"></textarea>
          <label>Options:</label>
          <div class="option-group">
              <div class="option-item">
                  <span>A.</span> <input type="text" class="option" required>
              </div>
              <div class="option-item">
                  <span>B.</span> <input type="text" class="option" required>
              </div>
              <div class="option-item">
                  <span>C.</span> <input type="text" class="option">
                  <button type="button" class="remove-option" onclick="removeOption(this)">Remove</button>
              </div>
              <div class="option-item">
                  <span>D.</span> <input type="text" class="option">
                  <button type="button" class="remove-option" onclick="removeOption(this)">Remove</button>
              </div>
          </div>
          <label>Correct Option:</label>
          <input type="number" class="correctOption" min="1" max="4" required>
          <button type="button" class="remove-question" onclick="removeQuestion(this)">Remove Question</button>
      `;
      questionsContainer.appendChild(questionDiv);
  }
  // function generateUniqueCode() {
   
  // }
 

  createQuizForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const quizTitle = document.getElementById("quizTitle").value;
      const quizTime = parseInt(document.getElementById("quizTime").value);
      const questions = Array.from(document.getElementsByClassName("question")).map(questionDiv => {
          const questionText = questionDiv.querySelector(".questionText").value;
          const options = Array.from(questionDiv.getElementsByClassName("option")).map(optionInput => optionInput.value);
          const correctOption = parseInt(questionDiv.querySelector(".correctOption").value) - 1;
          
          return { question: questionText, options, correct: correctOption };
      });
      // uniCode=parseInt(uniCode);
      try {
          const response = await fetch("https://vishveshwaran-quizwebapp-server.vercel.app//create-quiz", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Username":"username",
              },
              body: JSON.stringify({ title: quizTitle, time: quizTime, questions,uniqueCode:uniCode ,username})
          });
          const result = await response.json();
          if (response.ok) {
              alert("Quiz created successfully!");
              createQuizForm.reset();
              window.location.href = "index.html";
          } else {
              alert(result.message || "An error occurred while creating the quiz.");
          }
      } catch (error) {
          console.error("Error creating quiz:", error);
          alert("Failed to create quiz. Please try again.");
      }
  });
});



function removeOption(button) {
  const optionItem = button.parentElement;
  if (optionItem) {
      optionItem.remove();
      updateCorrectOptionLimits();
  }
}

function removeQuestion(button) {
  const questionDiv = button.closest(".question");
  if (questionDiv) {
      questionDiv.remove();
      updateQuestionNumbers();
  }
}

function updateQuestionNumbers() {
  const questions = document.querySelectorAll("#questionsContainer .question");
  questions.forEach((question, index) => {
      const questionNumber = question.querySelector(".question-number");
      if (questionNumber) {
          questionNumber.textContent = `Question ${index + 1}`;
      }
  });
}

function updateCorrectOptionLimits() {
  const optionGroups = document.querySelectorAll(".option-group");
  optionGroups.forEach(group => {
      const correctOptionInput = group.parentElement.querySelector(".correctOption");
      const optionCount = group.querySelectorAll(".option-item").length;
      correctOptionInput.max = optionCount;
  });

 
}
