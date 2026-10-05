/* =========================================================
   BANZ QUIZ - SUPABASE EDITION
   ========================================================= */

const SUPABASE_URL =
  "https://pvvlyxcyfkqqqoklptqd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_ZMTwk7G1KQYDzrIvjtWA-A_F8qsw-RJ";

let db = null;


/* =========================================================
   HELPER
   ========================================================= */

const $ = (id) => document.getElementById(id);

const screens = [
  "homeScreen",
  "adminLoginScreen",
  "adminScreen",
  "studentScreen",
  "quizScreen",
  "resultScreen"
];


/* =========================================================
   STATE
   ========================================================= */

let questions = [];

let selectedSubject = "";

let quizQuestions = [];

let currentIndex = 0;

let selectedAnswer = null;

let correctCount = 0;

let timerId = null;

let secondsLeft = 30;

let editingId = null;


/* =========================================================
   SUPABASE
   ========================================================= */

function initSupabase() {

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {

    console.error(
      "Supabase JS belum termuat."
    );

    if ($("dbStatus")) {
      $("dbStatus").textContent = "Error";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Supabase belum termuat. Periksa CDN Supabase di index.html.";
    }

    return false;
  }

  try {

    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    console.log(
      "Supabase berhasil terhubung."
    );

    return true;

  } catch (error) {

    console.error(
      "Gagal membuat koneksi Supabase:",
      error
    );

    return false;
  }
}


/* =========================================================
   SCREEN
   ========================================================= */

function showScreen(id) {

  screens.forEach((screenId) => {

    const element =
      $(screenId);

    if (!element) return;

    element.classList.toggle(
      "hidden",
      screenId !== id
    );

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   MESSAGE
   ========================================================= */

function setMessage(
  id,
  text,
  success = false
) {

  const element =
    $(id);

  if (!element) return;

  element.textContent =
    text || "";

  element.style.color =
    success
      ? "#16803a"
      : "";
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );
}


/* =========================================================
   NORMALIZE QUESTION
   ========================================================= */

function normalizeQuestion(q) {

  let answers = q.answers;

  /*
    Database sekarang sebaiknya:

    [
      "Jawaban A",
      "Jawaban B",
      "Jawaban C",
      "Jawaban D"
    ]

    Tetapi kode ini juga tetap bisa membaca
    format object lama:

    {
      A: "...",
      B: "...",
      C: "...",
      D: "..."
    }
  */

  if (Array.isArray(answers)) {

    answers = {
      A: answers[0] ?? "",
      B: answers[1] ?? "",
      C: answers[2] ?? "",
      D: answers[3] ?? ""
    };

  } else if (
    answers &&
    typeof answers === "object"
  ) {

    answers = {
      A: answers.A ?? "",
      B: answers.B ?? "",
      C: answers.C ?? "",
      D: answers.D ?? ""
    };

  } else {

    answers = {
      A: "",
      B: "",
      C: "",
      D: ""
    };
  }

  return {

    id: q.id,

    subject:
      q.subject || "",

    question:
      q.question || "",

    answers,

    correct:
      String(
        q.correct || ""
      ).toUpperCase()

  };
}


/* =========================================================
   LOAD QUESTIONS
   ========================================================= */

async function loadQuestions() {

  if (!db) {

    console.error(
      "Database belum tersedia."
    );

    if ($("dbStatus")) {
      $("dbStatus").textContent =
        "Offline";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Database belum siap.";
    }

    return;
  }

  try {

    const {
      data,
      error
    } = await db
      .from("questions")
      .select(
        "id,subject,question,answers,correct,created_at"
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );

    if (error) {
      throw error;
    }

    questions =
      (data || [])
        .map(normalizeQuestion);

    console.log(
      `${questions.length} soal berhasil dimuat.`
    );

    if ($("dbStatus")) {
      $("dbStatus").textContent =
        "Online";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        `${questions.length} soal tersedia online.`;
    }

    renderSubjects();

    renderAdminQuestions();

    updateStats();

  } catch (error) {

    console.error(
      "Gagal mengambil soal:",
      error
    );

    if ($("dbStatus")) {
      $("dbStatus").textContent =
        "Error";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Gagal mengambil soal dari database.";
    }
  }
}


/* =========================================================
   INIT
   ========================================================= */

async function init() {

  const invalidConfig =
    !SUPABASE_URL ||
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_URL.includes("GANTI_") ||
    SUPABASE_PUBLISHABLE_KEY.includes("GANTI_");

  if (invalidConfig) {

    console.error(
      "Konfigurasi Supabase belum lengkap."
    );

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Konfigurasi Supabase belum lengkap.";
    }

    return;
  }

  const connected =
    initSupabase();

  if (!connected) {
    return;
  }

  await loadQuestions();

  /*
    Cek apakah admin sudah login.
  */

  try {

    const {
      data
    } = await db.auth.getSession();

    if (data?.session) {

      openAdmin(
        data.session.user
      );

    }

  } catch (error) {

    console.error(
      "Gagal mengecek session:",
      error
    );
  }
}


/* =========================================================
   STATISTIK
   ========================================================= */

function updateStats() {

  if ($("totalQuestions")) {

    $("totalQuestions")
      .textContent =
      questions.length;
  }

  if ($("totalSubjects")) {

    $("totalSubjects")
      .textContent =
      new Set(
        questions.map(
          (q) => q.subject
        )
      ).size;
  }
}


/* =========================================================
   SUBJECT
   ========================================================= */

function renderSubjects() {

  const list =
    $("subjectList");

  if (!list) return;

  const grouped = {};

  questions.forEach((q) => {

    const subject =
      q.subject || "Tanpa Mata Pelajaran";

    grouped[subject] =
      (grouped[subject] || 0) + 1;

  });

  const entries =
    Object.entries(grouped);

  if (!entries.length) {

    list.innerHTML =
      `<div class="muted">
        Belum ada soal.
      </div>`;

    return;
  }

  list.innerHTML =
    entries
      .map(
        ([subject, count]) => `
          <button
            type="button"
            class="subject-btn"
            data-subject="${escapeHtml(subject)}"
          >
            📘 ${escapeHtml(subject)}
            <span>${count} soal</span>
          </button>
        `
      )
      .join("");

  list
    .querySelectorAll(".subject-btn")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          startQuiz(
            button.dataset.subject
          );

        }
      );

    });
}


