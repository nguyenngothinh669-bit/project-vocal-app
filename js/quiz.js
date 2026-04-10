let vocabularies = JSON.parse(localStorage.getItem("vocabularies")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];

let questions = [];
let answers = [];
let currentIdx = 0;
let selectedCount = 10;   
let histOpen = false;

const categoryFilter = document.getElementById("categoryFilter");
const startQuizBtn = document.getElementById("startQuizBtn");
const configCard = document.getElementById("configCard");

const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const scoreBox = document.getElementById("scoreBox");
const scorePct = document.getElementById("scorePct");
const scoreMsg = document.getElementById("scoreMsg");
const scoreEmoji = document.getElementById("scoreEmoji");
const metaTotal = document.getElementById("metaTotal");
const metaCorrect = document.getElementById("metaCorrect");
const metaWrong = document.getElementById("metaWrong");
const retryBtn = document.getElementById("retryBtn");
const newQuizBtn = document.getElementById("newQuizBtn");

const questionCard = document.getElementById("questionCard");
const qBadge = document.getElementById("qBadge");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const feedbackRow = document.getElementById("feedbackRow");
const fbIcon = document.getElementById("fbIcon");
const fbText = document.getElementById("fbText");

const quizNav = document.getElementById("quizNav");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
const historyCollapse = document.getElementById("historyCollapse");
const historyTable = document.getElementById("historyTable");
const historyRows = document.getElementById("historyRows");
const historyEmpty = document.getElementById("historyEmpty");

(function init() {
    loadCategories();
    renderHistory();
    updateCountChips();
})();

function loadCategories() {
    categoryFilter.innerHTML =
        `<option value="">All Categories</option>` +
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    categoryFilter.addEventListener("change", updateCountChips);
}

