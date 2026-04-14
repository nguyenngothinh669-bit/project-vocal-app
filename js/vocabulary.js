if (!localStorage.getItem("categories")) {
    const categoriesSeed = [
        { id: "c1", name: "Animals" },
        { id: "c2", name: "Food" },
        { id: "c3", name: "Travel" },
        { id: "c4", name: "School" },
        { id: "c5", name: "Technology" }
    ];
    localStorage.setItem("categories", JSON.stringify(categoriesSeed));
}

if (!localStorage.getItem("vocabularies")) {
    const vocabSeed = [
        { id: "v1", word: "dog", meaning: "chó", categoryId: "c1" },
        { id: "v2", word: "cat", meaning: "mèo", categoryId: "c1" },
        { id: "v3", word: "apple", meaning: "táo", categoryId: "c2" },
        { id: "v4", word: "bread", meaning: "bánh mì", categoryId: "c2" },
        { id: "v5", word: "airport", meaning: "sân bay", categoryId: "c3" },
        { id: "v6", word: "ticket", meaning: "vé", categoryId: "c3" },
        { id: "v7", word: "teacher", meaning: "giáo viên", categoryId: "c4" },
        { id: "v8", word: "computer", meaning: "máy tính", categoryId: "c5" }
    ];
    localStorage.setItem("vocabularies", JSON.stringify(vocabSeed));
}

let vocabularies = JSON.parse(localStorage.getItem("vocabularies")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

const table = document.getElementById("vocabularyTable");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("vocabModal");
const deleteModal = document.getElementById("deleteModal");

const wordInput = document.getElementById("wordInput");
const meaningInput = document.getElementById("meaningInput");
const categorySelect = document.getElementById("categorySelect");

const categoryFilter = document.getElementById("categoryFilter");

let editId = null;
let deleteId = null;

function loadCategories() {
    categorySelect.innerHTML = categories.map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join("");

    categoryFilter.innerHTML =
        `<option value="">All Categories</option>` +
        categories.map(c =>
            `<option value="${c.id}">${c.name}</option>`
        ).join("");
}

loadCategories();

function renderVocabulary() {
    const keyword = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    let filtered = vocabularies.filter(v =>
        v.word.toLowerCase().includes(keyword)
    );

    if (category) {
        filtered = filtered.filter(v => v.categoryId === category);
    }  

    table.innerHTML = filtered.map(v => {
        const cat = categories.find(c => c.id === v.categoryId);
        return `
        <tr>
            <td>${v.word}</td>
            <td>${v.meaning}</td>
            <td>${cat ? cat.name : ""}</td>
            <td class="action-buttons">
                <button class="btn-primary btn-action" onclick="editVocabulary('${v.id}')">Edit</button>
                <button class="btn-danger btn-action" onclick="showDelete('${v.id}')">Delete</button>
            </td>
        </tr>
` }).join("");
}

renderVocabulary();

document.getElementById("addVocabularyBtn").onclick = () => {
    editId = null;
    wordInput.value = "";
    meaningInput.value = "";
    modal.style.display = "flex";
};

document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
};

document.getElementById("saveVocabulary").onclick = () => {
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    const categoryId = categorySelect.value;

    if (!word || !meaning) {
        showToast({ type: 'error', title: 'Invalid Input', desc: 'Please fill all fields' });
        return;
    }

    if (editId) {
        const index = vocabularies.findIndex(v => v.id === editId);
        vocabularies[index].word = word;
        vocabularies[index].meaning = meaning;
        vocabularies[index].categoryId = categoryId;
    } else {
        const newWord = {
            id: Date.now().toString(),
            word,
            meaning,
            categoryId
        };
        vocabularies.push(newWord);
    }

    localStorage.setItem("vocabularies", JSON.stringify(vocabularies));
    modal.style.display = "none";
    renderVocabulary();
    showToast({ type: 'success', title: 'Success', desc: 'Vocabulary saved successfully' });
};

function editVocabulary(id) {
    const vocab = vocabularies.find(v => v.id === id);
    editId = id;
    wordInput.value = vocab.word;
    meaningInput.value = vocab.meaning;
    categorySelect.value = vocab.categoryId;
    modal.style.display = "flex";
}

function showDelete(id) {
    deleteId = id;
    deleteModal.style.display = "flex";
}

document.getElementById("confirmDelete").onclick = () => {
    vocabularies = vocabularies.filter(v => v.id !== deleteId);
    localStorage.setItem("vocabularies", JSON.stringify(vocabularies));
    deleteModal.style.display = "none";
    renderVocabulary();
    showToast({ type: 'success', title: 'Deleted', desc: 'Vocabulary removed successfully' });
};

document.getElementById("cancelDelete").onclick = () => {
    deleteModal.style.display = "none";
};

searchInput.addEventListener("input", renderVocabulary);
categoryFilter.addEventListener("change", renderVocabulary);