/* =========================================================
   ADMIN QUESTION LIST
   ========================================================= */

function renderAdminQuestions() {

  const list =
    $("adminQuestionList");

  if (!list) return;

  const search =
    $("adminSearch")
      ?.value
      .toLowerCase()
      .trim() || "";

  const filtered =
    questions.filter((q) => {

      const text =
        `${q.subject} ${q.question}`
          .toLowerCase();

      return text.includes(search);

    });

  if (!filtered.length) {

    list.innerHTML =
      `<div class="muted">
        Tidak ada soal.
      </div>`;

    return;
  }

  list.innerHTML =
    filtered
      .map(
        (q) => `
          <div class="question-item">

            <div>

              <h3>
                ${escapeHtml(q.question)}
              </h3>

              <p>
                ${escapeHtml(q.subject)}
                • Jawaban benar:
                ${escapeHtml(q.correct)}
              </p>

            </div>

            <div class="item-actions">

              <button
                type="button"
                class="btn secondary small edit-btn"
                data-id="${q.id}"
              >
                Edit
              </button>

              <button
                type="button"
                class="btn danger small delete-btn"
                data-id="${q.id}"
              >
                Hapus
              </button>

            </div>

          </div>
        `
      )
      .join("");

  list
    .querySelectorAll(".edit-btn")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          openEdit(
            button.dataset.id
          );

        }
      );

    });

  list
    .querySelectorAll(".delete-btn")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          deleteQuestion(
            button.dataset.id
          );

        }
      );

    });
}


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

function openAdmin(user) {

  if ($("adminEmailLabel")) {

    $("adminEmailLabel")
      .textContent =
      user?.email || "";
  }

  showScreen(
    "adminScreen"
  );
}


