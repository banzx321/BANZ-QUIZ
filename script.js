// =====================================================
// BANZ QUIZ - SCRIPT.JS
// Loading + Firebase + Admin + Quiz + Soal IPS
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
  apiKey: "MASUKKAN_API_KEY",
  authDomain: "PROJECT-ID.firebaseapp.com",
  databaseURL: "https://PROJECT-ID-default-rtdb.firebaseio.com",
  projectId: "PROJECT-ID",
  storageBucket: "PROJECT-ID.appspot.com",
  messagingSenderId: "MESSAGING-SENDER-ID",
  appId: "APP-ID"
};


// =====================================================
// FIREBASE INITIALIZE
// =====================================================

let app = null;
let database = null;
let questionsRef = null;

try {

  app = initializeApp(firebaseConfig);

  database = getDatabase(app);

  questionsRef = ref(database, "questions");

  console.log("Firebase berhasil diinisialisasi.");

} catch (error) {

  console.error(
    "Firebase gagal diinisialisasi:",
    error
  );

}


// =====================================================
// VARIABEL
// =====================================================

let questions = [];

let currentQuestion = 0;

let score = 0;

let selectedSubject = "Semua";

let timer = null;

let timeLeft = 30;


// =====================================================
// LOADING SCREEN
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const loadingScreen =
      document.getElementById(
        "loadingScreen"
      );

    const introVideo =
      document.getElementById(
        "introVideo"
      );

    const skipLoading =
      document.getElementById(
        "skipLoading"
      );


    // ---------------------------------------------
    // Fungsi selesai loading
    // ---------------------------------------------

    function selesaiLoading() {

      if (!loadingScreen) {
        return;
      }

      loadingScreen.classList.add(
        "hidden"
      );

      console.log(
        "Loading screen selesai."
      );

    }


    // ---------------------------------------------
    // Tombol Skip
    // ---------------------------------------------

    if (skipLoading) {

      skipLoading.addEventListener(
        "click",
        selesaiLoading
      );

    }


    // ---------------------------------------------
    // Video selesai
    // ---------------------------------------------

    if (introVideo) {

      introVideo.addEventListener(
        "ended",
        selesaiLoading
      );


      // -------------------------------------------
      // Jika video gagal
      // -------------------------------------------

      introVideo.addEventListener(
        "error",
        () => {

          console.warn(
            "Video loading gagal."
          );

          selesaiLoading();

        }
      );

    }


    // ---------------------------------------------
    // Pengaman
    // Loading maksimal 5 detik
    // ---------------------------------------------

    setTimeout(
      selesaiLoading,
      5000
    );

  }
);


// =====================================================
// AMBIL SOAL DARI FIREBASE
// =====================================================

if (questionsRef) {

  onValue(

    questionsRef,

    (snapshot) => {

      const data =
        snapshot.val();


      // -------------------------------------------
      // Tidak ada soal
      // -------------------------------------------

      if (!data) {

        questions = [];

        console.log(
          "Database belum memiliki soal."
        );

      }

      // -------------------------------------------
      // Ada soal
      // -------------------------------------------

      else {

        questions =
          Object.entries(data).map(
            ([id, question]) => ({

              id,

              ...question

            })
          );

      }


      console.log(
        "Jumlah soal:",
        questions.length
      );


      // -------------------------------------------
      // Update statistik admin
      // -------------------------------------------

      if (
        typeof updateAdminStats ===
        "function"
      ) {

        updateAdminStats();

      }


      // -------------------------------------------
      // Update filter
      // -------------------------------------------

      if (
        typeof updateSubjectFilter ===
        "function"
      ) {

        updateSubjectFilter();

      }

    },


    // ---------------------------------------------
    // Firebase error
    // ---------------------------------------------

    (error) => {

      console.error(
        "Firebase Database Error:",
        error
      );

      // Jangan sampai Firebase error
      // membuat website stuck

      questions = [];

    }

  );

}


// =====================================================
// SOAL IPS
// =====================================================

