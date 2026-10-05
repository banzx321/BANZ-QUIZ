// =====================================================
// BANZ QUIZ
// SCRIPT.JS
// =====================================================


// =====================================================
// FIREBASE IMPORT
// =====================================================

import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";


import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================
//
// GANTI ISI BAGIAN INI DENGAN CONFIG FIREBASE ABANG
//
// Firebase Console
// → Project Settings
// → Your apps
// → Web App
// → SDK setup and configuration
//
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXX",
  authDomain: "banz-quiz-xxxxx.firebaseapp.com",
  databaseURL: "https://banz-quiz-xxxxx-default-rtdb.firebaseio.com",
  projectId: "banz-quiz-xxxxx",
  storageBucket: "banz-quiz-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxx"
};


// =====================================================
// FIREBASE VARIABLE
// =====================================================

let firebaseApp = null;

let database = null;

let questionsRef = null;

let firebaseReady = false;


// =====================================================
// CEK CONFIG
// =====================================================

function configFirebaseValid() {

  if (
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey ===
      "MASUKKAN_API_KEY"
  ) {

    return false;

  }


  if (
    !firebaseConfig.projectId ||
    firebaseConfig.projectId ===
      "PROJECT-ID"
  ) {

    return false;

  }


  if (
    !firebaseConfig.databaseURL ||
    firebaseConfig.databaseURL.includes(
      "PROJECT-ID"
    )
  ) {

    return false;

  }


  return true;

}


// =====================================================
// INIT FIREBASE
// =====================================================

function initFirebase() {

  if (
    !configFirebaseValid()
  ) {

    console.warn(
      "Firebase belum dikonfigurasi."
    );

    setDatabaseStatus(
      "Firebase belum dikonfigurasi. Website tetap bisa dibuka, tetapi data online belum aktif."
    );

    return false;

  }


  try {

    firebaseApp =
      initializeApp(
        firebaseConfig
      );


    database =
      getDatabase(
        firebaseApp
      );


    questionsRef =
      ref(
        database,
        "questions"
      );


    firebaseReady = true;


    console.log(
      "Firebase berhasil terhubung."
    );


    setDatabaseStatus(
      "✓ Firebase terhubung."
    );


    listenQuestions();


    return true;

  } catch (error) {

    console.error(
      "Firebase error:",
      error
    );


    setDatabaseStatus(
      "Firebase gagal terhubung. Periksa konfigurasi Firebase."
    );


    return false;

  }

}


// =====================================================
// VARIABEL APLIKASI
// =====================================================

let questions = [];

let currentQuestion = 0;

let score = 0;

let selectedSubject = "Semua";

let quizQuestions = [];

let timer = null;

let timeLeft = 30;

let toastTimer = null;


// =====================================================
// ELEMENT HELPER
// =====================================================

function $(id) {

  return document.getElementById(id);

}


// =====================================================
// TOAST
// =====================================================

