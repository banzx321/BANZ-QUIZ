// =====================================================
// BANZ QUIZ - SCRIPT.JS
// Firebase Realtime Database + Soal IPS
// =====================================================

import { initializeApp } from
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

const firebaseConfig = {
  apiKey: "AIza...",
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
// VARIABEL
// =====================================================

let questions = [];

let currentQuestion = 0;
let score = 0;
let selectedSubject = "Semua";

let timer;
let timeLeft = 30;


// =====================================================
// ELEMENT HTML
// =====================================================

const introScreen = document.getElementById("introScreen");
const loginScreen = document.getElementById("loginScreen");
const adminScreen = document.getElementById("adminScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");


// =====================================================
// FIREBASE REALTIME LISTENER
// =====================================================

onValue(questionsRef, async (snapshot) => {

  const data = snapshot.val();

  if (!data) {

    questions = [];

    // Database kosong → masukkan soal IPS
    await tambahSoalIPS();

  } else {

    questions = Object.entries(data).map(([id, question]) => ({
      id,
      ...question
    }));

  }

  console.log("Jumlah soal:", questions.length);

  updateAdminStats();
  updateSubjectFilter();

  if (
    quizScreen &&
    !quizScreen.classList.contains("hidden")
  ) {
    renderQuiz();
  }

});


// =====================================================
// SOAL IPS
// =====================================================

async function tambahSoalIPS() {

  const soalIPS = [

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Apa yang dimaksud dengan uang?",
      answers: {
        A: "Alat untuk memenuhi kebutuhan manusia",
        B: "Alat pembayaran yang sah dan diterima masyarakat",
        C: "Barang yang hanya digunakan untuk ditabung",
        D: "Surat berharga milik pemerintah"
      },
      correct: "B"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Lembaga yang bertugas menghimpun dana dari masyarakat dan menyalurkannya kembali dalam bentuk kredit disebut...",
      answers: {
        A: "Bank",
        B: "Pasar modal",
        C: "Pegadaian",
        D: "Perusahaan asuransi"
      },
      correct: "A"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Bank Indonesia merupakan...",
      answers: {
        A: "Bank umum",
        B: "Bank swasta",
        C: "Bank sentral",
        D: "Bank perkreditan rakyat"
      },
      correct: "C"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Salah satu fungsi utama bank adalah...",
      answers: {
        A: "Menghimpun dan menyalurkan dana",
        B: "Menjual kebutuhan pokok",
        C: "Memproduksi barang",
        D: "Mengelola perusahaan"
      },
      correct: "A"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Simpanan yang penarikannya dapat dilakukan menggunakan cek atau bilyet giro disebut...",
      answers: {
        A: "Deposito",
        B: "Tabungan",
        C: "Giro",
        D: "Saham"
      },
      correct: "C"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Simpanan di bank yang penarikannya dilakukan sesuai jangka waktu tertentu disebut...",
      answers: {
        A: "Giro",
        B: "Deposito",
        C: "Cek",
        D: "Kredit"
      },
      correct: "B"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Kegiatan bank memberikan pinjaman kepada masyarakat disebut...",
      answers: {
        A: "Menghimpun dana",
        B: "Menyalurkan kredit",
        C: "Mencetak uang",
        D: "Menjual saham"
      },
      correct: "B"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Lembaga yang memberikan perlindungan terhadap risiko tertentu dengan pembayaran premi disebut...",
      answers: {
        A: "Pegadaian",
        B: "Koperasi",
        C: "Perusahaan asuransi",
        D: "Pasar modal"
      },
      correct: "C"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Pegadaian memberikan pinjaman dengan jaminan berupa...",
      answers: {
        A: "Barang berharga",
        B: "Nilai rapor",
        C: "Kartu pelajar",
        D: "Surat izin sekolah"
      },
      correct: "A"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "OJK merupakan singkatan dari...",
      answers: {
        A: "Organisasi Jasa Keuangan",
        B: "Otoritas Jasa Keuangan",
        C: "Organisasi Jaminan Keuangan",
        D: "Otoritas Jaminan Kredit"
      },
      correct: "B"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Salah satu tugas OJK adalah...",
      answers: {
        A: "Mengawasi sektor jasa keuangan",
        B: "Mencetak semua uang rupiah",
        C: "Menentukan harga barang di pasar",
        D: "Membuat undang-undang negara"
      },
      correct: "A"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Lembaga yang menjamin simpanan nasabah bank disebut...",
      answers: {
        A: "OJK",
        B: "BI",
        C: "LPS",
        D: "BPK"
      },
      correct: "C"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Koperasi yang kegiatan utamanya memberikan pinjaman dan menerima simpanan anggota disebut...",
      answers: {
        A: "Koperasi produksi",
        B: "Koperasi konsumsi",
        C: "Koperasi simpan pinjam",
        D: "Koperasi jasa"
      },
      correct: "C"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Tempat bertemunya pihak yang membutuhkan dana dengan pihak yang memiliki dana melalui perdagangan efek disebut...",
      answers: {
        A: "Pasar tradisional",
        B: "Pasar modal",
        C: "Pasar barang",
        D: "Pasar tenaga kerja"
      },
      correct: "B"
    },

    {
      subject: "IPS - Keuangan dan Lembaga Keuangan",
      question: "Bukti kepemilikan seseorang terhadap suatu perusahaan disebut...",
      answers: {
        A: "Obligasi",
        B: "Saham",
        C: "Cek",
        D: "Deposito"
      },
      correct: "B"
    }

  ];


  // Jangan tambah jika sudah ada soal
  const snapshot = await new Promise((resolve) => {
    onValue(
      questionsRef,
      resolve,
      { onlyOnce: true }
    );
  });


  if (snapshot.exists()) {
    console.log("Database sudah memiliki soal.");
    return;
  }


  try {

    for (const soal of soalIPS) {

      const soalBaru = push(questionsRef);

      await set(soalBaru, {
        ...soal,
        createdAt: Date.now()
      });

    }

    console.log(
      "15 soal IPS berhasil ditambahkan ke Firebase."
    );

  } catch (error) {

    console.error(
      "Gagal menambahkan soal IPS:",
      error
    );

  }

}