async function tambahSoalIPS() {

  if (!questionsRef) {

    console.error(
      "Firebase belum tersedia."
    );

    return;

  }


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

      correct: "B"

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

      correct: "A"

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

      correct: "C"

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

      correct: "A"

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

      correct: "C"

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

      correct: "B"

    },


    {
      subject:
        "IPS - Keuangan dan Lembaga Keuangan",

      question:
        "Kegiatan bank memberikan pinjaman kepada masyarakat disebut...",

      answers: {

        A: "Menghimpun dana",

        B: "Menyalurkan kredit",

        C: "Mencetak uang",

        D: "Menjual saham"

      },

      correct: "B"

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

      correct: "C"

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

      correct: "A"

    },


    {
      subject:
        "IPS - Keuangan dan Lembaga Keuangan",

      question:
        "OJK merupakan singkatan dari...",

      answers: {

        A: "Organisasi Jasa Keuangan",

        B: "Otoritas Jasa Keuangan",

        C: "Organisasi Jaminan Keuangan",

        D: "Otoritas Jaminan Kredit"

      },

      correct: "B"

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

      correct: "A"

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

      correct: "C"

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

      correct: "C"

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

      correct: "B"

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

      correct: "B"

    }

  ];


  try {

    // -------------------------------------------
    // Cek apakah database sudah ada isinya
    // -------------------------------------------

    if (questions.length > 0) {

      console.log(
        "Soal sudah ada. Tidak menambahkan ulang."
      );

      return;

    }


    // -------------------------------------------
    // Tambahkan soal
    // -------------------------------------------

    for (
      const soal of soalIPS
    ) {

      const soalBaru =
        push(questionsRef);


      await set(
        soalBaru,
        {

          ...soal,

          createdAt:
            Date.now()

        }
      );

    }


    console.log(
      "15 soal IPS berhasil ditambahkan."
    );


  } catch (error) {

    console.error(
      "Gagal menambahkan soal IPS:",
      error
    );

  }

}


// =====================================================
// ADMIN LOGIN
// =====================================================

const ADMIN_USERNAME = "admin";

const ADMIN_PASSWORD =
  "GANTI_PASSWORD_ADMIN";


function loginAdmin(
  username,
  password
) {

  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {

    const loginScreen =
      document.getElementById(
        "loginScreen"
      );

    const adminScreen =
      document.getElementById(
        "adminScreen"
      );


    if (loginScreen) {

      loginScreen.classList.add(
        "hidden"
      );

    }


    if (adminScreen) {

      adminScreen.classList.remove(
        "hidden"
      );

    }


    return true;

  }


  alert(
    "Username atau password admin salah."
  );


  return false;

}


// =====================================================
// TAMBAH SOAL DARI ADMIN
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

  if (!questionsRef) {

    alert(
      "Firebase belum terhubung."
    );

    return;

  }


  try {

    const soalBaru =
      push(questionsRef);


    await set(
      soalBaru,
      {

        subject,

        question,

        answers: {

          A,

          B,

          C,

          D

        },

        correct,

        createdAt:
          Date.now()

      }
    );


    alert(
      "Soal berhasil ditambahkan!"
    );


  } catch (error) {

    console.error(error);

    alert(
      "Gagal menambahkan soal."
    );

  }

}


// =====================================================
// HAPUS SOAL
// =====================================================

async function hapusSoal(id) {

  if (
    !confirm(
      "Yakin ingin menghapus soal ini?"
    )
  ) {

    return;

  }


  try {

    await remove(
      ref(
        database,
        `questions/${id}`
      )
    );


    alert(
      "Soal berhasil dihapus."
    );


  } catch (error) {

    console.error(error);

    alert(
      "Gagal menghapus soal."
    );

  }

}


// =====================================================
// EDIT SOAL
// =====================================================

async function editSoal(
  id,
  data
) {

  try {

    await update(
      ref(
        database,
        `questions/${id}`
      ),
      data
    );


    alert(
      "Soal berhasil diperbarui."
    );


  } catch (error) {

    console.error(error);

    alert(
      "Gagal memperbarui soal."
    );

  }

}


// =====================================================
// STATISTIK ADMIN
// =====================================================

function updateAdminStats() {

  const totalSoal =
    document.getElementById(
      "totalQuestions"
    );


  if (totalSoal) {

    totalSoal.textContent =
      questions.length;

  }

}


// =====================================================
// FILTER MATA PELAJARAN
// =====================================================

function updateSubjectFilter() {

  const filter =
    document.getElementById(
      "subjectFilter"
    );


  if (!filter) {

    return;

  }


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

      filter.innerHTML +=
        `
          <option value="${subject}">
            ${subject}
          </option>
        `;

    }
  );

}


// =====================================================
// MULAI QUIZ
// =====================================================

window.mulaiQuiz =
  function(subject = "Semua") {

    selectedSubject =
      subject;


    currentQuestion = 0;

    score = 0;


    const loginScreen =
      document.getElementById(
        "loginScreen"
      );

    const adminScreen =
      document.getElementById(
        "adminScreen"
      );

    const quizScreen =
      document.getElementById(
        "quizScreen"
      );

    const resultScreen =
      document.getElementById(
        "resultScreen"
      );


    if (loginScreen) {

      loginScreen.classList.add(
        "hidden"
      );

    }


    if (adminScreen) {

      adminScreen.classList.add(
        "hidden"
      );

    }


    if (resultScreen) {

      resultScreen.classList.add(
        "hidden"
      );

    }


    if (quizScreen) {

      quizScreen.classList.remove(
        "hidden"
      );

    }


    renderQuiz();

  };