function showToast(message) {

  const toast =
    $("toast");


  if (!toast) {

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


// =====================================================
// DATABASE STATUS
// =====================================================

function setDatabaseStatus(message) {

  const element =
    $("databaseStatus");


  if (element) {

    element.textContent =
      message;

  }

}


// =====================================================
// LOADING SCREEN
// =====================================================

function setupLoading() {

  const loadingScreen =
    $("loadingScreen");

  const video =
    $("introVideo");

  const skip =
    $("skipLoading");

  const app =
    $("app");


  let finished =
    false;


  function finishLoading() {

    if (finished) {

      return;

    }


    finished = true;


    if (loadingScreen) {

      loadingScreen.classList.add(
        "hidden"
      );

    }


    if (app) {

      app.classList.remove(
        "hidden"
      );

    }

  }


  // Skip

  if (skip) {

    skip.addEventListener(
      "click",
      finishLoading
    );

  }


  // Video selesai

  if (video) {

    video.addEventListener(
      "ended",
      finishLoading
    );


    // Video error

    video.addEventListener(
      "error",
      finishLoading
    );

  }


  // Jangan pernah stuck
  // maksimal 5 detik

  setTimeout(
    finishLoading,
    5000
  );

}


// =====================================================
// SCREEN
// =====================================================

function showScreen(screenId) {

  const screens = [

    "loginScreen",

    "adminLoginScreen",

    "studentScreen",

    "adminScreen",

    "quizScreen",

    "resultScreen"

  ];


  screens.forEach(
    id => {

      const element =
        $(id);


      if (element) {

        element.classList.add(
          "hidden"
        );

      }

    }
  );


  const target =
    $(screenId);


  if (target) {

    target.classList.remove(
      "hidden"
    );

  }

}


// =====================================================
// FIREBASE LISTENER
// =====================================================

function listenQuestions() {

  if (
    !firebaseReady ||
    !questionsRef
  ) {

    return;

  }


  onValue(

    questionsRef,

    snapshot => {

      const data =
        snapshot.val();


      if (!data) {

        questions = [];

      } else {

        questions =
          Object.entries(
            data
          ).map(
            ([id, question]) => ({

              id,

              ...question

            })
          );

      }


      console.log(
        "Soal:",
        questions.length
      );


      updateAdminStats();

      updateSubjectFilter();

      renderAdminQuestions();

      updateStudentSubject();

    },


    error => {

      console.error(
        "Database listener error:",
        error
      );


      setDatabaseStatus(
        "Tidak dapat membaca database. Periksa Rules Firebase."
      );

    }

  );

}


// =====================================================
// ADMIN LOGIN
// =====================================================
//
// Untuk demo awal.
// Untuk website publik sebaiknya menggunakan
// Firebase Authentication.
// =====================================================

const ADMIN_USERNAME =
  "admin";


const ADMIN_PASSWORD =
  "admin123";


// =====================================================
// ADMIN LOGIN EVENT
// =====================================================

function setupAdminLogin() {

  const form =
    $("adminLoginForm");


  if (!form) {

    return;

  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const username =
        $("adminUsername").value.trim();


      const password =
        $("adminPassword").value;


      if (
        username ===
          ADMIN_USERNAME &&
        password ===
          ADMIN_PASSWORD
      ) {

        $("adminUsername").value =
          "";

        $("adminPassword").value =
          "";


        showScreen(
          "adminScreen"
        );


        renderAdminQuestions();


        showToast(
          "Login admin berhasil."
        );

      } else {

        $("adminLoginMessage").textContent =
          "Username atau password salah.";

      }

    }
  );

}


// =====================================================
// ADMIN DASHBOARD
// =====================================================

function updateAdminStats() {

  const totalQuestions =
    $("totalQuestions");


  const totalSubjects =
    $("totalSubjects");


  const subjects =
    [
      ...new Set(
        questions
          .map(
            q => q.subject
          )
          .filter(Boolean)
      )
    ];


  if (totalQuestions) {

    totalQuestions.textContent =
      questions.length;

  }


  if (totalSubjects) {

    totalSubjects.textContent =
      subjects.length;

  }

}


// =====================================================
// SUBJECT FILTER
// =====================================================

function updateSubjectFilter() {

  const filter =
    $("subjectFilter");


  if (!filter) {

    return;

  }


  const oldValue =
    filter.value;


  const subjects =
    [
      ...new Set(
        questions
          .map(
            q => q.subject
          )
          .filter(Boolean)
      )
    ];


  filter.innerHTML =
    `
      <option value="Semua">
        Semua Mata Pelajaran
      </option>
    `;


  subjects.forEach(
    subject => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        subject;


      option.textContent =
        subject;


      filter.appendChild(
        option
      );

    }
  );


  if (
    subjects.includes(
      oldValue
    )
  ) {

    filter.value =
      oldValue;

  }

}


// =====================================================
// ADMIN QUESTION LIST
// =====================================================

function renderAdminQuestions() {

  const container =
    $("adminQuestionList");


  if (!container) {

    return;

  }


  if (
    questions.length === 0
  ) {

    container.innerHTML =
      `
        <div class="empty-state">

          Belum ada soal.

        </div>
      `;

    return;

  }


  container.innerHTML =
    "";


  questions.forEach(
    question => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "question-item";


      const questionText =
        escapeHtml(
          question.question ||
          ""
        );


      const subject =
        escapeHtml(
          question.subject ||
          "Tanpa Mata Pelajaran"
        );


      item.innerHTML =
        `

          <div
            class="question-item-header"
          >

            <div>

              <span
                class="subject-badge"
              >
                ${subject}
              </span>

              <h4>
                ${questionText}
              </h4>

            </div>


            <div
              class="question-actions"
            >

              <button
                class="btn-edit"
                data-id="${question.id}"
              >
                Edit
              </button>

              <button
                class="btn-delete"
                data-id="${question.id}"
              >
                Hapus
              </button>

            </div>

          </div>

        `;


      container.appendChild(
        item
      );

    }
  );


  container
    .querySelectorAll(
      ".btn-edit"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.id;

            openEditQuestion(
              id
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      ".btn-delete"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.id;

            deleteQuestion(
              id
            );

          }
        );

      }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// =====================================================
