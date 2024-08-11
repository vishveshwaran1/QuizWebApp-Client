
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToSignUp = document.getElementById('switch-to-sign-up');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const signinLink = document.getElementById('signin-link');

    switchToSignUp.addEventListener('click', (e) => {
        e.preventDefault();
        signInForm.classList.add('hidden');
        signUpForm.classList.remove('hidden');
    });

    switchToSignIn.addEventListener('click', (e) => {
        e.preventDefault();
        signUpForm.classList.add('hidden');
        signInForm.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let username = document.getElementById('login-username').value;
        let password = document.getElementById('login-password').value;

        console.log("Login form submitted");

        try {
            const response = await fetch("https://vishveshwaran-quizwebapp-server.vercel.app/sign-in", {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const val = await response.json();
            console.log(val);
            if (response.ok) {
                // signinLink.textContent = val.username;
                 localStorage.setItem('username', val.username);
                window.location.href = 'index.html'; 
               
            } else {
                console.error('Login failed: ', val.message);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            console.log("Login request completed");
        }

        console.log(username, password);
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let username = document.getElementById('register-username').value;
        let email = document.getElementById('register-email').value;
        let password = document.getElementById('register-password').value;

        console.log("Sign-up form submitted");

        try {
            const response = await fetch("https://vishveshwaran-quizwebapp-server.vercel.app/sign-up", {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });
            const val = await response.json();
            console.log(val);
            if (response.ok && val.message === 'User created successfully') {
                switchToSignIn.click(); // Switch to sign-in form
            } else {
                console.error('Registration failed: ', val.message);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            console.log("Registration request completed");
        }

        console.log(username, email, password);
    });
});