// =====================================================
// ADMIN
// =====================================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";


function loginAdmin(username, password) {

  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {

    if (loginScreen) {
      loginScreen.classList.add("hidden");
    }

    if (adminScreen) {
      adminScreen.classList.remove("hidden");
    }

    return true;
  }

  alert("Username atau password admin salah.");

  return false;
}


// =====================================================
// TAMBAH SOAL ADMIN
// =====================================================

async function tambahSoal(
  subject,
  question,
  A,
  B,
  C,
  D,
  correct
) {

  const soalBaru = push(questionsRef);

  await set(soalBaru, {

    subject: subject,

    question: question,

    answers: {
      A: A,
      B: B,
      C: C,
      D: D
    },

    correct: correct,

    createdAt: Date.now()

  });

  alert("Soal berhasil ditambahkan!");

}


// =====================================================
// HAPUS SOAL
// =====================================================

async function hapusSoal(id) {

  if (!confirm("Hapus soal ini?")) {
    return;
  }

  try {

    await remove(
      ref(database, `questions/${id}`)
    );

    alert("Soal berhasil dihapus.");

  } catch (error) {

    console.error(error);

    alert("Gagal menghapus soal.");

  }

}


// =====================================================
// EDIT SOAL
// =====================================================

async function editSoal(id, data) {

  try {

    await update(
      ref(database, `questions/${id}`),
      data
    );

    alert("Soal berhasil diperbarui.");

  } catch (error) {

    console.error(error);

    alert("Gagal memperbarui soal.");

  }

}


// =====================================================
// STATISTIK ADMIN
// =====================================================

function updateAdminStats() {

  const totalSoal =
    document.getElementById("totalQuestions");

  if (totalSoal) {
    totalSoal.textContent = questions.length;
  }

}


// =====================================================
// FILTER SUBJECT
// =====================================================

function updateSubjectFilter() {

  const filter =
    document.getElementById("subjectFilter");

  if (!filter) {
    return;
  }

  const subjects = [
    ...new Set(
      questions.map(q => q.subject)
    )
  ];

  filter.innerHTML =
    `<option value="Semua">Semua Mata Pelajaran</option>`;

  subjects.forEach(subject => {

    filter.innerHTML +=
      `<option value="${subject}">
        ${subject}
      </option>`;

  });

}


// =====================================================
// TAMPILKAN SOAL QUIZ
// =====================================================

