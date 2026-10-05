/* BANZ QUIZ - Supabase Edition
   1) Isi SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY milik project abang.
   2) Jalankan supabase.sql di Supabase SQL Editor.
   3) Buat user admin di Authentication > Users.
*/
const SUPABASE_URL = "https://pvvlyxcyfkqqqoklptqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZMTwk7G1KQYDzrIvjtWA-A_F8qsw-RJ";
  closeModal();

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let questions = [];
let selectedSubject = "";
let quizQuestions = [];
let currentIndex = 0;
let selectedAnswer = null;
let correctCount = 0;
let timerId = null;
let secondsLeft = 30;
let editingId = null;

const $ = (id) => document.getElementById(id);
const screens = ["homeScreen","adminLoginScreen","adminScreen","studentScreen","quizScreen","resultScreen"];

function showScreen(id){
  screens.forEach(x => $(x).classList.toggle("hidden", x !== id));
  window.scrollTo({top:0, behavior:"smooth"});
}

function setMessage(id, text, ok=false){
  const el = $(id);
  el.textContent = text || "";
  el.style.color = ok ? "#16803a" : "";
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function normalizeQuestion(q){
  return {
    id: q.id,
    subject: q.subject,
    question: q.question,
    answers: q.answers,
    correct: q.correct
  };
}

async function loadQuestions(){
  const { data, error } = await db.from("questions")
    .select("id,subject,question,answers,correct,created_at")
    .order("created_at", { ascending: true });

  if(error){
    console.error(error);
    $("dbStatus").textContent = "Error";
    $("publicStatus").textContent = "Database belum siap. Periksa konfigurasi Supabase.";
    return;
  }
  questions = (data || []).map(normalizeQuestion);
  $("dbStatus").textContent = "Online";
  $("publicStatus").textContent = `${questions.length} soal tersedia online.`;
  renderSubjects();
  renderAdminQuestions();
  updateStats();
}

async function init(){
  const bad = SUPABASE_URL.includes("GANTI_") || SUPABASE_PUBLISHABLE_KEY.includes("GANTI_");
  if(bad){
    $("publicStatus").textContent = "Isi SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di script.js terlebih dahulu.";
    return;
  }
  await loadQuestions();
  const { data } = await db.auth.getSession();
  if(data?.session) openAdmin(data.session.user);
}

function updateStats(){
  $("totalQuestions").textContent = questions.length;
  $("totalSubjects").textContent = new Set(questions.map(q => q.subject)).size;
}

function renderSubjects(){
  const list = $("subjectList");
  const grouped = {};
  questions.forEach(q => grouped[q.subject] = (grouped[q.subject] || 0) + 1);
  const entries = Object.entries(grouped);
  if(!entries.length){
    list.innerHTML = `<div class="muted">Belum ada soal.</div>`;
    return;
  }
  list.innerHTML = entries.map(([subject,count]) => `
    <button class="subject-btn" data-subject="${escapeHtml(subject)}">
      📘 ${escapeHtml(subject)}
      <span>${count} soal</span>
    </button>
  `).join("");
  list.querySelectorAll(".subject-btn").forEach(btn => {
    btn.addEventListener("click", () => startQuiz(btn.dataset.subject));
  });
}

function renderAdminQuestions(){
  const search = $("adminSearch")?.value.toLowerCase().trim() || "";
  const filtered = questions.filter(q =>
    `${q.subject} ${q.question}`.toLowerCase().includes(search)
  );
  const list = $("adminQuestionList");
  if(!filtered.length){
    list.innerHTML = `<div class="muted">Tidak ada soal.</div>`;
    return;
  }
  list.innerHTML = filtered.map(q => `
    <div class="question-item">
      <div>
        <h3>${escapeHtml(q.question)}</h3>
        <p>${escapeHtml(q.subject)} • Jawaban benar: ${escapeHtml(q.correct)}</p>
      </div>
      <div class="item-actions">
        <button class="btn secondary small edit-btn" data-id="${q.id}">Edit</button>
        <button class="btn danger small delete-btn" data-id="${q.id}">Hapus</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", () => openEdit(btn.dataset.id))
  );
  list.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => deleteQuestion(btn.dataset.id))
  );
}

function openAdmin(user){
  $("adminEmailLabel").textContent = user.email || "";
  showScreen("adminScreen");
}

async function adminLogin(email,password){
  const { data, error } = await db.auth.signInWithPassword({email,password});
  if(error){
    setMessage("loginMessage", error.message);
    return;
  }
  setMessage("loginMessage", "Login berhasil.", true);
  openAdmin(data.user);
}

async function logout(){
  await db.auth.signOut();
  showScreen("homeScreen");
}

function openAdd(){
  editingId = null;
  $("modalTitle").textContent = "Tambah Soal";
  $("questionForm").reset();
  $("questionId").value = "";
  setMessage("formMessage","");
  $("questionModal").classList.remove("hidden");
}

function openEdit(id){
  const q = questions.find(x => String(x.id) === String(id));
  if(!q) return;
  editingId = q.id;
  $("modalTitle").textContent = "Edit Soal";
  $("questionId").value = q.id;
  $("subject").value = q.subject;
  $("question").value = q.question;
  $("answerA").value = q.answers.A;
  $("answerB").value = q.answers.B;
  $("answerC").value = q.answers.C;
  $("answerD").value = q.answers.D;
  $("correct").value = q.correct;
  setMessage("formMessage","");
  $("questionModal").classList.remove("hidden");
}

function closeModal(){
  $("questionModal").classList.add("hidden");
}

async function saveQuestion(e){
  e.preventDefault();
  const payload = {
    subject: $("subject").value.trim(),
    question: $("question").value.trim(),
    answers: {
      A: $("answerA").value.trim(),
      B: $("answerB").value.trim(),
      C: $("answerC").value.trim(),
      D: $("answerD").value.trim()
    },
    correct: $("correct").value
  };

  if(editingId){
    const { error } = await db.from("questions").update(payload).eq("id", editingId);
    if(error){ setMessage("formMessage", error.message); return; }
  }else{
    const { error } = await db.from("questions").insert(payload);
    if(error){ setMessage("formMessage", error.message); return; }
  }
  closeModal();
  await loadQuestions();
}

async function deleteQuestion(id){
  if(!confirm("Hapus soal ini?")) return;
  const { error } = await db.from("questions").delete().eq("id", id);
  if(error){ alert(error.message); return; }
  await loadQuestions();
}

const soalIPS = [
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Apa yang dimaksud dengan bank?",answers:{A:"Lembaga yang menerima simpanan dan menyalurkan dana",B:"Tempat menjual barang",C:"Lembaga pendidikan",D:"Tempat wisata"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Fungsi utama bank adalah...",answers:{A:"Mencetak semua uang negara",B:"Menghimpun dan menyalurkan dana masyarakat",C:"Menjual saham perusahaan",D:"Mengatur sekolah"},correct:"B"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Bank Indonesia merupakan...",answers:{A:"Bank umum",B:"Bank perkreditan rakyat",C:"Bank sentral",D:"Koperasi"},correct:"C"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Kegiatan bank menghimpun dana masyarakat dapat dilakukan melalui...",answers:{A:"Tabungan",B:"Pajak",C:"Denda",D:"Retribusi"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Simpanan yang penarikannya dapat dilakukan menggunakan cek atau bilyet giro disebut...",answers:{A:"Deposito",B:"Giro",C:"Tabungan pelajar",D:"Saham"},correct:"B"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Deposito adalah simpanan yang...",answers:{A:"Hanya dapat disimpan di rumah",B:"Memiliki jangka waktu tertentu",C:"Tidak menghasilkan bunga",D:"Tidak tercatat"},correct:"B"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Dana yang dipinjamkan bank kepada nasabah disebut...",answers:{A:"Kredit",B:"Pajak",C:"Modal asing",D:"Dividen"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Lembaga yang memberikan perlindungan terhadap risiko melalui pertanggungan adalah...",answers:{A:"Pegadaian",B:"Asuransi",C:"Pasar modal",D:"Koperasi konsumsi"},correct:"B"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Pegadaian memberikan pinjaman dengan dasar...",answers:{A:"Jaminan barang",B:"Nilai rapor",C:"Kartu pelajar saja",D:"Surat undangan"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"OJK merupakan singkatan dari...",answers:{A:"Otoritas Jasa Keuangan",B:"Organisasi Jasa Koperasi",C:"Otoritas Jaminan Kredit",D:"Organisasi Jaminan Keuangan"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Salah satu tugas OJK adalah...",answers:{A:"Mengawasi sektor jasa keuangan",B:"Mencetak uang",C:"Menentukan harga sembako",D:"Membuat undang-undang sendiri"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"LPS berfungsi terutama untuk...",answers:{A:"Menjamin simpanan nasabah bank sesuai ketentuan",B:"Menjual saham",C:"Mengatur pajak",D:"Memberikan SIM"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Koperasi simpan pinjam bergerak dalam kegiatan...",answers:{A:"Simpan dan pinjam",B:"Produksi mobil",C:"Perdagangan saham saja",D:"Penerbangan"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Pasar modal merupakan tempat bertemunya pihak yang membutuhkan dana dengan pihak yang...",answers:{A:"Memiliki dana untuk diinvestasikan",B:"Membutuhkan pekerjaan",C:"Menjual makanan",D:"Membayar pajak"},correct:"A"},
  {subject:"IPS - Bank dan Lembaga Keuangan",question:"Bukti kepemilikan suatu perusahaan disebut...",answers:{A:"Saham",B:"Kuitansi",C:"Cek",D:"Nota"},correct:"A"}
];

async function seedIPS(){
  const { count, error: countError } = await db.from("questions")
    .select("*", {count:"exact", head:true})
    .eq("subject", "IPS - Bank dan Lembaga Keuangan");
  if(countError){ alert(countError.message); return; }
  if(count > 0){
    alert("Soal IPS sudah ada, jadi tidak ditambahkan lagi.");
    return;
  }
  const { error } = await db.from("questions").insert(soalIPS);
  if(error){ alert(error.message); return; }
  await loadQuestions();
  alert("15 soal IPS berhasil ditambahkan.");
}

function startQuiz(subject){
  selectedSubject = subject;
  quizQuestions = questions.filter(q => q.subject === subject).sort(() => Math.random() - .5);
  if(!quizQuestions.length){ alert("Belum ada soal."); return; }
  currentIndex = 0;
  correctCount = 0;
  showScreen("quizScreen");
  renderQuizQuestion();
}

function renderQuizQuestion(){
  clearInterval(timerId);
  const q = quizQuestions[currentIndex];
  selectedAnswer = null;
  $("quizSubject").textContent = q.subject;
  $("quizProgress").textContent = `Soal ${currentIndex + 1} / ${quizQuestions.length}`;
  $("quizQuestion").textContent = q.question;
  $("answerList").innerHTML = Object.entries(q.answers).map(([letter,text]) => `
    <button class="answer" data-answer="${letter}">
      <b>${letter}</b>${escapeHtml(text)}
    </button>
  `).join("");
  $("nextQuestionBtn").disabled = true;
  $("nextQuestionBtn").textContent = currentIndex === quizQuestions.length - 1 ? "Selesai" : "Jawab & Lanjut";

  $("answerList").querySelectorAll(".answer").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedAnswer = btn.dataset.answer;
      $("answerList").querySelectorAll(".answer").forEach(x => x.classList.remove("selected"));
      btn.classList.add("selected");
      $("nextQuestionBtn").disabled = false;
    });
  });

  secondsLeft = 30;
  $("timer").textContent = secondsLeft;
  timerId = setInterval(() => {
    secondsLeft--;
    $("timer").textContent = secondsLeft;
    if(secondsLeft <= 0){
      clearInterval(timerId);
      nextQuestion();
    }
  }, 1000);
}

function nextQuestion(){
  clearInterval(timerId);
  const q = quizQuestions[currentIndex];
  if(selectedAnswer === q.correct) correctCount++;
  currentIndex++;
  if(currentIndex >= quizQuestions.length){
    finishQuiz();
  }else{
    renderQuizQuestion();
  }
}

function finishQuiz(){
  const total = quizQuestions.length;
  const percent = Math.round((correctCount / total) * 100);
  $("resultSubject").textContent = selectedSubject;
  $("resultScore").textContent = `${percent}%`;
  $("resultDetail").textContent = `${correctCount} benar dari ${total} soal.`;
  showScreen("resultScreen");
}

function retryQuiz(){ startQuiz(selectedSubject); }

document.addEventListener("DOMContentLoaded", () => {
  const finishLoading = () => {
    $("loadingScreen").classList.add("hidden");
    $("app").classList.remove("hidden");
  };
  $("skipLoading").addEventListener("click", finishLoading);
  $("introVideo").addEventListener("ended", finishLoading);
  $("introVideo").addEventListener("error", finishLoading);
  setTimeout(finishLoading, 5000);

  $("studentBtn").addEventListener("click", () => { showScreen("studentScreen"); renderSubjects(); });
  $("adminBtn").addEventListener("click", () => showScreen("adminLoginScreen"));
  $("adminLoginForm").addEventListener("submit", e => {
    e.preventDefault();
    adminLogin($("adminEmail").value.trim(), $("adminPassword").value);
  });
  $("logoutBtn").addEventListener("click", logout);
  $("addQuestionBtn").addEventListener("click", openAdd);
  $("seedIpsBtn").addEventListener("click", seedIPS);
  $("closeModal").addEventListener("click", closeModal);
  $("questionForm").addEventListener("submit", saveQuestion);
  $("adminSearch").addEventListener("input", renderAdminQuestions);
  $("nextQuestionBtn").addEventListener("click", nextQuestion);
  $("quitQuizBtn").addEventListener("click", () => { clearInterval(timerId); showScreen("studentScreen"); });
  $("retryBtn").addEventListener("click", retryQuiz);
  $("resultHomeBtn").addEventListener("click", () => showScreen("homeScreen"));

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.back));
  });

  init();
});
