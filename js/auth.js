/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
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
    closeBtn.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}

/* ============================================================
   TOGGLE PASSWORD VISIBILITY
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const eyeOpenSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    const eyeClosedSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.59 3.59" />`;

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const svgIcon = this.querySelector('svg');
            if (input.type === 'password') {
                input.type = 'text';
                svgIcon.innerHTML = eyeOpenSvg;
                this.setAttribute('aria-label', 'Ẩn mật khẩu');
            } else {
                input.type = 'password';
                svgIcon.innerHTML = eyeClosedSvg;
                this.setAttribute('aria-label', 'Hiển thị mật khẩu');
            }
        });
    });
});

/* ============================================================
   REGISTER FORM
   ============================================================ */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        let isValid = true;
        document.querySelectorAll('.error').forEach(el => el.textContent = '');

        if (!firstName) { document.getElementById('firstNameError').textContent = 'First name is required'; isValid = false; }
        if (!lastName) { document.getElementById('lastNameError').textContent = 'Last name is required'; isValid = false; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { document.getElementById('emailError').textContent = 'Invalid email format'; isValid = false; }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) { document.getElementById('emailError').textContent = 'Email already exists'; isValid = false; }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) { document.getElementById('passwordError').textContent = 'Password must be 8+ chars, include upper, lower and number'; isValid = false; }

        if (password !== confirmPassword) { document.getElementById('confirmPasswordError').textContent = 'Passwords do not match'; isValid = false; }

        if (!isValid) return;

        const newUser = { id: Date.now().toString(), firstName, lastName, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        showRegisterSuccess(newUser);
    });
}

function showRegisterSuccess(user) {
    const formEl = document.getElementById('registerForm');
    if (formEl) formEl.style.display = 'none';

    const boxH2 = document.querySelector('.auth-box h2');
    if (boxH2) boxH2.style.display = 'none';

    let successEl = document.getElementById('registerSuccess');
    if (!successEl) {
        successEl = document.createElement('div');
        successEl.id = 'registerSuccess';
        successEl.className = 'register-success';
        document.querySelector('.auth-box').appendChild(successEl);
    }

    const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
    successEl.innerHTML = `
        <div class="success-icon-ring">
            <svg viewBox="0 0 52 52" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 26l9 9 16-18"/>
            </svg>
        </div>
        <div class="success-badge">✓ Account Created</div>
        <h3>Welcome to VocabApp!</h3>
        <p>Your account has been created successfully. You're all set to start learning.</p>
        <div class="success-user-card">
            <div class="success-avatar">${initials}</div>
            <div class="success-user-info">
                <div class="success-user-name">${user.firstName} ${user.lastName}</div>
                <div class="success-user-email">${user.email}</div>
            </div>
        </div>
        <p class="success-countdown">Redirecting to login in <span id="countdownNum">3</span>s...</p>
        <a href="login.html" class="btn-primary" style="width:100%;justify-content:center;margin-top:4px;text-align:center;">
            Go to Login →
        </a>
    `;
    successEl.classList.add('show');

    let count = 3;
    const countdownEl = document.getElementById('countdownNum');
    const timer = setInterval(() => {
        count--;
        if (countdownEl) countdownEl.textContent = count;
        if (count <= 0) { clearInterval(timer); window.location.href = 'login.html'; }
    }, 1000);
}

/* ============================================================
   LOGIN FORM
   ============================================================ */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        let isValid = true;

        document.getElementById('loginEmailError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';

        if (!email) { document.getElementById('loginEmailError').textContent = 'Email is required'; isValid = false; }
        if (!password) { document.getElementById('loginPasswordError').textContent = 'Password is required'; isValid = false; }
        if (!isValid) return;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            document.getElementById('loginPasswordError').textContent = 'Email or password is incorrect';
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));

        // Queue a toast to show after redirect
        localStorage.setItem('pendingToast', JSON.stringify({
            type: 'success',
            title: `Welcome back, ${user.firstName}! 👋`,
            desc: `Logged in as ${user.email}`,
        }));

        window.location.href = '../index.html';
    });
}

/* ============================================================
   SHOW PENDING TOAST ON NEXT PAGE (after login redirect)
   ============================================================ */
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