async function adminLogin(
  email,
  password
) {

  if (!db) {

    setMessage(
      "loginMessage",
      "Database belum terhubung."
    );

    return;
  }

  if (!email || !password) {

    setMessage(
      "loginMessage",
      "Email dan password wajib diisi."
    );

    return;
  }

  const {
    data,
    error
  } =
    await db.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    console.error(
      "Login error:",
      error
    );

    setMessage(
      "loginMessage",
      error.message
    );

    return;
  }

  setMessage(
    "loginMessage",
    "Login berhasil.",
    true
  );

  openAdmin(
    data.user
  );
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

  clearInterval(
    timerId
  );

  if (db) {

    try {

      await db.auth.signOut();

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }
  }

  showScreen(
    "homeScreen"
  );
}


/* =========================================================
   ADD QUESTION
   ========================================================= */

function openAdd() {

  editingId = null;

  if ($("modalTitle")) {
    $("modalTitle").textContent =
      "Tambah Soal";
  }

  if ($("questionForm")) {
    $("questionForm").reset();
  }

  if ($("questionId")) {
    $("questionId").value = "";
  }

  setMessage(
    "formMessage",
    ""
  );

  if ($("questionModal")) {

    $("questionModal")
      .classList
      .remove("hidden");

  }
}


/* =========================================================
   EDIT QUESTION
   ========================================================= */

function openEdit(id) {

  const question =
    questions.find(
      (q) =>
        String(q.id) ===
        String(id)
    );

  if (!question) return;

  editingId =
    question.id;

  if ($("modalTitle")) {
    $("modalTitle").textContent =
      "Edit Soal";
  }

  if ($("questionId")) {
    $("questionId").value =
      question.id;
  }

  if ($("subject")) {
    $("subject").value =
      question.subject;
  }

  if ($("question")) {
    $("question").value =
      question.question;
  }

  if ($("answerA")) {
    $("answerA").value =
      question.answers.A;
  }

  if ($("answerB")) {
    $("answerB").value =
      question.answers.B;
  }

  if ($("answerC")) {
    $("answerC").value =
      question.answers.C;
  }

  if ($("answerD")) {
    $("answerD").value =
      question.answers.D;
  }

  if ($("correct")) {
    $("correct").value =
      question.correct;
  }

  setMessage(
    "formMessage",
    ""
  );

  if ($("questionModal")) {

    $("questionModal")
      .classList
      .remove("hidden");

  }
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

  if ($("questionModal")) {

    $("questionModal")
      .classList
      .add("hidden");

  }
}


/* =========================================================
   SAVE QUESTION
   ========================================================= */

async function saveQuestion(event) {

  event.preventDefault();

  if (!db) {

    setMessage(
      "formMessage",
      "Database belum terhubung."
    );

    return;
  }

  const subject =
    $("subject")
      ?.value
      .trim() || "";

  const question =
    $("question")
      ?.value
      .trim() || "";

  const answerA =
    $("answerA")
      ?.value
      .trim() || "";

  const answerB =
    $("answerB")
      ?.value
      .trim() || "";

  const answerC =
    $("answerC")
      ?.value
      .trim() || "";

  const answerD =
    $("answerD")
      ?.value
      .trim() || "";

  const correct =
    $("correct")
      ?.value
      .toUpperCase() || "";

  if (
    !subject ||
    !question ||
    !answerA ||
    !answerB ||
    !answerC ||
    !answerD ||
    !["A", "B", "C", "D"].includes(correct)
  ) {

    setMessage(
      "formMessage",
      "Lengkapi semua data soal dan pilih jawaban benar A/B/C/D."
    );

    return;
  }


  /*
    PENTING:

    answers disimpan sebagai ARRAY
    agar sesuai dengan data soal
    yang sudah ada di Supabase.
  */

  const payload = {

    subject,

    question,

    answers: [
      answerA,
      answerB,
      answerC,
      answerD
    ],

    correct

  };


  try {

    let error = null;

    if (editingId) {

      const result =
        await db
          .from("questions")
          .update(payload)
          .eq(
            "id",
            editingId
          );

      error =
        result.error;

    } else {

      const result =
        await db
          .from("questions")
          .insert(payload);

      error =
        result.error;
    }

    if (error) {
      throw error;
    }

    closeModal();

    await loadQuestions();

  } catch (error) {

    console.error(
      "Gagal menyimpan soal:",
      error
    );

    setMessage(
      "formMessage",
      error.message ||
      "Gagal menyimpan soal."
    );
  }
}


/* =========================================================
   DELETE QUESTION
   ========================================================= */