// MODAL
// =====================================================

function openAddQuestion() {

  $("modalTitle").textContent =
    "Tambah Soal";


  $("editQuestionId").value =
    "";


  $("questionForm").reset();


  $("questionModal")
    .classList.remove(
      "hidden"
    );

}


function closeModal() {

  $("questionModal")
    .classList.add(
      "hidden"
    );

}


// =====================================================
// EDIT QUESTION
// =====================================================

function openEditQuestion(id) {

  const question =
    questions.find(
      q => q.id === id
    );


  if (!question) {

    return;

  }


  $("modalTitle").textContent =
    "Edit Soal";


  $("editQuestionId").value =
    id;


  $("questionSubject").value =
    question.subject || "";


  $("questionText").value =
    question.question || "";


  $("answerA").value =
    question.answers?.A || "";


  $("answerB").value =
    question.answers?.B || "";


  $("answerC").value =
    question.answers?.C || "";


  $("answerD").value =
    question.answers?.D || "";


  $("correctAnswer").value =
    question.correct || "A";


  $("questionModal")
    .classList.remove(
      "hidden"
    );

}


// =====================================================
// SAVE QUESTION
// =====================================================

async function saveQuestion(
  event
) {

  event.preventDefault();


  if (!firebaseReady) {

    showToast(
      "Firebase belum dikonfigurasi."
    );

    return;

  }


  const id =
    $("editQuestionId").value;


  const questionData = {

    subject:
      $("questionSubject")
        .value
        .trim(),

    question:
      $("questionText")
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
      $("correctAnswer")
        .value,

    updatedAt:
      Date.now()

  };


  try {

    if (id) {

      await update(

        ref(
          database,
          `questions/${id}`
        ),

        questionData

      );


      showToast(
        "Soal berhasil diperbarui."
      );

    } else {

      await set(

        push(
          questionsRef
        ),

        {

          ...questionData,

          createdAt:
            Date.now()

        }

      );


      showToast(
        "Soal berhasil ditambahkan."
      );

    }


    closeModal();


  } catch (error) {

    console.error(
      error
    );


    showToast(
      "Gagal menyimpan soal. Periksa Firebase Rules."
    );

  }

}


// =====================================================
// DELETE QUESTION
// =====================================================

async function deleteQuestion(
  id
) {

  if (
    !confirm(
      "Yakin ingin menghapus soal ini?"
    )
  ) {

    return;

  }


  if (!firebaseReady) {

    showToast(
      "Firebase belum terhubung."
    );

    return;

  }


  try {

    await remove(
      ref(
        database,
        `questions/${id}`
      )
    );


    showToast(
      "Soal berhasil dihapus."
    );


  } catch (error) {

    console.error(
      error
    );


    showToast(
      "Gagal menghapus soal."
    );

  }

}


// =====================================================
// 15 SOAL IPS
// =====================================================

