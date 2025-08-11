// Auth App - Supabase Integration

class AuthApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'login';
        this.isAuthenticated = false;
        this.supabase = null;

        // Initialize the app
        this.init();
    }

    // Initialize the Supabase client and set up auth listener
    init() {
        // --- IMPORTANT ---
        // Replace with your actual Supabase Project URL and Anon Key
        const SUPABASE_URL = 'https://huybwgkwpdeixwgiakbw.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eWJ3Z2t3cGRlaXh3Z2lha2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTMyMDUsImV4cCI6MjA2OTUyOTIwNX0.xFZen-OHhGldcOl8pkbpzJKaGdOfJ1DcIEAxcY0DjkA';

        // This assumes you have included the Supabase client library via CDN
        // <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
        try {
             this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error("Supabase client not found. Make sure you have included the Supabase JS library in your HTML file.");
            this.showLoading(false);
            return;
        }

        // Listen for authentication state changes (login, logout)
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log(`Supabase auth event: ${event}`, session);
            if (session && session.user) {
                this.isAuthenticated = true;
                this.currentUser = session.user;
                this.navigate('dashboard');
            } else {
                this.isAuthenticated = false;
                this.currentUser = null;
                // Only navigate to login if not already on signup page
                if (this.currentPage !== 'signup') {
                    this.navigate('login');
                }
            }
            // Hide the main loading spinner once auth state is resolved
            this.showLoading(false);
        });

        this.bindEvents();
    }

    // Bind all event listeners
    bindEvents() {
        // Wait for DOM to be fully loaded
        setTimeout(() => {
            // Navigation links
            const goToSignupLink = document.getElementById('goToSignup');
            const goToLoginLink = document.getElementById('goToLogin');

            if (goToSignupLink) {
                goToSignupLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate('signup');
                });
            }

            if (goToLoginLink) {
                goToLoginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate('login');
                });
            }

            // Form submissions
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');

            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            if (signupForm) {
                signupForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSignup();
                });
            }

            // Logout buttons
            const logoutBtn = document.getElementById('logoutBtn');
            const dashboardLogoutBtn = document.getElementById('dashboardLogoutBtn');

            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }

            if (dashboardLogoutBtn) {
                dashboardLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }

            // Setup form validation
            this.setupFormValidation();

            // Clear any previous messages
            this.clearMessages();
        }, 100);
    }

    // Handle user login with Supabase
    async handleLogin() {
        if (!this.validateForm('login')) return;

        const emailField = document.getElementById('loginEmail');
        const passwordField = document.getElementById('loginPassword');
        const submitBtn = document.getElementById('loginSubmitBtn');
        const messageEl = document.getElementById('loginMessage');

        const email = emailField.value.trim();
        const password = passwordField.value;

        this.setButtonLoading(submitBtn, true);

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                this.showMessage(messageEl, error.message, 'error');
            } else {
                // Success! onAuthStateChange will handle the redirect.
                this.showMessage(messageEl, 'Login successful! Redirecting...', 'success');
            }

        } catch (error) {
            console.error('Login Error:', error);
            this.showMessage(messageEl, 'An unexpected error occurred. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle user signup with Supabase
    async handleSignup() {
        if (!this.validateForm('signup')) return;

        const usernameField = document.getElementById('signupUsername');
        const emailField = document.getElementById('signupEmail');
        const passwordField = document.getElementById('signupPassword');
        const submitBtn = document.getElementById('signupSubmitBtn');
        const messageEl = document.getElementById('signupMessage');

        const username = usernameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value;

        this.setButtonLoading(submitBtn, true);

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    // Store extra info like username in user_metadata
                    data: {
                        username: username,
                    }
                }
            });

            if (error) {
                this.showMessage(messageEl, error.message, 'error');
            } else {
                // Success! Prompt user to check their email for confirmation.
                this.showMessage(messageEl, 'Account created! Please check your email to confirm your account.', 'success');
                const signupForm = document.getElementById('signupForm');
                if (signupForm) signupForm.reset();
            }

        } catch (error) {
            console.error('Signup Error:', error);
            this.showMessage(messageEl, 'An unexpected error occurred. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle logout with Supabase
    async handleLogout() {
        this.showLoading(true);
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error('Logout Error:', error);
            alert(error.message); // Show a simple alert for logout errors
        }
        // onAuthStateChange will automatically handle redirecting to the login page.
    }

    // Load dashboard data from the Supabase user object
    loadDashboardData() {
        if (!this.currentUser) return;

        const welcomeMessage = document.getElementById('welcomeMessage');
        const dashboardUsername = document.getElementById('dashboardUsername');
        const dashboardEmail = document.getElementById('dashboardEmail');
        const dashboardJoinDate = document.getElementById('dashboardJoinDate');

        // The username is stored in user_metadata
        const username = this.currentUser.user_metadata.username || 'User';

        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${username}!`;
        }
        if (dashboardUsername) {
            dashboardUsername.textContent = username;
        }
        if (dashboardEmail) {
            // Email is on the root of the user object
            dashboardEmail.textContent = this.currentUser.email;
        }
        if (dashboardJoinDate) {
            // created_at is on the root of the user object
            const joinDate = new Date(this.currentUser.created_at);
            dashboardJoinDate.textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // --- UI and Validation Helper Functions ---

    setupFormValidation() {
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        if (loginEmail) {
            loginEmail.addEventListener('blur', () => this.validateField('loginEmail'));
            loginEmail.addEventListener('input', () => this.clearFieldError('loginEmail'));
        }
        if (loginPassword) {
            loginPassword.addEventListener('blur', () => this.validateField('loginPassword'));
            loginPassword.addEventListener('input', () => this.clearFieldError('loginPassword'));
        }
        const signupUsername = document.getElementById('signupUsername');
        const signupEmail = document.getElementById('signupEmail');
        const signupPassword = document.getElementById('signupPassword');
        if (signupUsername) {
            signupUsername.addEventListener('blur', () => this.validateField('signupUsername'));
            signupUsername.addEventListener('input', () => this.clearFieldError('signupUsername'));
        }
        if (signupEmail) {
            signupEmail.addEventListener('blur', () => this.validateField('signupEmail'));
            signupEmail.addEventListener('input', () => this.clearFieldError('signupEmail'));
        }
        if (signupPassword) {
            signupPassword.addEventListener('blur', () => this.validateField('signupPassword'));
            signupPassword.addEventListener('input', () => this.clearFieldError('signupPassword'));
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        if (field) field.classList.remove('invalid', 'valid');
        if (errorElement) errorElement.textContent = '';
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        if (!field || !errorElement) return true;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        field.classList.remove('valid', 'invalid');
        switch (fieldId) {
            case 'signupUsername':
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Username must be at least 3 characters long';
                }
                break;
            case 'signupEmail':
            case 'loginEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'signupPassword':
            case 'loginPassword':
                if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'Password must be at least 6 characters long';
                }
                break;
        }
        if (value && !isValid) {
            field.classList.add('invalid');
            errorElement.textContent = errorMessage;
        } else if (value && isValid) {
            field.classList.add('valid');
            errorElement.textContent = '';
        } else {
            errorElement.textContent = '';
        }
        return isValid;
    }

    validateForm(formType) {
        let isFormValid = true;
        let fieldsToValidate = [];

        if (formType === 'login') {
            fieldsToValidate = ['loginEmail', 'loginPassword'];
        } else if (formType === 'signup') {
            fieldsToValidate = ['signupUsername', 'signupEmail', 'signupPassword'];
        }

        fieldsToValidate.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                this.showFieldError(fieldId, 'This field is required');
                isFormValid = false;
            } else if (!this.validateField(fieldId)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        if (field) field.classList.add('invalid');
        if (errorElement) errorElement.textContent = message;
    }

    navigate(page) {
        if (page === 'dashboard' && !this.isAuthenticated) {
            this.navigate('login'); // Redirect to login if not authenticated
            return;
        }
        this.currentPage = page;
        this.showPage(page);
        const path = `/${page}`;
        window.history.pushState({page: page}, '', path);
    }

    showPage(page) {
        const pages = ['loginPage', 'signupPage', 'dashboardPage'];
        pages.forEach(pageId => {
            const pageElement = document.getElementById(pageId);
            if (pageElement) pageElement.style.display = 'none';
        });
        const targetPage = document.getElementById(page + 'Page');
        if (targetPage) targetPage.style.display = 'block';

        this.updateNavbar();
        if (page === 'dashboard' && this.isAuthenticated) {
            this.loadDashboardData();
        }
        this.clearMessages();
    }

    clearMessages() {
        const messageElements = ['loginMessage', 'signupMessage'];
        messageElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '';
                element.className = 'auth-message';
            }
        });
    }

    updateNavbar() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = this.isAuthenticated ? 'block' : 'none';
        }
    }

    setButtonLoading(button, loading) {
        if (!button) return;
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `auth-message ${type} show`;
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Supabase Auth App...');
    window.authApp = new AuthApp();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page && window.authApp) {
             window.authApp.navigate(event.state.page);
        } else {
            // Fallback for initial load or no state
            const path = window.location.pathname.substring(1); // remove leading '/'
            if(window.authApp && (path === 'login' || path === 'signup' || path === 'dashboard')) {
                window.authApp.navigate(path);
            }
        }
    });
});
