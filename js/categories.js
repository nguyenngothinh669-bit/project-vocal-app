let categories = JSON.parse(localStorage.getItem("categories"));
if (!categories || categories.length === 0) {
    categories = [
        {id: Date.now() + "1",name: "Animals",description: "Vocabulary about animals"},
        {id: Date.now() + "2",name: "Food", description: "Vocabulary about food and drinks"},
        {id: Date.now() + "3",name: "Travel",description: "Words related to travelling"},
        {id: Date.now() + "4",name: "Business",description: "Business English vocabulary"},
        {id: Date.now() + "5",name: "Technology",description: "Technology related vocabulary"}
    ];
    localStorage.setItem("categories", JSON.stringify(categories));
}

let currentPage = 1;
const itemsPerPage = 5;

const table = document.getElementById("categoryTable");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("categoryModal");
const deleteModal = document.getElementById("deleteModal");

const nameInput = document.getElementById("categoryName");
const descInput = document.getElementById("categoryDescription");

let editId = null;
let deleteId = null;

function renderCategories() {
    const keyword = searchInput.value.toLowerCase();
    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(keyword)
    );

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const pageItems = filtered.slice(start, end);
    table.innerHTML = pageItems.map(cat => `
        <tr>
            <td>${cat.name}</td>
            <td>${cat.description}</td>
            <td class="action-buttons">
                <button class="btn-primary btn-action" onclick="editCategory('${cat.id}')">Edit</button>
                <button class="btn-danger btn-action" onclick="showDelete('${cat.id}')">Delete</button>
            </td>
        </tr>
    `).join("");

    renderPagination(filtered.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        html += `
    <button class="${i === currentPage ? 'active' : ''}"onclick="changePage(${i})">
        ${i}
    </button>`;
    }
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderCategories();
}

document.getElementById("addCategoryBtn").onclick = () => {
    editId = null;
    nameInput.value = "";
    descInput.value = "";
    modal.style.display = "flex";
};

document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
};

document.getElementById("saveCategory").onclick = () => {
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    
    if (!name) {
        showToast({ type: 'error', title: 'Invalid Input', desc: 'Category name is required' });
        return;
    }

    const isDuplicate = categories.some(c =>
        c.name.toLowerCase() === name.toLowerCase() && c.id !== editId
    );

    if (isDuplicate) {
        showToast({ type: 'warning', title: 'Duplicate', desc: 'Category name already exists' });
        return;
    }
    
    if (editId) {
        const index = categories.findIndex(c => c.id === editId);
        categories[index].name = name;
        categories[index].description = description;
    } else {
        const newCategory = {
            id: Date.now().toString(),
            name,
            description
        };
        categories.push(newCategory);
    }
    
    localStorage.setItem("categories", JSON.stringify(categories));
    modal.style.display = "none";
    renderCategories();
    showToast({ type: 'success', title: 'Success', desc: 'Category saved successfully' });
};

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    editId = id;
    nameInput.value = category.name;
    descInput.value = category.description;
    modal.style.display = "flex";
}

function showDelete(id) {
    deleteId = id;
    deleteModal.style.display = "flex";
}

document.getElementById("confirmDelete").onclick = () => {
    categories = categories.filter(c => c.id !== deleteId);
    localStorage.setItem("categories", JSON.stringify(categories));
    deleteModal.style.display = "none";
    renderCategories();
    showToast({ type: 'success', title: 'Deleted', desc: 'Category deleted successfully' });
};

document.getElementById("cancelDelete").onclick = () => {
    deleteModal.style.display = "none";
};

searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderCategories();
});

renderCategories();