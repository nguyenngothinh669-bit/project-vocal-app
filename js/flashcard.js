let vocabularies = JSON.parse(localStorage.getItem("vocabularies")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let learnedWords = JSON.parse(localStorage.getItem("learnedWords")) || [];

let currentIndex = 0;
let isRevealed = false;
let isAnimating = false;

let touchStartX = 0;
let touchStartY = 0;

const flashcard = document.getElementById("flashcard");
const cardWord = document.getElementById("cardWord");
const cardMeaning = document.getElementById("cardMeaning");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const learnedBtn = document.getElementById("learnedBtn");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const wordList = document.getElementById("wordList");
const categoryFilter = document.getElementById("categoryFilter");
const searchWord = document.getElementById("searchWord");
const sortSelect = document.getElementById("sortSelect");
const voiceBtn = document.getElementById("voiceBtn");
const flashcardFront = flashcard.querySelector(".flashcard-front");


function speakWord(word) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.85;
    utter.pitch = 1;
    voiceBtn.classList.add("speaking");
    utter.onend = () => voiceBtn.classList.remove("speaking");
    utter.onerror = () => voiceBtn.classList.remove("speaking");
    speechSynthesis.speak(utter);
}

const loadCategories = () => {
    categoryFilter.innerHTML =
        `<option value="">All Categories</option>` +
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

loadCategories();



function getFilteredWords() {
    let list = [...vocabularies];
    const category = categoryFilter.value;
    const keyword = searchWord.value.toLowerCase();
    const sortType = sortSelect.value;

    if (category) list = list.filter(v => v.categoryId === category);
    if (keyword) list = list.filter(v => v.word.toLowerCase().includes(keyword));
    if (sortType === "name") list.sort((a, b) => a.word.localeCompare(b.word));
    if (sortType === "time") list.sort((a, b) => Number(b.id) - Number(a.id));

    return list;
}

function hideMeaning() {
    isRevealed = false;

    cardWord.style.transition = "none";
    cardWord.style.opacity = "1";
    cardWord.style.transform = "translateY(0) scale(1)";
    cardWord.style.filter = "blur(0px)";

    cardMeaning.style.transition = "none";
    cardMeaning.style.opacity = "0";
    cardMeaning.style.transform = "translateY(16px) scale(0.95)";

    flashcardFront.classList.remove("revealed");

    learnedBtn.style.opacity = "0";
    learnedBtn.style.pointerEvents = "none";
    learnedBtn.style.transform = "translateY(8px) scale(0.95)";
}


function revealMeaning() {
    if (isAnimating || isRevealed) return;
    isRevealed = true;
    isAnimating = true;

    cardWord.style.transition = "all 0.22s cubic-bezier(0.4,0,0.2,1)";
    cardWord.style.opacity = "0.18";
    cardWord.style.transform = "translateY(-10px) scale(0.92)";
    cardWord.style.filter = "blur(3px)";

    flashcardFront.classList.add("revealed");

    setTimeout(() => {
        cardMeaning.style.transition = "all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)";
        cardMeaning.style.opacity = "1";
        cardMeaning.style.transform = "translateY(0) scale(1)";

        setTimeout(() => {
            learnedBtn.style.transition = "all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)";
            learnedBtn.style.opacity = "1";
            learnedBtn.style.pointerEvents = "auto";
            learnedBtn.style.transform = "translateY(0) scale(1)";
            isAnimating = false;
        }, 100);
    }, 180);
}

function loadWord(word, slideDir) {
    if (isAnimating) return;
    isAnimating = true;

    const exitClass = slideDir === "next" ? "card-exit-left" : "card-exit-right";
    const enterClass = slideDir === "next" ? "card-enter-right" : "card-enter-left";

    flashcardFront.classList.add(exitClass);

    setTimeout(() => {
        cardWord.textContent = word.word;
        cardMeaning.textContent = word.meaning;
        hideMeaning();
        syncLearnedBtn();

        flashcardFront.classList.remove(exitClass);
        flashcardFront.classList.add(enterClass);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                flashcardFront.style.transition = "transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.32s ease";
                flashcardFront.classList.remove(enterClass);

                setTimeout(() => {
                    flashcardFront.style.transition = "";
                    isAnimating = false;
                }, 340);
            });
        });
    }, 260);
}


function syncLearnedBtn() {
    const words = getFilteredWords();
    if (words.length === 0) return;
    const word = words[currentIndex];
    const learned = learnedWords.includes(word.id);

    if (learned) {
        learnedBtn.classList.add("is-learned");
        learnedBtn.innerHTML = `✓ &nbsp;Already Learned`;
    } else {
        learnedBtn.classList.remove("is-learned");
        learnedBtn.innerHTML = `★ &nbsp;Mark as Learned`;
    }
}


function renderCard(slideDir = "next") {
    const words = getFilteredWords();

    if (words.length === 0) {
        cardWord.textContent = "No words available";
        cardMeaning.textContent = "";
        progressText.textContent = "0/0";
        progressFill.style.width = "0%";
        hideMeaning();
        return;
    }

    if (currentIndex >= words.length) currentIndex = words.length - 1;

    const word = words[currentIndex];
    loadWord(word, slideDir);
    updateProgress(words);
}

function updateProgress(words) {
    const learned = words.filter(w => learnedWords.includes(w.id)).length;
    const total = words.length;
    progressText.textContent = `${learned}/${total}`;
    progressFill.style.width = total ? (learned / total * 100) + "%" : "0%";
}


