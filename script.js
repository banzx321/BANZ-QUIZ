/* =========================================================
   EDUQUIZ - MAIN JAVASCRIPT
   ========================================================= */


/* ================= DATABASE ================= */

const DEFAULT_QUESTIONS = [
  {
  id: Date.now() + 1,
  subject: "Bank dan Lembaga Keuangan",
  question: "Apa kegiatan utama yang dilakukan oleh bank?",
  answers: {
    A: "Menghimpun dan menyalurkan dana masyarakat",
    B: "Menjual barang kebutuhan sehari-hari",
    C: "Memproduksi kendaraan",
    D: "Menyediakan jasa transportasi"
  },
  correct: "A"
},

{
  id: Date.now() + 2,
  subject: "Bank dan Lembaga Keuangan",
  question: "Bank berperan sebagai perantara keuangan antara...",
  answers: {
    A: "Produsen dan konsumen",
    B: "Pihak yang memiliki dana dan pihak yang membutuhkan dana",
    C: "Pemerintah dan pedagang",
    D: "Penjual dan pembeli barang"
  },
  correct: "B"
},

{
  id: Date.now() + 3,
  subject: "Bank dan Lembaga Keuangan",
  question: "Lembaga yang bertugas menjaga kestabilan nilai mata uang dan sistem keuangan adalah...",
  answers: {
    A: "Bank Umum",
    B: "Koperasi",
    C: "Bank Sentral",
    D: "Pegadaian"
  },
  correct: "C"
},

{
  id: Date.now() + 4,
  subject: "Bank dan Lembaga Keuangan",
  question: "Bank sentral yang ada di Indonesia adalah...",
  answers: {
    A: "Bank Mandiri",
    B: "Bank Rakyat Indonesia",
    C: "Bank Indonesia",
    D: "Bank Negara Indonesia"
  },
  correct: "C"
},

{
  id: Date.now() + 5,
  subject: "Bank dan Lembaga Keuangan",
  question: "Dana yang dihimpun bank dari masyarakat dalam bentuk tabungan, giro, dan deposito disebut...",
  answers: {
    A: "Modal",
    B: "Simpanan",
    C: "Kredit",
    D: "Investasi"
  },
  correct: "B"
},

{
  id: Date.now() + 6,
  subject: "Bank dan Lembaga Keuangan",
  question: "Dana yang disimpan oleh masyarakat di bank disebut...",
  answers: {
    A: "Kredit",
    B: "Simpanan",
    C: "Utang",
    D: "Dividen"
  },
  correct: "B"
},

{
  id: Date.now() + 7,
  subject: "Bank dan Lembaga Keuangan",
  question: "Simpanan yang dapat ditarik menggunakan cek atau bilyet giro disebut...",
  answers: {
    A: "Tabungan",
    B: "Deposito",
    C: "Giro",
    D: "Kredit"
  },
  correct: "C"
},

{
  id: Date.now() + 8,
  subject: "Bank dan Lembaga Keuangan",
  question: "Simpanan yang penarikannya dilakukan pada waktu tertentu sesuai perjanjian disebut...",
  answers: {
    A: "Giro",
    B: "Deposito",
    C: "Tabungan",
    D: "Kredit"
  },
  correct: "B"
},

{
  id: Date.now() + 9,
  subject: "Bank dan Lembaga Keuangan",
  question: "Dana yang dipinjamkan oleh bank kepada masyarakat disebut...",
  answers: {
    A: "Kredit",
    B: "Simpanan",
    C: "Deposito",
    D: "Modal"
  },
  correct: "A"
},

{
  id: Date.now() + 10,
  subject: "Bank dan Lembaga Keuangan",
  question: "Imbalan yang diberikan bank kepada nasabah atas simpanannya disebut...",
  answers: {
    A: "Pajak",
    B: "Bunga",
    C: "Denda",
    D: "Dividen"
  },
  correct: "B"
},

{
  id: Date.now() + 11,
  subject: "Bank dan Lembaga Keuangan",
  question: "Lembaga yang bertugas menjamin simpanan nasabah bank adalah...",
  answers: {
    A: "OJK",
    B: "Bank Indonesia",
    C: "LPS",
    D: "Kementerian Keuangan"
  },
  correct: "C"
},

{
  id: Date.now() + 12,
  subject: "Bank dan Lembaga Keuangan",
  question: "OJK merupakan singkatan dari...",
  answers: {
    A: "Otoritas Jasa Keuangan",
    B: "Organisasi Jasa Keuangan",
    C: "Otoritas Jaminan Keuangan",
    D: "Organisasi Jaminan Keuangan"
  },
  correct: "A"
},

{
  id: Date.now() + 13,
  subject: "Bank dan Lembaga Keuangan",
  question: "Salah satu tugas OJK adalah...",
  answers: {
    A: "Mencetak uang rupiah",
    B: "Mengatur dan mengawasi sektor jasa keuangan",
    C: "Menjual saham perusahaan",
    D: "Memberikan bantuan sosial"
  },
  correct: "B"
},

{
  id: Date.now() + 14,
  subject: "Bank dan Lembaga Keuangan",
  question: "Lembaga keuangan yang memberikan pinjaman dengan menggunakan barang sebagai jaminan adalah...",
  answers: {
    A: "Pegadaian",
    B: "Bursa Efek",
    C: "Bank Indonesia",
    D: "Perusahaan asuransi"
  },
  correct: "A"
},

{
  id: Date.now() + 15,
  subject: "Bank dan Lembaga Keuangan",
  question: "Koperasi simpan pinjam memiliki kegiatan utama berupa...",
  answers: {
    A: "Menjual barang elektronik",
    B: "Menghimpun dan memberikan pinjaman kepada anggota",
    C: "Mencetak uang",
    D: "Mengelola pasar modal"
  },
  correct: "B"
},

{
  id: Date.now() + 16,
  subject: "Bank dan Lembaga Keuangan",
  question: "Lembaga keuangan yang memberikan perlindungan terhadap risiko tertentu disebut...",
  answers: {
    A: "Perusahaan asuransi",
    B: "Pegadaian",
    C: "Koperasi",
    D: "Bursa efek"
  },
  correct: "A"
},

{
  id: Date.now() + 17,
  subject: "Bank dan Lembaga Keuangan",
  question: "Berikut yang merupakan contoh lembaga keuangan non-bank adalah...",
  answers: {
    A: "Bank Indonesia",
    B: "Bank Umum",
    C: "Pegadaian",
    D: "Bank Perkreditan Rakyat"
  },
  correct: "C"
},

{
  id: Date.now() + 18,
  subject: "Bank dan Lembaga Keuangan",
  question: "Pasar modal merupakan tempat bertemunya...",
  answers: {
    A: "Penjual dan pembeli kebutuhan pokok",
    B: "Pihak yang membutuhkan dana dan investor",
    C: "Petani dan pedagang",
    D: "Produsen dan distributor"
  },
  correct: "B"
},

{
  id: Date.now() + 19,
  subject: "Bank dan Lembaga Keuangan",
  question: "Surat berharga yang menunjukkan kepemilikan seseorang terhadap suatu perusahaan disebut...",
  answers: {
    A: "Saham",
    B: "Cek",
    C: "Giro",
    D: "Deposito"
  },
  correct: "A"
},

{
  id: Date.now() + 20,
  subject: "Bank dan Lembaga Keuangan",
  question: "Apa tujuan utama adanya lembaga keuangan?",
  answers: {
    A: "Mempermudah kegiatan dan pelayanan keuangan masyarakat",
    B: "Mengurangi jumlah uang beredar tanpa alasan",
    C: "Menghapus kegiatan perdagangan",
    D: "Menggantikan seluruh kegiatan pemerintah"
  },
  correct: "A"
}
];


