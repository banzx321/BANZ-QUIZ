/* BANZ QUIZ - Supabase Edition */

const SUPABASE_URL = "https://pvvlyxcyfkqqqoklptqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZMTwk7G1KQYDzrIvjtWA-A_F8qsw-RJ";

let db = null;

const $ = (id) => document.getElementById(id);

const screens = [
  "homeScreen",
  "adminLoginScreen",
  "adminScreen",
  "studentScreen",
  "quizScreen",
  "resultScreen"
];

let questions = [];
let selectedSubject = "";
let quizQuestions = [];
let currentIndex = 0;
let selectedAnswer = null;
let correctCount = 0;
let timerId = null;
let secondsLeft = 30;
let editingId = null;


/* =========================
   SUPABASE
========================= */

function initSupabase() {
  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error("Supabase JS belum termuat.");

    if ($("dbStatus")) {
      $("dbStatus").textContent = "Error";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Supabase belum termuat. Periksa CDN Supabase di index.html.";
    }

    return false;
  }

  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  return true;
}


/* =========================
   SCREEN
========================= */

function showScreen(id) {
  screens.forEach((x) => {
    const el = $(x);
    if (el) {
      el.classList.toggle("hidden", x !== id);
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================
   MESSAGE
========================= */

function setMessage(id, text, ok = false) {
  const el = $(id);

  if (!el) return;

  el.textContent = text || "";
  el.style.color = ok ? "#16803a" : "";
}


/* =========================
   SECURITY HTML
========================= */

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}


/* =========================
   NORMALIZE QUESTION
========================= */

function normalizeQuestion(q) {
  let answers = q.answers;

  /*
    Supabase bisa mengembalikan:

    [
      "Jawaban A",
      "Jawaban B",
      "Jawaban C",
      "Jawaban D"
    ]

    atau:

    {
      A: "Jawaban A",
      B: "Jawaban B",
      C: "Jawaban C",
      D: "Jawaban D"
    }
  */

  if (Array.isArray(answers)) {
    answers = {
      A: answers[0] ?? "",
      B: answers[1] ?? "",
      C: answers[2] ?? "",
      D: answers[3] ?? ""
    };
  }

  else if (answers && typeof answers === "object") {
    answers = {
      A: answers.A ?? "",
      B: answers.B ?? "",
      C: answers.C ?? "",
      D: answers.D ?? ""
    };
  }

  else {
    answers = {
      A: "",
      B: "",
      C: "",
      D: ""
    };
  }

  return {
    id: q.id,
    subject: q.subject,
    question: q.question,
    answers: answers,
    correct: String(q.correct || "").toUpperCase()
  };
}


/* =========================
   LOAD QUESTIONS
========================= */

async function loadQuestions() {

  if (!db) {
    console.error("Database belum tersedia.");

    if ($("dbStatus")) {
      $("dbStatus").textContent = "Error";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Database belum siap.";
    }

    return;
  }

  const {
    data,
    error
  } = await db
    .from("questions")
    .select(
      "id,subject,question,answers,correct,created_at"
    )
    .order("created_at", {
      ascending: true
    });

  if (error) {

    console.error("Supabase error:", error);

    if ($("dbStatus")) {
      $("dbStatus").textContent = "Error";
    }

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "Gagal mengambil soal dari database.";
    }

    return;
  }

  questions = (data || []).map(normalizeQuestion);

  if ($("dbStatus")) {
    $("dbStatus").textContent = "Online";
  }

  if ($("publicStatus")) {
    $("publicStatus").textContent =
      `${questions.length} soal tersedia online.`;
  }

  renderSubjects();
  renderAdminQuestions();
  updateStats();
}


/* =========================
   INIT
========================= */

async function init() {

  const bad =
    SUPABASE_URL.includes("GANTI_") ||
    SUPABASE_PUBLISHABLE_KEY.includes("GANTI_");

  if (bad) {

    if ($("publicStatus")) {
      $("publicStatus").textContent =
        "SUPABASE_URL atau API key belum diisi.";
    }

    return;
  }

  const connected = initSupabase();

  if (!connected) {
    return;
  }

  await loadQuestions();

  try {

    const {
      data
    } = await db.auth.getSession();

    if (data?.session) {
      openAdmin(data.session.user);
    }

  } catch (error) {

    console.error(
      "Gagal mengecek session:",
      error
    );
  }
}


/* =========================
   STATS
========================= */

function updateStats() {

  if ($("totalQuestions")) {
    $("totalQuestions").textContent =
      questions.length;
  }

  if ($("totalSubjects")) {
    $("totalSubjects").textContent =
      new Set(
        questions.map((q) => q.subject)
      ).size;
  }
}


/* =========================
   SUBJECT
========================= */

function renderSubjects() {

  const list = $("subjectList");

  if (!list) return;

  const grouped = {};

  questions.forEach((q) => {

    grouped[q.subject] =
      (grouped[q.subject] || 0) + 1;

  });

  const entries =
    Object.entries(grouped);

  if (!entries.length) {

    list.innerHTML =
      `<div class="muted">Belum ada soal.</div>`;

    return;
  }

  list.innerHTML =
    entries.map(
      ([subject, count]) => `
        <button
          class="subject-btn"
          data-subject="${escapeHtml(subject)}"
        >
          📘 ${escapeHtml(subject)}
          <span>${count} soal</span>
        </button>
      `
    ).join("");

  list
    .querySelectorAll(".subject-btn")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        () => startQuiz(
          btn.dataset.subject
        )
      );

    });
}


