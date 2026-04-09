const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const logoutBtn = document.getElementById("logoutBtn");

if (!currentUser) {
    const isInPages = window.location.pathname.includes("/pages/");

    if (isInPages) {
        window.location.href = "login.html";
    } else {
        window.location.href = "pages/login.html";
    }

}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("currentUser");
            const isInPages = window.location.pathname.includes("/pages/");
            if (isInPages) {
                window.location.href = "login.html";
            } else {
                window.location.href = "pages/login.html";
            }
        }
    }); 
   
} 
 
 