function renderList() {
    const words = getFilteredWords();

    wordList.innerHTML = words.map((w, i) => {
        const learned = learnedWords.includes(w.id);
        const isActive = i === currentIndex;
        return `
        <tr class="${isActive ? "active-row" : ""}" onclick="jumpTo(${i})">
            <td>${w.word}</td>
            <td>${w.meaning}</td>
            <td>
                <span class="status-badge ${learned ? "learned" : "learning"}">
                    ${learned ? "✓ Learned" : "Learning"}
                </span>
            </td>
        </tr>`;
    }).join("");
}

window.jumpTo = function (index) {
    if (isAnimating || index === currentIndex) return;
    const dir = index > currentIndex ? "next" : "prev";
    currentIndex = index;
    renderCard(dir);
    setTimeout(renderList, 320);
};

function showWord() {
    if (isAnimating || !isRevealed) return;
    isRevealed = false;
    isAnimating = true;

    cardMeaning.style.transition = "all 0.22s cubic-bezier(0.4,0,0.2,1)";
    cardMeaning.style.opacity = "0";
    cardMeaning.style.transform = "translateY(16px) scale(0.95)";

    learnedBtn.style.transition = "all 0.18s ease";
    learnedBtn.style.opacity = "0";
    learnedBtn.style.pointerEvents = "none";
    learnedBtn.style.transform = "translateY(8px) scale(0.95)";

    flashcardFront.classList.remove("revealed");
    setTimeout(() => {
        cardWord.style.transition = "all 0.3s cubic-bezier(0.34,1.56,0.64,1)";
        cardWord.style.opacity = "1";
        cardWord.style.transform = "translateY(-50%) scale(1)";
        cardWord.style.filter = "blur(0px)";
        setTimeout(() => { isAnimating = false; }, 320);
    }, 150);
}

flashcard.addEventListener("click", () => {
    const words = getFilteredWords();
    if (words.length === 0) return;

    if (!isRevealed) {
        revealMeaning();
    } else {
        showWord();
    }
});

nextBtn.addEventListener("click", () => {
    if (isAnimating) return;
    const words = getFilteredWords();
    if (currentIndex < words.length - 1) {
        currentIndex++;
        renderCard("next");
        setTimeout(renderList, 320);
    } else {
        flashcardFront.classList.add("shake");
        setTimeout(() => flashcardFront.classList.remove("shake"), 500);
    }
});

prevBtn.addEventListener("click", () => {
    if (isAnimating) return;
    if (currentIndex > 0) {
        currentIndex--;
        renderCard("prev");
        setTimeout(renderList, 320);
    } else {
        flashcardFront.classList.add("shake");
        setTimeout(() => flashcardFront.classList.remove("shake"), 500);
    }
});

learnedBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const words = getFilteredWords();
    if (words.length === 0) return;

    const word = words[currentIndex];
    const learned = learnedWords.includes(word.id);

    if (!learned) {
        learnedWords.push(word.id);
        localStorage.setItem("learnedWords", JSON.stringify(learnedWords));
        triggerConfetti(learnedBtn);
    }

    syncLearnedBtn();
    updateProgress(words);
    renderList();

    if (!learned && currentIndex < words.length - 1) {
        setTimeout(() => {
            currentIndex++;
            renderCard("next");
            setTimeout(renderList, 320);
        }, 750);
    }
});

voiceBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const words = getFilteredWords();
    if (words.length === 0) return;
    speakWord(words[currentIndex].word);
});


flashcard.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

flashcard.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 44) return;
    if (dx < -44) nextBtn.click();
    if (dx > 44) prevBtn.click();
}, { passive: true });


function triggerConfetti(el) {
    const colors = ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#f97316"];
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 22; i++) {
        const dot = document.createElement("div");
        dot.className = "confetti-dot";
        const angle = (i / 22) * Math.PI * 2;
        const dist = 50 + Math.random() * 60;
        dot.style.cssText = `
            left: ${cx}px; top: ${cy}px;
            background: ${colors[i % colors.length]};
            width: ${4 + Math.random() * 6}px;
            height: ${4 + Math.random() * 6}px;
            border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
            --tx: ${Math.cos(angle) * dist}px;
            --ty: ${Math.sin(angle) * dist - 40}px;
            --rot: ${Math.random() * 540}deg;
        `;
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 900);
    }
}

searchWord.addEventListener("input", () => {
    currentIndex = 0; renderCard("next"); renderList();
});
categoryFilter.addEventListener("change", () => {
    currentIndex = 0; renderCard("next"); renderList();
});
sortSelect.addEventListener("change", () => {
    currentIndex = 0; renderCard("next"); renderList();
});



document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") { e.preventDefault(); flashcard.click(); }
    if (e.code === "ArrowRight") nextBtn.click();
    if (e.code === "ArrowLeft") prevBtn.click();
    if (e.code === "KeyL") learnedBtn.click();
    if (e.code === "KeyV") voiceBtn.click();
});


cardMeaning.style.opacity = "0";
cardMeaning.style.transform = "translateY(16px) scale(0.95)";
learnedBtn.style.opacity = "0";
learnedBtn.style.pointerEvents = "none";
learnedBtn.style.transform = "translateY(8px) scale(0.95)";

renderCard("next");
renderList();