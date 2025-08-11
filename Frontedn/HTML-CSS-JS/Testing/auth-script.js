// Auth App - Complete Authentication System Simulation

class AuthApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'login';
        this.isAuthenticated = false;
        
        // Initialize mock database
        this.initializeMockDatabase();
        
        // Initialize the app
        this.init();
    }

    // Initialize mock database with sample users
    initializeMockDatabase() {
        const existingUsers = localStorage.getItem('mockUsers');
        if (!existingUsers) {
            const mockUsers = [
                {
                    id: 1,
                    username: "admin",
                    email: "admin@example.com",
                    password: "$2b$12$hashedpassword123", // Simulated hash for "password"
                    created_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: 2,
                    username: "testuser",
                    email: "test@example.com", 
                    password: "$2b$12$hashedtest123", // Simulated hash for "test123"
                    created_at: "2024-01-15T00:00:00Z"
                }
            ];
            localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        }
    }

    // Initialize the application
    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.showPage(this.currentPage);
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

    // Setup real-time form validation
    setupFormValidation() {
        // Login form validation
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

        // Signup form validation
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

    // Clear field error
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.classList.remove('invalid');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // Field validation
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (!field || !errorElement) return true;
        
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous validation state
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

        // Update UI
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

    // Validate entire form
    validateForm(formType) {
        let isValid = true;

        if (formType === 'login') {
            const emailField = document.getElementById('loginEmail');
            const passwordField = document.getElementById('loginPassword');
            
            if (!emailField || !passwordField) return false;
            
            if (!emailField.value.trim()) {
                this.showFieldError('loginEmail', 'Email is required');
                isValid = false;
            } else if (!this.validateField('loginEmail')) {
                isValid = false;
            }
            
            if (!passwordField.value.trim()) {
                this.showFieldError('loginPassword', 'Password is required');
                isValid = false;
            } else if (!this.validateField('loginPassword')) {
                isValid = false;
            }
            
        } else if (formType === 'signup') {
            const usernameField = document.getElementById('signupUsername');
            const emailField = document.getElementById('signupEmail');
            const passwordField = document.getElementById('signupPassword');
            
            if (!usernameField || !emailField || !passwordField) return false;
            
            if (!usernameField.value.trim()) {
                this.showFieldError('signupUsername', 'Username is required');
                isValid = false;
            } else if (!this.validateField('signupUsername')) {
                isValid = false;
            }
            
            if (!emailField.value.trim()) {
                this.showFieldError('signupEmail', 'Email is required');
                isValid = false;
            } else if (!this.validateField('signupEmail')) {
                isValid = false;
            }
            
            if (!passwordField.value.trim()) {
                this.showFieldError('signupPassword', 'Password is required');
                isValid = false;
            } else if (!this.validateField('signupPassword')) {
                isValid = false;
            }
        }

        return isValid;
    }

    // Show field error
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field) field.classList.add('invalid');
        if (errorElement) errorElement.textContent = message;
    }

    // Check authentication status on app load
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (token && this.validateJWT(token)) {
            this.isAuthenticated = true;
            this.currentUser = this.getUserFromToken(token);
            this.currentPage = 'dashboard';
        } else {
            localStorage.removeItem('authToken');
            this.isAuthenticated = false;
            this.currentUser = null;
            this.currentPage = 'login';
        }
    }

    // Navigate to different pages
    navigate(page) {
        // Check if trying to access protected route
        if (page === 'dashboard' && !this.isAuthenticated) {
            this.navigate('login');
            return;
        }

        this.currentPage = page;
        this.showPage(page);

        // Update URL without page reload (simulate React Router)
        const path = page === 'login' ? '/login' : page === 'signup' ? '/signup' : '/dashboard';
        window.history.pushState({}, '', path);
    }

    // Show specific page
    showPage(page) {
        // Hide all pages
        const pages = ['loginPage', 'signupPage', 'dashboardPage'];
        pages.forEach(pageId => {
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.style.display = 'none';
            }
        });

        // Show requested page
        const targetPage = document.getElementById(page + 'Page');
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        // Update navbar
        this.updateNavbar();

        // Load dashboard data if needed
        if (page === 'dashboard' && this.isAuthenticated) {
            this.loadDashboardData();
        }

        // Clear messages when switching pages
        this.clearMessages();
    }

    // Clear all messages
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

    // Update navbar based on auth status
    updateNavbar() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = this.isAuthenticated ? 'block' : 'none';
        }
    }

    // Handle user login
    async handleLogin() {
        console.log('Login attempt started');
        
        if (!this.validateForm('login')) {
            console.log('Login form validation failed');
            return;
        }

        const emailField = document.getElementById('loginEmail');
        const passwordField = document.getElementById('loginPassword');
        const submitBtn = document.getElementById('loginSubmitBtn');
        const messageEl = document.getElementById('loginMessage');

        if (!emailField || !passwordField || !submitBtn || !messageEl) {
            console.log('Required elements not found');
            return;
        }

        const email = emailField.value.trim();
        const password = passwordField.value;

        console.log('Login data:', { email, password: '***' });

        // Show loading state
        this.setButtonLoading(submitBtn, true);
        this.showLoading(true);

        try {
            // Simulate API call delay
            await this.delay(1500);

            const response = await this.mockApiCall('/api/login', {
                method: 'POST',
                body: { email, password }
            });

            console.log('Login response:', response);

            if (response.success) {
                // Store token and update auth state
                localStorage.setItem('authToken', response.token);
                this.isAuthenticated = true;
                this.currentUser = response.user;

                // Show success message
                this.showMessage(messageEl, 'Login successful! Redirecting...', 'success');

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    this.navigate('dashboard');
                }, 1000);

            } else {
                this.showMessage(messageEl, response.message, 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(messageEl, 'An error occurred. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
            this.showLoading(false);
        }
    }

    // Handle user signup
    async handleSignup() {
        console.log('Signup attempt started');
        
        if (!this.validateForm('signup')) {
            console.log('Signup form validation failed');
            return;
        }

        const usernameField = document.getElementById('signupUsername');
        const emailField = document.getElementById('signupEmail');
        const passwordField = document.getElementById('signupPassword');
        const submitBtn = document.getElementById('signupSubmitBtn');
        const messageEl = document.getElementById('signupMessage');

        if (!usernameField || !emailField || !passwordField || !submitBtn || !messageEl) {
            console.log('Required signup elements not found');
            return;
        }

        const username = usernameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value;

        console.log('Signup data:', { username, email, password: '***' });

        // Show loading state
        this.setButtonLoading(submitBtn, true);
        this.showLoading(true);

        try {
            // Simulate API call delay
            await this.delay(2000);

            const response = await this.mockApiCall('/api/signup', {
                method: 'POST',
                body: { username, email, password }
            });

            console.log('Signup response:', response);

            if (response.success) {
                this.showMessage(messageEl, 'Account created successfully! Redirecting to login...', 'success');
                
                // Clear form
                const signupForm = document.getElementById('signupForm');
                if (signupForm) signupForm.reset();
                
                // Redirect to login after delay
                setTimeout(() => {
                    this.navigate('login');
                }, 2000);

            } else {
                this.showMessage(messageEl, response.message, 'error');
            }

        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage(messageEl, 'An error occurred. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
            this.showLoading(false);
        }
    }

    // Handle logout
    handleLogout() {
        console.log('Logout initiated');
        
        // Clear auth data
        localStorage.removeItem('authToken');
        this.isAuthenticated = false;
        this.currentUser = null;

        // Redirect to login
        this.navigate('login');

        // Clear any form data
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }

    // Load dashboard data
    async loadDashboardData() {
        if (!this.currentUser) return;

        const welcomeMessage = document.getElementById('welcomeMessage');
        const dashboardUsername = document.getElementById('dashboardUsername');
        const dashboardEmail = document.getElementById('dashboardEmail');
        const dashboardJoinDate = document.getElementById('dashboardJoinDate');

        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${this.currentUser.username}!`;
        }
        
        if (dashboardUsername) {
            dashboardUsername.textContent = this.currentUser.username;
        }
        
        if (dashboardEmail) {
            dashboardEmail.textContent = this.currentUser.email;
        }
        
        if (dashboardJoinDate) {
            // Format join date
            const joinDate = new Date(this.currentUser.created_at);
            dashboardJoinDate.textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Mock API call simulation
    async mockApiCall(endpoint, options) {
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');

        switch (endpoint) {
            case '/api/login':
                const { email, password } = options.body;
                const user = users.find(u => u.email === email);
                
                if (!user) {
                    return { success: false, message: 'Invalid email or password' };
                }

                // Simulate password verification
                const passwordValid = this.verifyPassword(password, user.password, email);
                
                if (!passwordValid) {
                    return { success: false, message: 'Invalid email or password' };
                }

                // Generate JWT token
                const token = this.generateJWT(user);
                
                return {
                    success: true,
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        created_at: user.created_at
                    }
                };

            case '/api/signup':
                const { username, email: signupEmail, password: signupPassword } = options.body;
                
                // Check if user already exists
                const existingUser = users.find(u => u.email === signupEmail || u.username === username);
                if (existingUser) {
                    const field = existingUser.email === signupEmail ? 'email' : 'username';
                    return { success: false, message: `This ${field} is already registered` };
                }

                // Create new user
                const newUser = {
                    id: Date.now(),
                    username,
                    email: signupEmail,
                    password: this.hashPassword(signupPassword),
                    created_at: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('mockUsers', JSON.stringify(users));

                return { success: true, message: 'Account created successfully' };

            default:
                return { success: false, message: 'Endpoint not found' };
        }
    }

    // Simulate password hashing
    hashPassword(password) {
        return `$2b$12$${btoa(password + 'salt').slice(0, 22)}`;
    }

    // Simulate password verification
    verifyPassword(password, hash, email) {
        // Simple simulation for demo accounts
        if (email === 'admin@example.com' && password === 'password') return true;
        if (email === 'test@example.com' && password === 'test123') return true;
        
        // For newly created users, compare with our simple hash
        const expectedHash = this.hashPassword(password);
        return hash === expectedHash;
    }

    // Generate JWT token (simulation)
    generateJWT(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            username: user.username,
            created_at: user.created_at,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        const signature = btoa(`signature_${user.id}_${Date.now()}`);
        
        return `${header}.${payload}.${signature}`;
    }

    // Validate JWT token
    validateJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            const payload = JSON.parse(atob(parts[1]));
            return payload.exp > Date.now();
        } catch {
            return false;
        }
    }

    // Get user from JWT token
    getUserFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id,
                email: payload.email,
                username: payload.username,
                created_at: payload.created_at || new Date().toISOString()
            };
        } catch {
            return null;
        }
    }

    // Utility functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        
        // Hide message after 5 seconds
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.authApp = new AuthApp();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        let page = 'login';
        
        if (path === '/signup') page = 'signup';
        else if (path === '/dashboard') page = 'dashboard';
        
        if (window.authApp) {
            window.authApp.navigate(page);
        }
    });

    // Set initial URL
    const initialPath = window.location.pathname === '/' ? '/login' : window.location.pathname;
    window.history.replaceState({}, '', initialPath);
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthApp;
}