// =====================================================
// RENDER QUIZ
// =====================================================

function renderQuiz() {

  const quizScreen =
    document.getElementById(
      "quizScreen"
    );


  if (!quizScreen) {

    return;

  }


  const filteredQuestions =
    selectedSubject === "Semua"

      ? questions

      : questions.filter(
          q =>
            q.subject ===
            selectedSubject
        );


  if (
    filteredQuestions.length === 0
  ) {

    quizScreen.innerHTML =
      `
        <div class="quiz-card">

          <h2>
            Belum ada soal.
          </h2>

          <p>
            Admin belum menambahkan soal.
          </p>

        </div>
      `;

    return;

  }


  const soal =
    filteredQuestions[
      currentQuestion
    ];


  if (!soal) {

    return;

  }


  quizScreen.innerHTML =
    `

      <div class="quiz-card">

        <div class="quiz-header">

          <span>
            Soal
            ${currentQuestion + 1}
            dari
            ${filteredQuestions.length}
          </span>

          <span id="timer">
            30
          </span>

        </div>


        <h2>
          ${soal.question}
        </h2>


        <div class="answers">

          ${Object.entries(
            soal.answers || {}
          )
            .map(
              ([key, value]) =>

                `

                  <button
                    class="answer-btn"
                    onclick="jawabSoal('${key}')"
                  >

                    <strong>
                      ${key}.
                    </strong>

                    ${value}

                  </button>

                `
            )
            .join("")}

        </div>

      </div>

    `;


  mulaiTimer();

}


// =====================================================
// JAWAB SOAL
// =====================================================

window.jawabSoal =
  function(jawaban) {

    clearInterval(timer);


    const filteredQuestions =
      selectedSubject === "Semua"

        ? questions

        : questions.filter(
            q =>
              q.subject ===
              selectedSubject
          );


    const soal =
      filteredQuestions[
        currentQuestion
      ];


    if (!soal) {

      return;

    }


    if (
      jawaban ===
      soal.correct
    ) {

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

  clearInterval(timer);


  timeLeft = 30;


  timer =
    setInterval(
      () => {

        timeLeft--;


        const timerElement =
          document.getElementById(
            "timer"
          );


        if (timerElement) {

          timerElement.textContent =
            timeLeft;

        }


        if (
          timeLeft <= 0
        ) {

          clearInterval(timer);


          currentQuestion++;


          const filteredQuestions =
            selectedSubject === "Semua"

              ? questions

              : questions.filter(
                  q =>
                    q.subject ===
                    selectedSubject
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

      },

      1000

    );

}


// =====================================================
// HASIL QUIZ
// =====================================================

function tampilkanHasil() {

  clearInterval(timer);


  const quizScreen =
    document.getElementById(
      "quizScreen"
    );

  const resultScreen =
    document.getElementById(
      "resultScreen"
    );


  if (quizScreen) {

    quizScreen.classList.add(
      "hidden"
    );

  }


  if (!resultScreen) {

    return;

  }


  resultScreen.classList.remove(
    "hidden"
  );


  const filteredQuestions =
    selectedSubject === "Semua"

      ? questions

      : questions.filter(
          q =>
            q.subject ===
            selectedSubject
        );


  const total =
    filteredQuestions.length;


  const nilai =
    total > 0

      ? Math.round(
          (score / total) *
          100
        )

      : 0;


  resultScreen.innerHTML =
    `

      <div class="result-card">

        <h1>
          Quiz Selesai!
        </h1>

        <p>
          Jawaban benar:
        </p>

        <h2>
          ${score} / ${total}
        </h2>

        <p>
          Nilai kamu:
        </p>

        <h1>
          ${nilai}
        </h1>

        <button
          onclick="location.reload()"
        >
          Kembali
        </button>

      </div>

    `;

}


// =====================================================
// EXPORT KE WINDOW
// =====================================================

window.loginAdmin =
  loginAdmin;

window.tambahSoal =
  tambahSoal;

window.hapusSoal =
  hapusSoal;

window.editSoal =
  editSoal;

window.tambahSoalIPS =
  tambahSoalIPS;


// =====================================================
// AUTO TAMBAH SOAL IPS
// =====================================================
//
// Sengaja TIDAK dipanggil otomatis di sini.
//
// Setelah Firebase sudah benar dan website sudah
// bisa dibuka, abang bisa jalankan dari console:
//
// tambahSoalIPS();
//
// Jalankan SATU KALI saja.
// =====================================================