const soalIPS = [

  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Apa yang dimaksud dengan uang?",

    answers: {

      A:
        "Alat untuk memenuhi kebutuhan manusia",

      B:
        "Alat pembayaran yang sah dan diterima masyarakat",

      C:
        "Barang yang hanya digunakan untuk ditabung",

      D:
        "Surat berharga milik pemerintah"

    },

    correct:
      "B"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Lembaga yang bertugas menghimpun dana dari masyarakat dan menyalurkannya kembali dalam bentuk kredit disebut...",

    answers: {

      A: "Bank",

      B: "Pasar modal",

      C: "Pegadaian",

      D: "Perusahaan asuransi"

    },

    correct:
      "A"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Bank Indonesia merupakan...",

    answers: {

      A: "Bank umum",

      B: "Bank swasta",

      C: "Bank sentral",

      D: "Bank perkreditan rakyat"

    },

    correct:
      "C"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Salah satu fungsi utama bank adalah...",

    answers: {

      A:
        "Menghimpun dan menyalurkan dana",

      B:
        "Menjual kebutuhan pokok",

      C:
        "Memproduksi barang",

      D:
        "Mengelola perusahaan"

    },

    correct:
      "A"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Simpanan yang penarikannya dapat dilakukan menggunakan cek atau bilyet giro disebut...",

    answers: {

      A: "Deposito",

      B: "Tabungan",

      C: "Giro",

      D: "Saham"

    },

    correct:
      "C"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Simpanan di bank yang penarikannya dilakukan sesuai jangka waktu tertentu disebut...",

    answers: {

      A: "Giro",

      B: "Deposito",

      C: "Cek",

      D: "Kredit"

    },

    correct:
      "B"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Kegiatan bank memberikan pinjaman kepada masyarakat disebut...",

    answers: {

      A:
        "Menghimpun dana",

      B:
        "Menyalurkan kredit",

      C:
        "Mencetak uang",

      D:
        "Menjual saham"

    },

    correct:
      "B"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Lembaga yang memberikan perlindungan terhadap risiko tertentu dengan pembayaran premi disebut...",

    answers: {

      A: "Pegadaian",

      B: "Koperasi",

      C: "Perusahaan asuransi",

      D: "Pasar modal"

    },

    correct:
      "C"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Pegadaian memberikan pinjaman dengan jaminan berupa...",

    answers: {

      A: "Barang berharga",

      B: "Nilai rapor",

      C: "Kartu pelajar",

      D: "Surat izin sekolah"

    },

    correct:
      "A"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "OJK merupakan singkatan dari...",

    answers: {

      A:
        "Organisasi Jasa Keuangan",

      B:
        "Otoritas Jasa Keuangan",

      C:
        "Organisasi Jaminan Keuangan",

      D:
        "Otoritas Jaminan Kredit"

    },

    correct:
      "B"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Salah satu tugas OJK adalah...",

    answers: {

      A:
        "Mengawasi sektor jasa keuangan",

      B:
        "Mencetak semua uang rupiah",

      C:
        "Menentukan harga barang di pasar",

      D:
        "Membuat undang-undang negara"

    },

    correct:
      "A"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Lembaga yang menjamin simpanan nasabah bank disebut...",

    answers: {

      A: "OJK",

      B: "BI",

      C: "LPS",

      D: "BPK"

    },

    correct:
      "C"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Koperasi yang kegiatan utamanya memberikan pinjaman dan menerima simpanan anggota disebut...",

    answers: {

      A: "Koperasi produksi",

      B: "Koperasi konsumsi",

      C: "Koperasi simpan pinjam",

      D: "Koperasi jasa"

    },

    correct:
      "C"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Tempat bertemunya pihak yang membutuhkan dana dengan pihak yang memiliki dana melalui perdagangan efek disebut...",

    answers: {

      A: "Pasar tradisional",

      B: "Pasar modal",

      C: "Pasar barang",

      D: "Pasar tenaga kerja"

    },

    correct:
      "B"

  },


  {
    subject:
      "IPS - Keuangan dan Lembaga Keuangan",

    question:
      "Bukti kepemilikan seseorang terhadap suatu perusahaan disebut...",

    answers: {

      A: "Obligasi",

      B: "Saham",

      C: "Cek",

      D: "Deposito"

    },

    correct:
      "B"

  }

];


// =====================================================
// TAMBAHKAN 15 SOAL IPS
// =====================================================

async function tambahSoalIPS() {

  if (!firebaseReady) {

    showToast(
      "Firebase belum terhubung."
    );

    return;

  }


  if (
    questions.some(
      q =>
        q.subject ===
        "IPS - Keuangan dan Lembaga Keuangan"
    )
  ) {

    showToast(
      "Soal IPS sudah ada di database."
    );

    return;

  }


  if (
    !confirm(
      "Tambahkan 15 soal IPS ke database?"
    )
  ) {

    return;

  }


  try {

    for (
      const soal of soalIPS
    ) {

      const newRef =
        push(
          questionsRef
        );


      await set(
        newRef,
        {

          ...soal,

          createdAt:
            Date.now()

        }
      );

    }


    showToast(
      "15 soal IPS berhasil ditambahkan!"
    );


  } catch (error) {

    console.error(
      error
    );


    showToast(
      "Gagal menambahkan soal IPS. Periksa Firebase Rules."
    );

  }

}


// =====================================================
// STUDENT SUBJECT
// =====================================================

function updateStudentSubject() {

  updateSubjectFilter();

}


// =====================================================
// MULAI QUIZ
// =====================================================

function startQuiz() {

  selectedSubject =
    $("subjectFilter").value;


  quizQuestions =
    selectedSubject === "Semua"

      ? [...questions]

      : questions.filter(
          q =>
            q.subject ===
            selectedSubject
        );


  if (
    quizQuestions.length === 0
  ) {

    showToast(
      "Belum ada soal untuk mata pelajaran tersebut."
    );

    return;

  }


  // Acak soal

  quizQuestions.sort(
    () =>
      Math.random() - 0.5
  );


  currentQuestion = 0;

  score = 0;


  showScreen(
    "quizScreen"
  );


  renderQuiz();

}


// =====================================================
// RENDER QUIZ
// =====================================================