async function deleteQuestion(id) {

  const confirmed =
    confirm(
      "Hapus soal ini?"
    );

  if (!confirmed) {
    return;
  }

  if (!db) {

    alert(
      "Database belum terhubung."
    );

    return;
  }

  try {

    const {
      error
    } =
      await db
        .from("questions")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      throw error;
    }

    await loadQuestions();

  } catch (error) {

    console.error(
      "Gagal menghapus soal:",
      error
    );

    alert(
      error.message ||
      "Gagal menghapus soal."
    );
  }
}


/* =========================================================
   START QUIZ
   ========================================================= */

function startQuiz(subject) {

  selectedSubject =
    subject;

  quizQuestions =
    questions
      .filter(
        (q) =>
          q.subject === subject
      )
      .sort(
        () =>
          Math.random() - 0.5
      );

  if (!quizQuestions.length) {

    alert(
      "Belum ada soal untuk mata pelajaran ini."
    );

    return;
  }

  currentIndex = 0;

  correctCount = 0;

  selectedAnswer = null;

  showScreen(
    "quizScreen"
  );

  renderQuizQuestion();
}


/* =========================================================
   RENDER QUIZ
   ========================================================= */

function renderQuizQuestion() {

  clearInterval(
    timerId
  );

  const question =
    quizQuestions[
      currentIndex
    ];

  if (!question) {
    finishQuiz();
    return;
  }

  selectedAnswer = null;

  if ($("quizSubject")) {

    $("quizSubject")
      .textContent =
      question.subject;

  }

  if ($("quizProgress")) {

    $("quizProgress")
      .textContent =
      `Soal ${
        currentIndex + 1
      } / ${
        quizQuestions.length
      }`;

  }

  if ($("quizQuestion")) {

    $("quizQuestion")
      .textContent =
      question.question;

  }


  if ($("answerList")) {

    $("answerList")
      .innerHTML =
      Object.entries(
        question.answers
      )
      .map(
        ([letter, text]) => `
          <button
            type="button"
            class="answer"
            data-answer="${letter}"
          >
            <b>${letter}</b>
            ${escapeHtml(text)}
          </button>
        `
      )
      .join("");


    $("answerList")
      .querySelectorAll(
        ".answer"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            selectedAnswer =
              button.dataset.answer;

            $("answerList")
              .querySelectorAll(
                ".answer"
              )
              .forEach(
                (item) =>
                  item.classList.remove(
                    "selected"
                  )
              );

            button.classList.add(
              "selected"
            );

            if ($("nextQuestionBtn")) {

              $("nextQuestionBtn")
                .disabled = false;

            }

          }
        );

      });

  }


  if ($("nextQuestionBtn")) {

    $("nextQuestionBtn")
      .disabled = true;

    $("nextQuestionBtn")
      .textContent =
      currentIndex ===
      quizQuestions.length - 1
        ? "Selesai"
        : "Jawab & Lanjut";
  }


  /*
    TIMER 30 DETIK
  */

  secondsLeft = 30;

  if ($("timer")) {

    $("timer")
      .textContent =
      secondsLeft;

  }


  timerId =
    setInterval(() => {

      secondsLeft--;

      if ($("timer")) {

        $("timer")
          .textContent =
          secondsLeft;

      }

      if (
        secondsLeft <= 0
      ) {

        clearInterval(
          timerId
        );

        nextQuestion();

      }

    }, 1000);
}


/* =========================================================
   NEXT QUESTION
   ========================================================= */

function nextQuestion() {

  clearInterval(
    timerId
  );

  const question =
    quizQuestions[
      currentIndex
    ];

  if (!question) {
    return;
  }

  if (
    selectedAnswer &&
    selectedAnswer ===
    question.correct
  ) {

    correctCount++;

  }

  currentIndex++;

  if (
    currentIndex >=
    quizQuestions.length
  ) {

    finishQuiz();

  } else {

    renderQuizQuestion();

  }
}


/* =========================================================
   FINISH QUIZ
   ========================================================= */