/* =========================
   ADMIN QUESTIONS
========================= */

function renderAdminQuestions() {

  const list =
    $("adminQuestionList");

  if (!list) return;

  const search =
    $("adminSearch")?.value
      .toLowerCase()
      .trim() || "";

  const filtered =
    questions.filter((q) =>
      `${q.subject} ${q.question}`
        .toLowerCase()
        .includes(search)
    );

  if (!filtered.length) {

    list.innerHTML =
      `<div class="muted">Tidak ada soal.</div>`;

    return;
  }

  list.innerHTML =
    filtered.map(
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
              class="btn secondary small edit-btn"
              data-id="${q.id}"
            >
              Edit
            </button>

            <button
              class="btn danger small delete-btn"
              data-id="${q.id}"
            >
              Hapus
            </button>

          </div>

        </div>
      `
    ).join("");

  list
    .querySelectorAll(".edit-btn")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        () => openEdit(
          btn.dataset.id
        )
      );

    });

  list
    .querySelectorAll(".delete-btn")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        () => deleteQuestion(
          btn.dataset.id
        )
      );

    });
}


/* =========================
   ADMIN LOGIN
========================= */

function openAdmin(user) {

  if ($("adminEmailLabel")) {
    $("adminEmailLabel").textContent =
      user.email || "";
  }

  showScreen("adminScreen");
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

  const {
    data,
    error
  } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {

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

  openAdmin(data.user);
}


async function logout() {

  if (db) {
    await db.auth.signOut();
  }

  showScreen("homeScreen");
}


/* =========================
   ADD QUESTION
========================= */

function openAdd() {

  editingId = null;

  $("modalTitle").textContent =
    "Tambah Soal";

  $("questionForm").reset();

  $("questionId").value = "";

  setMessage(
    "formMessage",
    ""
  );

  $("questionModal")
    .classList
    .remove("hidden");
}


/* =========================
   EDIT QUESTION
========================= */

function openEdit(id) {

  const q =
    questions.find(
      (x) =>
        String(x.id) ===
        String(id)
    );

  if (!q) return;

  editingId = q.id;

  $("modalTitle").textContent =
    "Edit Soal";

  $("questionId").value =
    q.id;

  $("subject").value =
    q.subject;

  $("question").value =
    q.question;

  $("answerA").value =
    q.answers.A;

  $("answerB").value =
    q.answers.B;

  $("answerC").value =
    q.answers.C;

  $("answerD").value =
    q.answers.D;

  $("correct").value =
    q.correct;

  setMessage(
    "formMessage",
    ""
  );

  $("questionModal")
    .classList
    .remove("hidden");
}


function closeModal() {

  $("questionModal")
    .classList
    .add("hidden");
}


/* =========================
   SAVE QUESTION
========================= */

async function saveQuestion(e) {

  e.preventDefault();

  if (!db) {
    setMessage(
      "formMessage",
      "Database belum terhubung."
    );

    return;
  }

  const payload = {

    subject:
      $("subject")
        .value
        .trim(),

    question:
      $("question")
        .value
        .trim(),

    answers: {

      A:
        $("answerA")
          .value
          .trim(),

      B:
        $("answerB")
          .value
          .trim(),

      C:
        $("answerC")
          .value
          .trim(),

      D:
        $("answerD")
          .value
          .trim()

    },

    correct:
      $("correct").value

  };

  let error;

  if (editingId) {

    ({
      error
    } = await db
      .from("questions")
      .update(payload)
      .eq("id", editingId));

  } else {

    ({
      error
    } = await db
      .from("questions")
      .insert(payload));

  }

  if (error) {

    console.error(error);

    setMessage(
      "formMessage",
      error.message
    );

    return;
  }

  closeModal();

  await loadQuestions();
}


/* =========================
   DELETE
========================= */

async function deleteQuestion(id) {

  if (
    !confirm(
      "Hapus soal ini?"
    )
  ) {
    return;
  }

  if (!db) {
    alert(
      "Database belum terhubung."
    );

    return;
  }

  const {
    error
  } = await db
    .from("questions")
    .delete()
    .eq("id", id);

  if (error) {

    alert(
      error.message
    );

    return;
  }

  await loadQuestions();
}


/* =========================
   START QUIZ
========================= */

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
      "Belum ada soal."
    );

    return;
  }

  currentIndex = 0;

  correctCount = 0;

  showScreen(
    "quizScreen"
  );

  renderQuizQuestion();
}


/* =========================
   RENDER QUIZ
========================= */

function renderQuizQuestion() {

  clearInterval(
    timerId
  );

  const q =
    quizQuestions[
      currentIndex
    ];

  selectedAnswer = null;

  $("quizSubject")
    .textContent =
    q.subject;

  $("quizProgress")
    .textContent =
    `Soal ${
      currentIndex + 1
    } / ${
      quizQuestions.length
    }`;

  $("quizQuestion")
    .textContent =
    q.question;

  $("answerList")
    .innerHTML =
    Object.entries(
      q.answers
    )
    .map(
      ([letter, text]) => `
        <button
          class="answer"
          data-answer="${letter}"
        >
          <b>${letter}</b>
          ${escapeHtml(text)}
        </button>
      `
    )
    .join("");

  $("nextQuestionBtn")
    .disabled = true;

  $("nextQuestionBtn")
    .textContent =
      currentIndex ===
      quizQuestions.length - 1
        ? "Selesai"
        : "Jawab & Lanjut";

  $("answerList")
    .querySelectorAll(".answer")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        () => {

          selectedAnswer =
            btn.dataset.answer;

          $("answerList")
            .querySelectorAll(
              ".answer"
            )
            .forEach(
              (x) =>
                x.classList.remove(
                  "selected"
                )
            );

          btn.classList.add(
            "selected"
          );

          $("nextQuestionBtn")
            .disabled = false;
        }
      );

    });

  secondsLeft = 30;

  $("timer")
    .textContent =
    secondsLeft;

  timerId =
    setInterval(() => {

      secondsLeft--;

      $("timer")
        .textContent =
        secondsLeft;

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


/* =========================
   NEXT QUESTION
========================= */

function nextQuestion() {

  clearInterval(
    timerId
  );

  const q =
    quizQuestions[
      currentIndex
    ];

  if (
    selectedAnswer ===
    q.correct
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


/* =========================
   RESULT
========================= */

function finishQuiz() {

  const total =
    quizQuestions.length;

  const percent =
    Math.round(
      (correctCount /
        total) *
        100
    );

  $("resultSubject")
    .textContent =
    selectedSubject;

  $("resultScore")
    .textContent =
    `${percent}%`;

  $("resultDetail")
    .textContent =
    `${correctCount} benar dari ${total} soal.`;

  showScreen(
    "resultScreen"
  );
}


function retryQuiz() {

  startQuiz(
    selectedSubject
  );

}


/* =========================
   LOADING
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

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


    /*
      Loading tidak boleh
      menahan website selamanya.
    */

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
          () =>
            showScreen(
              "adminLoginScreen"
            )
        );

    }


    if ($("adminLoginForm")) {

      $("adminLoginForm")
        .addEventListener(
          "submit",
          (e) => {

            e.preventDefault();

            adminLogin(
              $("adminEmail")
                .value
                .trim(),

              $("adminPassword")
                .value
            );

          }
        );

    }


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
      $("closeModal").addEventListener(
        "click",
        closeModal
      );
    }

    if ($("questionForm")) {
      $("questionForm").addEventListener(
        "submit",
        saveQuestion
      );
    }

    if ($("adminSearch")) {
      $("adminSearch").addEventListener(
        "input",
        renderAdminQuestions
      );
    }

    if ($("nextQuestionBtn")) {
      $("nextQuestionBtn").addEventListener(
        "click",
        nextQuestion
      );
    }

    if ($("quitQuizBtn")) {
      $("quitQuizBtn").addEventListener(
        "click",
        () => {
          clearInterval(timerId);
          showScreen("studentScreen");
        }
      );
    }

    if ($("retryBtn")) {
      $("retryBtn").addEventListener(
        "click",
        retryQuiz
      );
    }

    if ($("resultHomeBtn")) {
      $("resultHomeBtn").addEventListener(
        "click",
        () => {
          clearInterval(timerId);
          showScreen("homeScreen");
        }
      );
    }

    document
      .querySelectorAll("[data-back]")
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => {
            const target = btn.dataset.back;

            if (target) {
              showScreen(target);
            }
          }
        );
      });

    /*
      Jalankan koneksi Supabase
      setelah semua tombol selesai dipasang.
    */
    init();

  }
);
         