function renderQuiz() {

  clearInterval(
    timer
  );


  const question =
    quizQuestions[
      currentQuestion
    ];


  if (!question) {

    finishQuiz();

    return;

  }


  $("quizProgress").textContent =
    `Soal ${currentQuestion + 1} dari ${quizQuestions.length}`;


  $("quizSubject").textContent =
    question.subject ||
    "Quiz";


  $("quizQuestion").textContent =
    question.question ||
    "";


  const answers =
    $("quizAnswers");


  answers.innerHTML =
    "";


  const letters = [
    "A",
    "B",
    "C",
    "D"
  ];


  letters.forEach(
    letter => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "answer-btn";


      button.innerHTML =
        `
          <strong>
            ${letter}.
          </strong>

          ${escapeHtml(
            question.answers?.[
              letter
            ] || ""
          )}
        `;


      button.addEventListener(
        "click",
        () => {

          answerQuestion(
            letter
          );

        }
      );


      answers.appendChild(
        button
      );

    }
  );


  startTimer();

}


// =====================================================
// ANSWER
// =====================================================

function answerQuestion(
  answer
) {

  clearInterval(
    timer
  );


  const question =
    quizQuestions[
      currentQuestion
    ];


  if (
    answer ===
    question.correct
  ) {

    score++;

  }


  currentQuestion++;


  if (
    currentQuestion >=
    quizQuestions.length
  ) {

    finishQuiz();

  } else {

    renderQuiz();

  }

}


// =====================================================
// TIMER
// =====================================================

function startTimer() {

  clearInterval(
    timer
  );


  timeLeft = 30;


  $("timer").textContent =
    timeLeft;


  timer =
    setInterval(
      () => {

        timeLeft--;


        $("timer").textContent =
          timeLeft;


        if (
          timeLeft <= 0
        ) {

          clearInterval(
            timer
          );


          currentQuestion++;


          if (
            currentQuestion >=
            quizQuestions.length
          ) {

            finishQuiz();

          } else {

            renderQuiz();

          }

        }

      },
      1000
    );

}


// =====================================================
// FINISH QUIZ
// =====================================================

function finishQuiz() {

  clearInterval(
    timer
  );


  const total =
    quizQuestions.length;


  const nilai =
    total > 0

      ? Math.round(
          (score / total) *
          100
        )

      : 0;


  $("resultScore").textContent =
    nilai;


  $("resultDetail").textContent =
    `${score} dari ${total} jawaban benar`;


  showScreen(
    "resultScreen"
  );

}


// =====================================================
// SETUP EVENT
// =====================================================

function setupEvents() {


  // Admin login

  $("showAdminLogin")
    ?.addEventListener(
      "click",
      () => {

        showScreen(
          "adminLoginScreen"
        );

      }
    );


  // Back admin

  $("backFromAdminLogin")
    ?.addEventListener(
      "click",
      () => {

        showScreen(
          "loginScreen"
        );

      }
    );


  // Student

  $("studentLogin")
    ?.addEventListener(
      "click",
      () => {

        updateSubjectFilter();

        showScreen(
          "studentScreen"
        );

      }
    );


  // Back student

  $("backFromStudent")
    ?.addEventListener(
      "click",
      () => {

        showScreen(
          "loginScreen"
        );

      }
    );


  // Start quiz

  $("startQuiz")
    ?.addEventListener(
      "click",
      startQuiz
    );


  // Quit quiz

  $("quitQuiz")
    ?.addEventListener(
      "click",
      () => {

        clearInterval(
          timer
        );

        showScreen(
          "studentScreen"
        );

      }
    );


  // Result → Home

  $("backToHome")
    ?.addEventListener(
      "click",
      () => {

        showScreen(
          "loginScreen"
        );

      }
    );


  // Admin logout

  $("adminLogout")
    ?.addEventListener(
      "click",
      () => {

        showScreen(
          "loginScreen"
        );

      }
    );


  // Add question

  $("addQuestionButton")
    ?.addEventListener(
      "click",
      openAddQuestion
    );


  // Add IPS

  $("addIPSButton")
    ?.addEventListener(
      "click",
      tambahSoalIPS
    );


  // Close modal

  $("closeModal")
    ?.addEventListener(
      "click",
      closeModal
    );


  // Save question

  $("questionForm")
    ?.addEventListener(
      "submit",
      saveQuestion
    );


  // Close modal clicking outside

  $("questionModal")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          $("questionModal")
        ) {

          closeModal();

        }

      }
    );

}


// =====================================================
// START APPLICATION
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupLoading();

    setupEvents();

    setupAdminLogin();

    initFirebase();

  }
);