window.selectCount = function (el) {
    if (el.disabled) return;
    document.querySelectorAll(".count-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    selectedCount = parseInt(el.dataset.val);
};

function updateCountChips() {
    const catId = categoryFilter.value;
    let pool = [...vocabularies];
    if (catId) pool = pool.filter(v => v.categoryId === catId);

    const available = pool.length;

    document.querySelectorAll(".count-chip").forEach(chip => {
        const val = parseInt(chip.dataset.val);
        if (val > available) {
            chip.disabled = true;
            chip.classList.add("disabled-chip");
            chip.classList.remove("active");
            chip.title = `Not enough words (only ${available} available)`;
        } else {
            chip.disabled = false;
            chip.classList.remove("disabled-chip");
            chip.title = "";
        }
    });
    const activeChip = document.querySelector(".count-chip.active");
    if (!activeChip || activeChip.disabled) {
        const validChips = [...document.querySelectorAll(".count-chip:not([disabled])")];
        if (validChips.length) {
            document.querySelectorAll(".count-chip").forEach(c => c.classList.remove("active"));
            const best = validChips.reduce((a, b) =>
                parseInt(a.dataset.val) > parseInt(b.dataset.val) ? a : b
            );
            best.classList.add("active");
            selectedCount = parseInt(best.dataset.val);
        }
    }
}

function buildQuiz() {
    const catId = categoryFilter.value;
    let pool = [...vocabularies];
    if (catId) pool = pool.filter(v => v.categoryId === catId);

    if (pool.length < 2) {
        showToast({ type: 'warning', title: 'Not enough words', desc: 'Please add at least 2 words to start.' });
        return false;
    }

    const limit = Math.min(selectedCount, 10, pool.length);

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, limit);

    questions = selected.map(item => {
        const wrongs = pool
            .filter(v => v.id !== item.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(v => v.meaning);

        const insertAt = Math.floor(Math.random() * (wrongs.length + 1));
        const opts = [...wrongs];
        opts.splice(insertAt, 0, item.meaning);

        return {
            word: item.word,
            meaning: item.meaning,
            options: opts,
            correctIndex: insertAt
        };
    });

    answers = new Array(questions.length).fill(null);
    currentIdx = 0;
    return true;
}

startQuizBtn.addEventListener("click", () => {
    if (!buildQuiz()) return;

    startQuizBtn.textContent = "Restart";

    scoreBox.classList.remove("show");
    questionCard.classList.add("show");
    quizNav.classList.add("show");
    progressWrap.classList.add("show");
    configCard.style.opacity = "0.5";
    configCard.style.pointerEvents = "none";

    renderQuestion();
});

function renderQuestion() {
    const q = questions[currentIdx];

    qBadge.textContent = `Question ${currentIdx + 1} of ${questions.length}`;

    progressLabel.textContent = `${currentIdx + 1}/${questions.length}`;
    progressFill.style.width = `${(currentIdx / questions.length) * 100}%`;

    questionText.innerHTML =
        `What is the meaning of <span class="word-highlight">"${q.word}"</span>?`;

    const labels = ["A", "B", "C", "D"];
    optionsList.innerHTML = q.options.map((opt, i) => `
        <button class="opt-btn ${getOptionClass(i)}"
                data-index="${i}"
                ${answers[currentIdx] !== null ? "disabled" : ""}>
            <span class="opt-key">${labels[i]}</span>
            ${opt}
        </button>
    `).join("");

    optionsList.querySelectorAll(".opt-btn").forEach(btn => {
        btn.addEventListener("click", () => handleAnswer(parseInt(btn.dataset.index)));
    });

    renderFeedback();

    prevBtn.disabled = currentIdx === 0;
    nextBtn.textContent = currentIdx === questions.length - 1 ? "Finish ✓" : "Next →";
}

function getOptionClass(i) {
    const chosen = answers[currentIdx];
    if (chosen === null) return "";
    if (i === questions[currentIdx].correctIndex) return "correct";
    if (i === chosen && chosen !== questions[currentIdx].correctIndex) return "wrong";
    return "";
}

function renderFeedback() {
    const chosen = answers[currentIdx];
    if (chosen === null) { feedbackRow.className = "feedback-row"; return; }

    const isCorrect = chosen === questions[currentIdx].correctIndex;
    feedbackRow.className = `feedback-row show ${isCorrect ? "fb-correct" : "fb-wrong"}`;
    fbIcon.textContent = isCorrect ? "✅" : "❌";
    fbText.textContent = isCorrect
        ? "Correct! Well done."
        : `Wrong! Correct answer: "${questions[currentIdx].options[questions[currentIdx].correctIndex]}"`;
}

function handleAnswer(chosenIdx) {
    if (answers[currentIdx] !== null) return;
    answers[currentIdx] = chosenIdx;

    optionsList.querySelectorAll(".opt-btn").forEach((btn, i) => {
        btn.disabled = true;
        if (i === questions[currentIdx].correctIndex) btn.classList.add("correct");
        else if (i === chosenIdx) btn.classList.add("wrong");
    });

    renderFeedback();

    const answered = answers.filter(a => a !== null).length;
    progressFill.style.width = `${(answered / questions.length) * 100}%`;

    if (currentIdx < questions.length - 1) {
        setTimeout(() => { currentIdx++; renderQuestion(); }, 950);
    }
}

prevBtn.addEventListener("click", () => {
    if (currentIdx > 0) { currentIdx--; renderQuestion(); }
});

nextBtn.addEventListener("click", () => {
    if (currentIdx < questions.length - 1) { currentIdx++; renderQuestion(); }
    else finishQuiz();
});

function finishQuiz() {
    const total = questions.length;
    const correct = answers.filter((a, i) => a !== null && a === questions[i].correctIndex).length;
    const wrong = total - correct;
    const pct = Math.round((correct / total) * 100);

    questionCard.classList.remove("show");
    quizNav.classList.remove("show");
    progressWrap.classList.remove("show");
    scoreBox.classList.add("show");

    scorePct.textContent = `${pct}%`;
    metaTotal.textContent = total;
    metaCorrect.textContent = correct;
    metaWrong.textContent = wrong;
    scoreEmoji.textContent = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 50 ? "👍" : "📚";
    scoreMsg.textContent = pct === 100 ? "Perfect Score! You're amazing!"
        : pct >= 80 ? "Great job! Keep it up."
            : pct >= 50 ? "Good effort! Keep practicing."
                : "Keep studying! You'll improve.";

    if (pct >= 70) triggerConfetti();

    const catName = categoryFilter.value
        ? (categories.find(c => c.id === categoryFilter.value)?.name || "Unknown")
        : "All Categories";

    quizHistory.unshift({
        date: new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }),
        category: catName,
        score: `${correct}/${total}`,
        pct
    });

    if (quizHistory.length > 50) quizHistory.pop();
    localStorage.setItem("quizHistory", JSON.stringify(quizHistory));
    renderHistory();

    // CẬP NHẬT: Gọi hàm showToast theo chuẩn UI mới
    showToast({ 
        type: pct >= 60 ? "success" : "info", 
        title: "Quiz Complete!", 
        desc: `Your score is ${pct}%` 
    });
}

