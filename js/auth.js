document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const eyeOpenSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    const eyeClosedSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.59 3.59" />`;

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
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

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        let isValid = true;

        document.querySelectorAll(".error").forEach(el => el.textContent = "");

        if (!firstName) {
            document.getElementById("firstNameError").textContent = "First name is required";
            isValid = false;
        }

        if (!lastName) {
            document.getElementById("lastNameError").textContent = "Last name is required";
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById("emailError").textContent = "Invalid email format";
            isValid = false;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const emailExists = users.find(user => user.email === email);

        if (emailExists) {
            document.getElementById("emailError").textContent = "Email already exists";
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            document.getElementById("passwordError").textContent =
                "Password must be 8+ chars, include upper, lower and number";
            isValid = false;
        }

        if (password !== confirmPassword) {
            document.getElementById("confirmPasswordError").textContent =
                "Passwords do not match";
            isValid = false;
        }

        if (!isValid) return;

        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Register successful!");
        window.location.href = "login.html";
    });
}


const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        let isValid = true;

        document.getElementById("loginEmailError").textContent = "";
        document.getElementById("loginPasswordError").textContent = "";
        if (!email) {
            document.getElementById("loginEmailError").textContent =
                "Email is required";
            isValid = false;
        }
        if (!password) {
            document.getElementById("loginPasswordError").textContent =
                "Password is required";
            isValid = false;
        }

        if (!isValid) return;

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(
            user => user.email === email && user.password === password
        );

        if (!user) {
            document.getElementById("loginPasswordError").textContent =
                "Email or password is incorrect";
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "../index.html";
    });
}