function finishQuiz() {

  clearInterval(
    timerId
  );

  const total =
    quizQuestions.length;

  if (!total) {
    return;
  }

  const percent =
    Math.round(
      (
        correctCount /
        total
      ) * 100
    );

  if ($("resultSubject")) {

    $("resultSubject")
      .textContent =
      selectedSubject;

  }

  if ($("resultScore")) {

    $("resultScore")
      .textContent =
      `${percent}%`;

  }

  if ($("resultDetail")) {

    $("resultDetail")
      .textContent =
      `${correctCount} benar dari ${total} soal.`;

  }

  showScreen(
    "resultScreen"
  );
}


/* =========================================================
   RETRY QUIZ
   ========================================================= */

function retryQuiz() {

  startQuiz(
    selectedSubject
  );
}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "BANZ QUIZ siap."
    );


    /* =====================================================
       LOADING
       ===================================================== */

    const finishLoading =
      () => {

        const loading =
          $("loadingScreen");

        const app =
          $("app");

        if (loading) {

          loading.classList.add(
            "hidden"
          );

        }

        if (app) {

          app.classList.remove(
            "hidden"
          );

        }

      };


    const loadingTimer =
      setTimeout(
        finishLoading,
        3000
      );


    if ($("skipLoading")) {

      $("skipLoading")
        .addEventListener(
          "click",
          () => {

            clearTimeout(
              loadingTimer
            );

            finishLoading();

          }
        );

    }


    if ($("introVideo")) {

      $("introVideo")
        .addEventListener(
          "ended",
          finishLoading
        );

      $("introVideo")
        .addEventListener(
          "error",
          finishLoading
        );

    }


    /* =====================================================
       HOME
       ===================================================== */

    if ($("studentBtn")) {

      $("studentBtn")
        .addEventListener(
          "click",
          () => {

            showScreen(
              "studentScreen"
            );

            renderSubjects();

          }
        );

    }


    if ($("adminBtn")) {

      $("adminBtn")
        .addEventListener(
          "click",
          () => {

            showScreen(
              "adminLoginScreen"
            );

          }
        );

    }


    /* =====================================================
       ADMIN LOGIN
       ===================================================== */

    if ($("adminLoginForm")) {

      $("adminLoginForm")
        .addEventListener(
          "submit",
          (event) => {

            event.preventDefault();

            const email =
              $("adminEmail")
                ?.value
                .trim() || "";

            const password =
              $("adminPassword")
                ?.value || "";

            adminLogin(
              email,
              password
            );

          }
        );

    }


    /* =====================================================
       ADMIN
       ===================================================== */

    if ($("logoutBtn")) {

      $("logoutBtn")
        .addEventListener(
          "click",
          logout
        );

    }


    if ($("addQuestionBtn")) {

      $("addQuestionBtn")
        .addEventListener(
          "click",
          openAdd
        );

    }


    if ($("closeModal")) {

      $("closeModal")
        .addEventListener(
          "click",
          closeModal
        );

    }


    if ($("questionForm")) {

      $("questionForm")
        .addEventListener(
          "submit",
          saveQuestion
        );

    }


    if ($("adminSearch")) {

      $("adminSearch")
        .addEventListener(
          "input",
          renderAdminQuestions
        );

    }


    /* =====================================================
       QUIZ
       ===================================================== */

    if ($("nextQuestionBtn")) {

      $("nextQuestionBtn")
        .addEventListener(
          "click",
          nextQuestion
        );

    }


    if ($("quitQuizBtn")) {

      $("quitQuizBtn")
        .addEventListener(
          "click",
          () => {

            clearInterval(
              timerId
            );

            showScreen(
              "studentScreen"
            );

          }
        );

    }


    /* =====================================================
       RESULT
       ===================================================== */

    if ($("retryBtn")) {

      $("retryBtn")
        .addEventListener(
          "click",
          retryQuiz
        );

    }


    if ($("resultHomeBtn")) {

      $("resultHomeBtn")
        .addEventListener(
          "click",
          () => {

            clearInterval(
              timerId
            );

            showScreen(
              "homeScreen"
            );

          }
        );

    }


    /* =====================================================
       BACK BUTTON
       ===================================================== */

    document
      .querySelectorAll(
        "[data-back]"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const target =
                button.dataset.back;

              if (target) {

                showScreen(
                  target
                );

              }

            }
          );

        }
      );


    /* =====================================================
       SUPABASE
       ===================================================== */

    init();

  }
);
