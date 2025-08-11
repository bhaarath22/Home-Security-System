// File: protect.js (in your main application's folder)

// --- IMPORTANT ---
// 1. Initialize Supabase (use the same credentials as your auth app)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. URL of your authentication page
const loginPageUrl = 'https://URL-TO-YOUR-AUTH-APP/auth.html';

// 3. Protection function
const protectPage = async () => {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    // If there is no session, or no user, redirect to the login page
    if (!session || !session.user) {
        window.location.href = loginPageUrl;
    } else {
        // User is authenticated!
        // You can now safely run code for logged-in users.
        console.log('User is authenticated:', session.user);

        // Example: Display the user's email on the page
        // const userEmailElement = document.getElementById('user-email');
        // if (userEmailElement) {
        //     userEmailElement.textContent = session.user.email;
        // }
    }
};

// 4. Run the protection function as soon as the script loads
protectPage();

// 5. (Optional) Add a logout function for a "Logout" button in your main app
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    }
    // After signing out, the user will be redirected by protectPage() on the next load,
    // but it's better to redirect immediately.
    window.location.href = loginPageUrl;
}