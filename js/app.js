   function createToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
    return c;
}

function showToast({ type = 'info', title, desc, duration = 4000 }) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="Close">✕</button>
    `;
    container.appendChild(toast);

    function dismiss() {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }
    const closeBtn = toast.querySelector('.toast-close');
    const timer = setTimeout(dismiss, duration);
    closeBtn.addEventListener('click', () => {
        clearTimeout(timer); 
        dismiss(); 
    });
}

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.href = isInPages ? 'login.html' : 'pages/login.html';
}

window.addEventListener('DOMContentLoaded', () => {
    const pending = localStorage.getItem('pendingToast');
    if (pending) {
        try {
            const toastData = JSON.parse(pending);
            localStorage.removeItem('pendingToast');
            setTimeout(() => showToast(toastData), 400);
        } catch (_) { localStorage.removeItem('pendingToast'); }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="logout-modal">
            <div class="logout-icon">👋</div>
            <h3>Log out of VocabApp?</h3>
            <p>Your progress is saved. You can always log back in to continue learning.</p>
            <div class="logout-actions">
                <button class="btn-cancel" id="cancelLogout">Stay</button>
                <button class="btn-logout-confirm" id="confirmLogout">Log out</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    logoutBtn.addEventListener('click', () => {
        overlay.classList.add('show');
    });

    document.getElementById('cancelLogout').addEventListener('click', () => {
        overlay.classList.remove('show');
    });

    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('show');
    });

    document.getElementById('confirmLogout').addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const name = user ? user.firstName : 'User';

        localStorage.removeItem('currentUser');

        localStorage.setItem('pendingToast', JSON.stringify({
            type:  'info',
            title: `See you soon, ${name}! `,
            desc:  'You have been logged out successfully.',
        }));

        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? 'login.html' : 'pages/login.html';
    });
});