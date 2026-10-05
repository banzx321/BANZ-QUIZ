import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";


// =====================================================
// FIREBASE CONFIG
// GANTI BAGIAN INI DENGAN CONFIG FIREBASE ABANG
// =====================================================

const firebaseConfig = {
  apiKey: "Banz...",
  authDomain: "banz-quiz.firebaseapp.com",
  databaseURL: "https://banz-quiz-default-rtdb.firebaseio.com",
  projectId: "banz-quiz",
  storageBucket: "banz-quiz.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};


// =====================================================
// FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const questionsRef = ref(database, "questions");


// =====================================================
// GLOBAL VARIABLE
// =====================================================

let questions = [];

let currentQuestionIndex = 0;

let userAnswers = {};

let timerInterval = null;

let timeLeft = 30 * 60;

let editingQuestionId = null;


// =====================================================
// ELEMENT
// =====================================================

const loadingScreen =
  document.getElementById("loadingScreen");

const loginScreen =
  document.getElementById("loginScreen");

const adminScreen =
  document.getElementById("adminScreen");

const quizScreen =
  document.getElementById("quizScreen");

const resultScreen =
  document.getElementById("resultScreen");


// =====================================================
// LOADING
// =====================================================

let loadingProgress = 0;

const progressBar =
  document.getElementById("loadingProgress");

const loadingText =
  document.getElementById("loadingText");

const introVideo =
  document.getElementById("introVideo");

const skipButton =
  document.getElementById("skipButton");


function startLoading() {

  const interval = setInterval(() => {

    loadingProgress += 2;

    if (loadingProgress >= 100) {

      loadingProgress = 100;

      clearInterval(interval);

      setTimeout(() => {
        showLogin();
      }, 500);

    }

    progressBar.style.width =
      loadingProgress + "%";

    loadingText.textContent =
      `Memuat BANZ QUIZ... ${loadingProgress}%`;

  }, 60);
}


function skipLoading() {

  if (introVideo) {
    introVideo.pause();
  }

  showLogin();
}


skipButton.addEventListener(
  "click",
  skipLoading
);


function showLogin() {

  loadingScreen.classList.add("hidden");

  loginScreen.classList.remove("hidden");

  adminScreen.classList.add("hidden");

  quizScreen.classList.add("hidden");

  resultScreen.classList.add("hidden");
}


startLoading();


// =====================================================
// LOGIN
// =====================================================

function showAdminLogin() {

  document
    .getElementById("loginChoice")
    .classList.add("hidden");

  document
    .getElementById("adminLoginCard")
    .classList.remove("hidden");

}


window.showAdminLogin = showAdminLogin;


function backToLoginChoice() {

  document
    .getElementById("adminLoginCard")
    .classList.add("hidden");

  document
    .getElementById("loginChoice")
    .classList.remove("hidden");

}


window.backToLoginChoice =
  backToLoginChoice;


// =====================================================
// ADMIN LOGIN
// =====================================================

document
  .getElementById("adminLoginForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const username =
      document.getElementById("adminUsername").value.trim();

    const password =
      document.getElementById("adminPassword").value;

    const error =
      document.getElementById("loginError");


    /*
      MASUKKAN LOGIN ADMIN ABANG DI SINI.

      Contoh:
      username = admin
      password = password admin

      Tidak ditampilkan di halaman.
    */

    const ADMIN_USERNAME = "admin";

    const ADMIN_PASSWORD = "GANTI_PASSWORD_ADMIN";


    if (
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {

      error.textContent = "";

      document
        .getElementById("adminLoginForm")
        .reset();

      showAdmin();

    } else {

      error.textContent =
        "Username atau password salah.";

    }

  });


// =====================================================
// SHOW ADMIN
// =====================================================

function showAdmin() {

  loginScreen.classList.add("hidden");

  adminScreen.classList.remove("hidden");

  quizScreen.classList.add("hidden");

  resultScreen.classList.add("hidden");

  renderAdminQuestions();

}


window.showAdmin =
  showAdmin;


// =====================================================
// USER LOGIN
// =====================================================

function loginAsUser() {

  loginScreen.classList.add("hidden");

  adminScreen.classList.add("hidden");

  resultScreen.classList.add("hidden");

  quizScreen.classList.remove("hidden");

  currentQuestionIndex = 0;

  userAnswers = {};

  timeLeft = 30 * 60;

  startTimer();

  renderQuiz();

}


window.loginAsUser =
  loginAsUser;


// =====================================================
// FIREBASE REALTIME DATABASE
// =====================================================

onValue(questionsRef, (snapshot) => {

  const data = snapshot.val();

  if (!data) {

    questions = [];

  } else {

    questions = Object.entries(data).map(
      ([id, question]) => ({
        id,
        ...question
      })
    );

  }


  updateAdminStats();

  updateSubjectFilter();


  if (
    !quizScreen.classList.contains("hidden")
  ) {

    renderQuiz();

  }

});


// =====================================================
// ADMIN STATS
// =====================================================

function updateAdminStats() {

  document.getElementById(
    "totalQuestions"
  ).textContent = questions.length;


  const subjects = new Set(
    questions.map(q => q.subject)
  );

  document.getElementById(
    "totalSubjects"
  ).textContent = subjects.size;

}


// =====================================================
// SUBJECT FILTER
// =====================================================

function updateSubjectFilter() {

  const filter =
    document.getElementById("subjectFilter");

  const currentValue =
    filter.value;

  const subjects = [
    ...new Set(
      questions.map(q => q.subject)
    )
  ];


  filter.innerHTML = `
    <option value="all">
      Semua Mata Pelajaran
    </option>
  `;


  subjects.forEach(subject => {

    const option =
      document.createElement("option");

    option.value = subject;

    option.textContent = subject;

    filter.appendChild(option);

  });


  if (
    subjects.includes(currentValue)
  ) {

    filter.value = currentValue;

  }

}


// =====================================================
// RENDER ADMIN QUESTIONS
// =====================================================

function renderAdminQuestions() {

  const container =
    document.getElementById("adminQuestions");

  const filter =
    document.getElementById("subjectFilter").value;


  let filteredQuestions =
    questions;


  if (filter !== "all") {

    filteredQuestions =
      questions.filter(
        q => q.subject === filter
      );

  }


  if (filteredQuestions.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Belum ada soal.
      </div>
    `;

    return;

  }


  container.innerHTML =
    filteredQuestions.map(q => `

      <div class="question-admin-card">

        <div class="question-meta">
          ${escapeHTML(q.subject)}
        </div>

        <h3>
          ${escapeHTML(q.question)}
        </h3>

        <div class="admin-answers">

          <div class="admin-answer ${q.correct === "A" ? "correct" : ""}">
            <b>A.</b> ${escapeHTML(q.answers.A)}
          </div>

          <div class="admin-answer ${q.correct === "B" ? "correct" : ""}">
            <b>B.</b> ${escapeHTML(q.answers.B)}
          </div>

          <div class="admin-answer ${q.correct === "C" ? "correct" : ""}">
            <b>C.</b> ${escapeHTML(q.answers.C)}
          </div>

          <div class="admin-answer ${q.correct === "D" ? "correct" : ""}">
            <b>D.</b> ${escapeHTML(q.answers.D)}
          </div>

        </div>

        <div class="question-actions">

          <button
            class="action-btn edit-btn"
            onclick="editQuestion('${q.id}')"
          >
            Edit
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteQuestion('${q.id}')"
          >
            Hapus
          </button>

        </div>

      </div>

    `).join("");

}


window.renderAdminQuestions =
  renderAdminQuestions;


// =====================================================
// ADD QUESTION MODAL
// =====================================================

function openQuestionModal() {

  editingQuestionId = null;

  document.getElementById(
    "modalTitle"
  ).textContent = "Tambah Soal";


  document
    .getElementById("questionForm")
    .reset();


  document.getElementById(
    "editQuestionId"
  ).value = "";


  document
    .getElementById("questionModal")
    .classList.remove("hidden");

}


window.openQuestionModal =
  openQuestionModal;


// =====================================================
// CLOSE MODAL
// =====================================================

function closeQuestionModal() {

  document
    .getElementById("questionModal")
    .classList.add("hidden");

  editingQuestionId = null;

}


window.closeQuestionModal =
  closeQuestionModal;


// =====================================================
// SAVE QUESTION
// =====================================================

document
  .getElementById("questionForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();


    const subject =
      document.getElementById(
        "questionSubject"
      ).value.trim();


    const question =
      document.getElementById(
        "questionInput"
      ).value.trim();


    const answers = {

      A: document.getElementById(
        "answerA"
      ).value.trim(),

      B: document.getElementById(
        "answerB"
      ).value.trim(),

      C: document.getElementById(
        "answerC"
      ).value.trim(),

      D: document.getElementById(
        "answerD"
      ).value.trim()

    };


    const correct =
      document.getElementById(
        "correctAnswer"
      ).value;


    const questionData = {

      subject,
      question,
      answers,
      correct,

      createdAt:
        Date.now()

    };


    try {

      if (editingQuestionId) {

        const questionRef =
          ref(
            database,
            `questions/${editingQuestionId}`
          );

        await update(
          questionRef,
          questionData
        );

        alert("Soal berhasil diperbarui.");

      } else {

        const newQuestionRef =
          push(questionsRef);

        await set(
          newQuestionRef,
          questionData
        );

        alert(
          "Soal berhasil ditambahkan dan akan terlihat oleh user."
        );

      }


      closeQuestionModal();

      renderAdminQuestions();


    } catch (error) {

      console.error(error);

      alert(
        "Gagal menyimpan soal. Periksa koneksi Firebase."
      );

    }

  });


// =====================================================
// EDIT QUESTION
// =====================================================

function editQuestion(id) {

  const question =
    questions.find(
      q => q.id === id
    );


  if (!question) return;


  editingQuestionId = id;


  document.getElementById(
    "modalTitle"
  ).textContent = "Edit Soal";


  document.getElementById(
    "questionSubject"
  ).value = question.subject;


  document.getElementById(
    "questionInput"
  ).value = question.question;


  document.getElementById(
    "answerA"
  ).value = question.answers.A;


  document.getElementById(
    "answerB"
  ).value = question.answers.B;


  document.getElementById(
    "answerC"
  ).value = question.answers.C;


  document.getElementById(
    "answerD"
  ).value = question.answers.D;


  document.getElementById(
    "correctAnswer"
  ).value = question.correct;


  document
    .getElementById("questionModal")
    .classList.remove("hidden");

}


window.editQuestion =
  editQuestion;


// =====================================================
// DELETE QUESTION
// =====================================================

async function deleteQuestion(id) {

  const confirmDelete =
    confirm(
      "Apakah Anda yakin ingin menghapus soal ini?"
    );


  if (!confirmDelete) return;


  try {

    const questionRef =
      ref(
        database,
        `questions/${id}`
      );

    await remove(questionRef);

    alert("Soal berhasil dihapus.");

  } catch (error) {

    console.error(error);

    alert(
      "Gagal menghapus soal."
    );

  }

}


window.deleteQuestion =
  deleteQuestion;


// =====================================================
// QUIZ
// =====================================================

function renderQuiz() {

  if (questions.length === 0) {

    document.getElementById(
      "questionText"
    ).textContent =
      "Belum ada soal yang tersedia.";

    document.getElementById(
      "answersContainer"
    ).innerHTML = "";

    document.getElementById(
      "questionTotal"
    ).textContent = "0";

    return;

  }


  if (
    currentQuestionIndex >= questions.length
  ) {

    currentQuestionIndex =
      questions.length - 1;

  }


  const question =
    questions[currentQuestionIndex];


  document.getElementById(
    "questionNumber"
  ).textContent =
    `Soal ${currentQuestionIndex + 1}`;


  document.getElementById(
    "currentQuestion"
  ).textContent =
    currentQuestionIndex + 1;


  document.getElementById(
    "questionTotal"
  ).textContent =
    questions.length;


  document.getElementById(
    "quizSubject"
  ).textContent =
    question.subject;


  document.getElementById(
    "questionText"
  ).textContent =
    question.question;


  const container =
    document.getElementById(
      "answersContainer"
    );


  container.innerHTML = "";


  ["A", "B", "C", "D"].forEach(letter => {

    const button =
      document.createElement("button");


    button.className =
      "answer";


    if (
      userAnswers[question.id] === letter
    ) {

      button.classList.add("selected");

    }


    button.innerHTML = `

      <span class="answer-letter">
        ${letter}
      </span>

      <span>
        ${escapeHTML(question.answers[letter])}
      </span>

    `;


    button.onclick = () => {

      userAnswers[question.id] =
        letter;

      renderQuiz();

    };


    container.appendChild(button);

  });


  document.getElementById(
    "prevButton"
  ).disabled =
    currentQuestionIndex === 0;


  document.getElementById(
    "nextButton"
  ).textContent =
    currentQuestionIndex === questions.length - 1
      ? "Selesai ✓"
      : "Berikutnya →";

}


window.renderQuiz =
  renderQuiz;


// =====================================================
// NEXT
// =====================================================

function nextQuestion() {

  if (
    currentQuestionIndex <
    questions.length - 1
  ) {

    currentQuestionIndex++;

    renderQuiz();

  } else {

    finishQuiz();

  }

}


window.nextQuestion =
  nextQuestion;


// =====================================================
// PREVIOUS
// =====================================================

function previousQuestion() {

  if (currentQuestionIndex > 0) {

    currentQuestionIndex--;

    renderQuiz();

  }

}


window.previousQuestion =
  previousQuestion;


// =====================================================
// FINISH QUIZ
// =====================================================

function finishQuiz() {

  clearInterval(timerInterval);


  let correct = 0;


  questions.forEach(question => {

    if (
      userAnswers[question.id] ===
      question.correct
    ) {

      correct++;

    }

  });


  const total =
    questions.length;


  const wrong =
    total - correct;


  const score =
    total === 0
      ? 0
      : Math.round(
          (correct / total) * 100
        );


  document.getElementById(
    "scoreValue"
  ).textContent = score;


  document.getElementById(
    "correctCount"
  ).textContent = correct;


  document.getElementById(
    "wrongCount"
  ).textContent = wrong;


  document.getElementById(
    "resultTotal"
  ).textContent = total;


  quizScreen.classList.add("hidden");

  resultScreen.classList.remove("hidden");

}


window.finishQuiz =
  finishQuiz;


// =====================================================
// TIMER
// =====================================================

function startTimer() {

  clearInterval(timerInterval);


  updateTimer();


  timerInterval =
    setInterval(() => {

      timeLeft--;


      updateTimer();


      if (timeLeft <= 0) {

        clearInterval(timerInterval);

        finishQuiz();

      }

    }, 1000);

}


function updateTimer() {

  const minutes =
    Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");


  const seconds =
    (timeLeft % 60)
      .toString()
      .padStart(2, "0");


  document.getElementById(
    "timer"
  ).textContent =
    `${minutes}:${seconds}`;

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

  clearInterval(timerInterval);

  loginScreen.classList.remove("hidden");

  adminScreen.classList.add("hidden");

  quizScreen.classList.add("hidden");

  resultScreen.classList.add("hidden");

  document.getElementById(
    "loginChoice"
  ).classList.remove("hidden");

  document.getElementById(
    "adminLoginCard"
  ).classList.add("hidden");

}


window.logout =
  logout;


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