retryBtn.addEventListener("click", () => {
    if (!buildQuiz()) return;
    scoreBox.classList.remove("show");
    questionCard.classList.add("show");
    quizNav.classList.add("show");
    progressWrap.classList.add("show");
    renderQuestion();
});

newQuizBtn.addEventListener("click", () => {
    scoreBox.classList.remove("show");
    questionCard.classList.remove("show");
    quizNav.classList.remove("show");
    progressWrap.classList.remove("show");
    configCard.style.opacity = "1";
    configCard.style.pointerEvents = "auto";
    startQuizBtn.textContent = "Start Quiz";
    updateCountChips();
});

toggleHistoryBtn.addEventListener("click", () => {
    histOpen = !histOpen;
    historyCollapse.classList.toggle("open", histOpen);
    document.getElementById("toggleArrow").textContent = histOpen ? "▲" : "▼";
    document.getElementById("toggleLabel").textContent = histOpen ? "Hide History" : "Show History";
});

function renderHistory() {
    if (!quizHistory.length) {
        historyTable.style.display = "none";
        historyEmpty.style.display = "block";
        return;
    }

    historyEmpty.style.display = "none";
    historyTable.style.display = "";

    historyRows.innerHTML = quizHistory.map(r => {
        const cls = r.pct >= 80 ? "high" : r.pct >= 50 ? "mid" : "low";
        const emoji = r.pct >= 80 ? "🌟" : r.pct >= 50 ? "👍" : "📚";
        return `
        <tr>
            <td>${r.date}</td>
            <td>${r.category}</td>
            <td><strong>${r.score}</strong></td>
            <td><span class="score-pill ${cls}">${emoji} ${r.pct}%</span></td>
        </tr>`;
    }).join("");
}

function triggerConfetti() {
    const colors = ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899"];
    const cx = window.innerWidth / 2;
    const cy = 200;
    for (let i = 0; i < 36; i++) {
        const dot = document.createElement("div");
        dot.className = "confetti-dot";
        const angle = (i / 36) * Math.PI * 2;
        const dist = 70 + Math.random() * 100;
        dot.style.cssText = `
            left:${cx}px; top:${cy}px;
            background:${colors[i % colors.length]};
            width:${5 + Math.random() * 6}px; height:${5 + Math.random() * 6}px;
            border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
            --tx:${Math.cos(angle) * dist}px;
            --ty:${Math.sin(angle) * dist - 50}px;
            --rot:${Math.random() * 540}deg;
        `;
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 1000);
    }
}

const style = document.createElement("style");
style.textContent = `
    .count-chip.disabled-chip {
        opacity: 0.35;
        cursor: not-allowed;
        border-style: dashed;
    }
    .count-chip.disabled-chip:hover {
        border-color: var(--border);
        background: #f8fafc;
        color: var(--text-secondary);
        transform: none;
    }
`;
document.head.appendChild(style);