function getQuestions() {
  const saved = localStorage.getItem("eduquiz_questions");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem(
    "eduquiz_questions",
    JSON.stringify(DEFAULT_QUESTIONS)
  );

  return DEFAULT_QUESTIONS;
}


function saveQuestions(questions) {
  localStorage.setItem(
    "eduquiz_questions",
    JSON.stringify(questions)
  );
}


/* ================= SCREEN MANAGEMENT ================= */

const screens = [
  "loginScreen",
  "adminLoginScreen",
  "adminDashboard",
  "userScreen",
  "resultScreen"
];


function hideAllScreens() {
  screens.forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
}


function showScreen(id) {
  hideAllScreens();
  document.getElementById(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}


/* ================= LOADING ================= */

let loadingProgress = 0;
let loadingFinished = false;

const progressBar = document.getElementById("progressBar");
const loadingPercent = document.getElementById("loadingPercent");
const loadingScreen = document.getElementById("loadingScreen");
const introVideo = document.getElementById("introVideo");


function updateLoading() {

  if (loadingFinished) return;

  loadingProgress += Math.random() * 3 + 1;

  if (loadingProgress >= 100) {
    loadingProgress = 100;
    loadingFinished = true;
  }

  progressBar.style.width = `${loadingProgress}%`;
  loadingPercent.textContent = `${Math.floor(loadingProgress)}%`;

  if (!loadingFinished) {
    setTimeout(updateLoading, 100);
  } else {
    setTimeout(skipLoading, 500);
  }
}


function skipLoading() {

  if (introVideo) {
    introVideo.pause();
  }

  loadingScreen.classList.add("hide");

  setTimeout(() => {
    loadingScreen.style.display = "none";
    showScreen("loginScreen");
  }, 600);
}


document
  .getElementById("skipButton")
  .addEventListener("click", skipLoading);


window.addEventListener("load", () => {
  updateLoading();
});


/* ================= LOGIN ================= */

function showAdminLogin() {
  showScreen("adminLoginScreen");
}


function backToLogin() {
  clearInterval(timerInterval);

  showScreen("loginScreen");
}


document
  .getElementById("adminLoginForm")
  .addEventListener("submit", function(e) {

    e.preventDefault();

    const username =
      document.getElementById("adminUsername").value.trim();

    const password =
      document.getElementById("adminPassword").value;

    const error =
      document.getElementById("loginError");


    if (username === "admin" && password === "admin123") {

      error.textContent = "";

      sessionStorage.setItem(
        "eduquiz_role",
        "admin"
      );

      openAdminDashboard();

    } else {

      error.textContent =
        "Username atau password salah.";

    }
  });


function loginAsUser() {

  sessionStorage.setItem(
    "eduquiz_role",
    "user"
  );

  startQuiz();
}


/* ================= LOGOUT ================= */

function logout() {

  clearInterval(timerInterval);

  sessionStorage.removeItem("eduquiz_role");

  showScreen("loginScreen");
}


/* ================= ADMIN ================= */

function openAdminDashboard() {

  showScreen("adminDashboard");

  updateAdminStats();

  updateSubjectFilter();

  renderAdminQuestions();
}


function updateAdminStats() {

  const questions = getQuestions();

  const subjects = [
    ...new Set(
      questions.map(q => q.subject)
    )
  ];

  document.getElementById(
    "totalQuestions"
  ).textContent = questions.length;

  document.getElementById(
    "totalSubjects"
  ).textContent = subjects.length;
}


/* ================= QUESTION LIST ================= */

function renderAdminQuestions() {

  const questions = getQuestions();

  const filter =
    document.getElementById("subjectFilter").value;

  const list =
    document.getElementById("adminQuestionsList");

  const filtered =
    filter === "all"
      ? questions
      : questions.filter(q => q.subject === filter);


  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty-list">
        <div>📚</div>
        <p>Belum ada soal.</p>
      </div>
    `;

    return;
  }


  list.innerHTML = filtered.map((q, index) => `

    <div class="admin-question">

      <div class="question-info">

        <span class="subject">
          ${escapeHTML(q.subject)}
        </span>

        <h3>
          ${index + 1}. ${escapeHTML(q.question)}
        </h3>

      </div>

      <div class="question-actions">

        <button
          class="edit-btn"
          onclick="editQuestion(${q.id})"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteQuestion(${q.id})"
        >
          Hapus
        </button>

      </div>

    </div>

  `).join("");
}


/* ================= SUBJECT FILTER ================= */

function updateSubjectFilter() {

  const select =
    document.getElementById("subjectFilter");

  const current =
    select.value || "all";

  const questions = getQuestions();

  const subjects = [
    ...new Set(
      questions.map(q => q.subject)
    )
  ];


  select.innerHTML = `
    <option value="all">
      Semua Mata Pelajaran
    </option>
  `;

  subjects.forEach(subject => {

    const option =
      document.createElement("option");

    option.value = subject;
    option.textContent = subject;

    select.appendChild(option);

  });


  if (
    subjects.includes(current)
  ) {
    select.value = current;
  }
}


/* ================= ADD QUESTION ================= */

function openQuestionModal() {

  document.getElementById(
    "questionModal"
  ).classList.remove("hidden");

  document.getElementById(
    "modalTitle"
  ).textContent = "Tambah Soal";

  document.getElementById(
    "questionForm"
  ).reset();

  document.getElementById(
    "editQuestionId"
  ).value = "";

}


function closeQuestionModal() {

  document.getElementById(
    "questionModal"
  ).classList.add("hidden");

}


document
  .getElementById("questionForm")
  .addEventListener("submit", function(e) {

    e.preventDefault();


    const editId =
      document.getElementById(
        "editQuestionId"
      ).value;


    const questionData = {

      id: editId
        ? Number(editId)
        : Date.now(),

      subject:
        document.getElementById(
          "questionSubject"
        ).value.trim(),

      question:
        document.getElementById(
          "questionInput"
        ).value.trim(),

      answers: {

        A:
          document.getElementById(
            "answerA"
          ).value.trim(),

        B:
          document.getElementById(
            "answerB"
          ).value.trim(),

        C:
          document.getElementById(
            "answerC"
          ).value.trim(),

        D:
          document.getElementById(
            "answerD"
          ).value.trim()

      },

      correct:
        document.getElementById(
          "correctAnswer"
        ).value

    };


    let questions = getQuestions();


    if (editId) {

      questions =
        questions.map(q =>
          q.id === Number(editId)
            ? questionData
            : q
        );

    } else {

      questions.push(questionData);

    }


    saveQuestions(questions);

    closeQuestionModal();

    updateAdminStats();

    updateSubjectFilter();

    renderAdminQuestions();


    alert(
      editId
        ? "Soal berhasil diperbarui."
        : "Soal berhasil ditambahkan."
    );

  });


/* ================= EDIT QUESTION ================= */

function editQuestion(id) {

  const questions = getQuestions();

  const q =
    questions.find(item => item.id === id);

  if (!q) return;


  document.getElementById(
    "questionModal"
  ).classList.remove("hidden");


  document.getElementById(
    "modalTitle"
  ).textContent = "Edit Soal";


  document.getElementById(
    "editQuestionId"
  ).value = q.id;


  document.getElementById(
    "questionSubject"
  ).value = q.subject;


  document.getElementById(
    "questionInput"
  ).value = q.question;


  document.getElementById(
    "answerA"
  ).value = q.answers.A;


  document.getElementById(
    "answerB"
  ).value = q.answers.B;


  document.getElementById(
    "answerC"
  ).value = q.answers.C;


  document.getElementById(
    "answerD"
  ).value = q.answers.D;


  document.getElementById(
    "correctAnswer"
  ).value = q.correct;

}


/* ================= DELETE QUESTION ================= */

function deleteQuestion(id) {

  const confirmDelete =
    confirm(
      "Apakah Anda yakin ingin menghapus soal ini?"
    );

  if (!confirmDelete) return;


  let questions = getQuestions();

  questions =
    questions.filter(
      q => q.id !== id
    );

  saveQuestions(questions);

  updateAdminStats();

  updateSubjectFilter();

  renderAdminQuestions();

}


/* =========================================================
   QUIZ SYSTEM
   ========================================================= */

let quizQuestions = [];
let currentQuestion = 0;
let userAnswers = {};
let timerInterval;
let timeRemaining = 30 * 60;


/* ================= START QUIZ ================= */

function startQuiz() {

  quizQuestions = getQuestions();

  currentQuestion = 0;

  userAnswers = {};

  timeRemaining = 30 * 60;


  showScreen("userScreen");


  if (quizQuestions.length === 0) {

    document
      .getElementById("quizContent")
      .classList.add("hidden");

    document
      .getElementById("noQuestions")
      .classList.remove("hidden");

    return;

  }


  document
    .getElementById("quizContent")
    .classList.remove("hidden");

  document
    .getElementById("noQuestions")
    .classList.add("hidden");


  document.getElementById(
    "totalQuizQuestions"
  ).textContent =
    quizQuestions.length;


  renderQuestion();

  startTimer();

}


/* ================= RENDER QUESTION ================= */

function renderQuestion() {

  const q =
    quizQuestions[currentQuestion];


  document.getElementById(
    "currentQuestionNumber"
  ).textContent =
    currentQuestion + 1;


  document.getElementById(
    "questionCounter"
  ).textContent =
    `${currentQuestion + 1} / ${quizQuestions.length}`;


  document.getElementById(
    "questionIndex"
  ).textContent =
    String(currentQuestion + 1)
      .padStart(2, "0");


  document.getElementById(
    "quizSubject"
  ).textContent =
    q.subject;


  document.getElementById(
    "questionText"
  ).textContent =
    q.question;


  const options =
    document.getElementById(
      "answerOptions"
    );


  options.innerHTML = "";


  ["A", "B", "C", "D"].forEach(letter => {

    const option =
      document.createElement("div");

    option.className =
      "answer-option";


    if (
      userAnswers[currentQuestion] ===
      letter
    ) {
      option.classList.add("selected");
    }


    option.innerHTML = `

      <div class="answer-letter">
        ${letter}
      </div>

      <div class="answer-text">
        ${escapeHTML(q.answers[letter])}
      </div>

    `;


    option.addEventListener(
      "click",
      () => selectAnswer(letter)
    );


    options.appendChild(option);

  });


  const progress =
    ((currentQuestion + 1) /
      quizQuestions.length) * 100;


  document.getElementById(
    "quizProgressBar"
  ).style.width =
    `${progress}%`;


  document.getElementById(
    "prevButton"
  ).disabled =
    currentQuestion === 0;


  if (
    currentQuestion ===
    quizQuestions.length - 1
  ) {

    document.getElementById(
      "nextButton"
    ).textContent =
      "Selesai ✓";

  } else {

    document.getElementById(
      "nextButton"
    ).textContent =
      "Berikutnya →";

  }

}


/* ================= SELECT ANSWER ================= */

function selectAnswer(letter) {

  userAnswers[currentQuestion] =
    letter;

  renderQuestion();

}


/* ================= NEXT ================= */

function nextQuestion() {

  if (
    currentQuestion <
    quizQuestions.length - 1
  ) {

    currentQuestion++;

    renderQuestion();

  } else {

    finishQuiz();

  }

}


/* ================= PREVIOUS ================= */

function previousQuestion() {

  if (currentQuestion > 0) {

    currentQuestion--;

    renderQuestion();

  }

}


/* ================= TIMER ================= */

function startTimer() {

  clearInterval(timerInterval);


  updateTimer();


  timerInterval =
    setInterval(() => {

      timeRemaining--;

      updateTimer();


      if (timeRemaining <= 0) {

        clearInterval(timerInterval);

        finishQuiz();

      }

    }, 1000);

}


function updateTimer() {

  const minutes =
    Math.floor(
      timeRemaining / 60
    );

  const seconds =
    timeRemaining % 60;


  document.getElementById(
    "timer"
  ).textContent =

    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* ================= FINISH QUIZ ================= */

function finishQuiz() {

  clearInterval(timerInterval);


  let correct = 0;


  quizQuestions.forEach(
    (question, index) => {

      if (
        userAnswers[index] ===
        question.correct
      ) {
        correct++;
      }

    }
  );


  const total =
    quizQuestions.length;


  const wrong =
    total - correct;


  const score =
    total === 0
      ? 0
      : Math.round(
          (correct / total) * 100
        );


  document.getElementById(
    "finalScore"
  ).textContent =
    score;


  document.getElementById(
    "resultTotal"
  ).textContent =
    total;


  document.getElementById(
    "resultCorrect"
  ).textContent =
    correct;


  document.getElementById(
    "resultWrong"
  ).textContent =
    wrong;


  let message;


  if (score >= 90) {

    message =
      "Luar biasa! Hasil kamu sangat bagus. 🏆";

  } else if (score >= 75) {

    message =
      "Bagus sekali! Terus pertahankan. 🎉";

  } else if (score >= 60) {

    message =
      "Cukup baik. Terus belajar dan tingkatkan lagi! 💪";

  } else {

    message =
      "Jangan menyerah. Tetap semangat belajar! 📚";

  }


  document.getElementById(
    "resultMessage"
  ).textContent =
    message;


  showScreen("resultScreen");

}


/* ================= SECURITY / HTML ================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ================= KEYBOARD ================= */

document.addEventListener(
  "keydown",
  function(e) {

    if (
      document
        .getElementById("userScreen")
        .classList.contains("hidden")
    ) {
      return;
    }


    if (e.key === "ArrowRight") {
      nextQuestion();
    }


    if (e.key === "ArrowLeft") {
      previousQuestion();
    }

  }
);


/* ================= INITIALIZATION ================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    /*
      Untuk demo, user selalu mulai dari
      loading screen.

      Data soal otomatis dibuat di localStorage.
    */

    console.log(
      "EduQuiz berhasil dimuat."
    );

  }
);