function renderQuiz() {

  if (!quizScreen) {
    return;
  }

  const filteredQuestions =
    selectedSubject === "Semua"
      ? questions
      : questions.filter(
          q => q.subject === selectedSubject
        );


  if (filteredQuestions.length === 0) {

    quizScreen.innerHTML =
      `<p>Belum ada soal.</p>`;

    return;

  }


  const soal =
    filteredQuestions[currentQuestion];


  if (!soal) {
    return;
  }


  quizScreen.innerHTML = `

    <div class="quiz-card">

      <div class="quiz-header">

        <span>
          Soal ${currentQuestion + 1}
          dari ${filteredQuestions.length}
        </span>

        <span id="timer">
          30
        </span>

      </div>


      <h2>
        ${soal.question}
      </h2>


      <div class="answers">

        ${Object.entries(soal.answers)
          .map(([key, value]) => `

            <button
              class="answer-btn"
              onclick="jawabSoal('${key}')"
            >
              <strong>${key}.</strong>
              ${value}
            </button>

          `)
          .join("")}

      </div>

    </div>

  `;


  mulaiTimer();

}


// =====================================================
// JAWAB SOAL
// =====================================================

window.jawabSoal = function(jawaban) {

  clearInterval(timer);


  const filteredQuestions =
    selectedSubject === "Semua"
      ? questions
      : questions.filter(
          q => q.subject === selectedSubject
        );


  const soal =
    filteredQuestions[currentQuestion];


  if (jawaban === soal.correct) {
    score++;
  }


  currentQuestion++;


  if (
    currentQuestion >=
    filteredQuestions.length
  ) {

    tampilkanHasil();

  } else {

    renderQuiz();

  }

};


// =====================================================
// TIMER
// =====================================================

function mulaiTimer() {

  timeLeft = 30;


  clearInterval(timer);


  timer = setInterval(() => {

    timeLeft--;


    const timerElement =
      document.getElementById("timer");


    if (timerElement) {
      timerElement.textContent =
        timeLeft;
    }


    if (timeLeft <= 0) {

      clearInterval(timer);

      currentQuestion++;


      const filteredQuestions =
        selectedSubject === "Semua"
          ? questions
          : questions.filter(
              q => q.subject === selectedSubject
            );


      if (
        currentQuestion >=
        filteredQuestions.length
      ) {

        tampilkanHasil();

      } else {

        renderQuiz();

      }

    }

  }, 1000);

}


// =====================================================
// HASIL QUIZ
// =====================================================

function tampilkanHasil() {

  clearInterval(timer);


  if (quizScreen) {
    quizScreen.classList.add("hidden");
  }


  if (resultScreen) {

    resultScreen.classList.remove("hidden");


    const filteredQuestions =
      selectedSubject === "Semua"
        ? questions
        : questions.filter(
            q => q.subject === selectedSubject
          );


    const nilai =
      filteredQuestions.length > 0
        ? Math.round(
            (score /
              filteredQuestions.length) *
            100
          )
        : 0;


    resultScreen.innerHTML = `

      <div class="result-card">

        <h1>Quiz Selesai!</h1>

        <p>Jawaban benar:</p>

        <h2>
          ${score} / ${filteredQuestions.length}
        </h2>

        <p>Nilai kamu:</p>

        <h1>${nilai}</h1>

        <button
          onclick="location.reload()"
        >
          Kembali
        </button>

      </div>

    `;

  }

}


// =====================================================
// MULAI QUIZ
// =====================================================

window.mulaiQuiz = function(subject = "Semua") {

  selectedSubject = subject;

  currentQuestion = 0;

  score = 0;


  if (loginScreen) {
    loginScreen.classList.add("hidden");
  }


  if (adminScreen) {
    adminScreen.classList.add("hidden");
  }


  if (resultScreen) {
    resultScreen.classList.add("hidden");
  }


  if (quizScreen) {
    quizScreen.classList.remove("hidden");
  }


  renderQuiz();

};


// =====================================================
// EXPORT FUNGSI ADMIN
// =====================================================

window.loginAdmin = loginAdmin;

window.tambahSoal = tambahSoal;

window.hapusSoal = hapusSoal;

window.editSoal = editSoal;

window.tambahSoalIPS = tambahSoalIPS;
