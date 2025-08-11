// ===================================================================================
// SUPABASE CONFIGURATION
// ===================================================================================
// IMPORTANT: Replace with your actual Supabase project URL and anon key.
const SUPABASE_URL = 'https://vhbxtpaetnfirkhsbheq.supabase.co'; // e.g., 'https://xyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYnh0cGFldG5maXJraHNiaGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTgyNzcsImV4cCI6MjA2OTU5NDI3N30.SgMPKCMWodLhymQnqjAnhZNQGX9H_PFg_qyMo8x0e_g'; // e.g., 'ey...'

// Initialize Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================================================================================
// APPLICATION STATE
// ===================================================================================
let appState = {
    currentUser: null,
    currentScreen: 'auth-screen',
    currentHome: null,
    homes: [],
    cameras: [],
    members: [],
    securityAlerts: [],
    unknownEvents: [],
    itemToRemove: { id: null, type: null }
};

// ===================================================================================
// DOM ELEMENTS
// ===================================================================================
const screens = {
    auth: document.getElementById('auth-screen'),
    signup: document.getElementById('signup-screen'),
    home: document.getElementById('home-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    liveFeed: document.getElementById('live-feed-screen'),
    addMember: document.getElementById('add-member-screen'),
    removeMember: document.getElementById('remove-member-screen'),
    emergency: document.getElementById('emergency-screen'),
    unknown: document.getElementById('unknown-screen'),
};

const modals = {
    createLocation: document.getElementById('create-location-modal'),
    addCamera: document.getElementById('add-camera-modal'),
    confirmation: document.getElementById('confirmation-modal')
};

// ===================================================================================
// UTILITY & UI FUNCTIONS
// ===================================================================================

/**
 * Shows a specific screen and hides all others.
 * @param {string} screenId - The key of the screen to show from the `screens` object.
 */
function showScreen(screenId) {
    appState.currentScreen = screenId;
    for (const id in screens) {
        screens[id].classList.toggle('active', id === screenId);
    }
}

/**
 * Shows a modal dialog.
 * @param {string} modalId - The key of the modal to show from the `modals` object.
 */
function showModal(modalId) {
    if (modals[modalId]) {
        modals[modalId].classList.remove('hidden');
    }
}

/**
 * Hides a modal dialog.
 * @param {string} modalId - The key of the modal to hide from the `modals` object.
 */
function hideModal(modalId) {
    if (modals[modalId]) {
        modals[modalId].classList.add('hidden');
    }
}

/**
 * Displays a temporary toast message.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===================================================================================
// AUTHENTICATION FUNCTIONS
// ===================================================================================

/**
 * Handles user sign-up.
 * @param {Event} event - The form submission event.
 */
async function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const { user, error } = await db.auth.signUp({ email, password });

    if (error) {
        showToast(error.message, 'error');
    } else {
        showToast('Signup successful! Please check your email to verify.', 'success');
        showScreen('auth'); // Show login screen after signup
    }
}

/**
 * Handles user sign-in.
 * @param {Event} event - The form submission event.
 */
async function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
        showToast(error.message, 'error');
    } else if (data.user) {
        appState.currentUser = data.user;
        showToast('Signed in successfully!', 'success');
        initializeAppUI();
    }
}

/**
 * Handles user sign-out.
 */
async function handleSignOut() {
    const { error } = await db.auth.signOut();
    if (error) {
        showToast(error.message, 'error');
    } else {
        appState.currentUser = null;
        appState.currentHome = null;
        appState.homes = [];
        showScreen('auth');
        document.getElementById('login-form').reset();
    }
}

// ===================================================================================
// DATA FETCHING FUNCTIONS (from Supabase)
// ===================================================================================

/**
 * Fetches all homes for the current user.
 */
async function fetchHomes() {
    if (!appState.currentUser) return;

    const { data, error } = await db
        .from('Homes')
        .select('*')
        .eq('owner_user_id', appState.currentUser.id);

    if (error) {
        showToast('Error fetching homes: ' + error.message, 'error');
    } else {
        appState.homes = data;
        renderHomes();
    }
}

/**
 * Fetches all cameras for the currently selected home.
 */
async function fetchCameras() {
    if (!appState.currentHome) return;

    const { data, error } = await db
        .from('Camera')
        .select('*')
        .eq('home_id', appState.currentHome.id);

    if (error) {
        showToast('Error fetching cameras: ' + error.message, 'error');
    } else {
        appState.cameras = data;
        renderCameras();
    }
}

/**
 * Fetches all members for the currently selected home.
 */
async function fetchMembers() {
    if (!appState.currentHome) return;

    const { data, error } = await db
        .from('Members')
        .select('*')
        .eq('home_id', appState.currentHome.id);

    if (error) {
        showToast('Error fetching members: ' + error.message, 'error');
    } else {
        appState.members = data;
        renderMembers();
    }
}

/**
 * Fetches all security alerts for the currently selected home.
 */
async function fetchSecurityAlerts() {
    if (!appState.currentHome) return;

    const { data, error } = await db
        .from('SecurityAlerts')
        .select('*')
        .eq('home_id', appState.currentHome.id)
        .order('event_timestamp', { ascending: false }); // Show newest first

    if (error) {
        showToast('Error fetching security alerts: ' + error.message, 'error');
    } else {
        appState.securityAlerts = data;
        renderSecurityAlerts();
    }
}

/**
 * Fetches all unknown events for the currently selected home.
 */
async function fetchUnknownEvents() {
    if (!appState.currentHome) return;

    const { data, error } = await db
        .from('Unknown')
        .select('*')
        .eq('home_id', appState.currentHome.id)
        .order('detected_at', { ascending: false }); // Show newest first


    if (error) {
        showToast('Error fetching unknown events: ' + error.message, 'error');
    } else {
        appState.unknownEvents = data;
        renderUnknownEvents();
    }
}


// ===================================================================================
// DATA RENDERING FUNCTIONS
// ===================================================================================

/**
 * Renders the user's homes on the home screen.
 */
function renderHomes() {
    const list = document.getElementById('locations-list');
    const noHomesMsg = document.getElementById('no-homes-message');
    list.innerHTML = '';

    if (appState.homes.length === 0) {
        noHomesMsg.classList.remove('hidden');
    } else {
        noHomesMsg.classList.add('hidden');
        appState.homes.forEach(home => {
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow';
            card.innerHTML = `<h3 class="text-xl font-bold text-gray-800">${home.home_name}</h3><p class="text-gray-600">${home.address}</p>`;
            card.addEventListener('click', () => {
                appState.currentHome = home;
                document.getElementById('dashboard-title').textContent = home.home_name;
                showScreen('dashboard');
            });
            list.appendChild(card);
        });
    }
}

/**
 * Renders the cameras for the current home on the live feed screen.
 */
function renderCameras() {
    const grid = document.getElementById('camera-grid');
    const noCamerasMsg = document.getElementById('no-cameras-message');
    grid.innerHTML = ''; // Clear previous cameras

    if (appState.cameras.length === 0) {
        noCamerasMsg.classList.remove('hidden');
    } else {
        noCamerasMsg.classList.add('hidden');
        appState.cameras.forEach(camera => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow-md text-center';
            card.innerHTML = `
                <div class="text-2xl mb-2">📷</div>
                <h4 class="font-bold">${camera.cam_name}</h4>
                <p class="text-sm text-gray-500">${camera.location}</p>
            `;
            grid.appendChild(card);
        });
    }
}

/**
 * Renders the members for the current home on the manage members screen.
 */
function renderMembers() {
    const list = document.getElementById('members-list');
    const noMembersMsg = document.getElementById('no-members-message');
    list.innerHTML = '';

    if (appState.members.length === 0) {
        noMembersMsg.classList.remove('hidden');
    } else {
        noMembersMsg.classList.add('hidden');
        appState.members.forEach(member => {
            const item = document.createElement('div');
            item.className = 'flex justify-between items-center bg-gray-100 p-4 rounded-lg';
            item.innerHTML = `
                <div>
                    <p class="font-bold">${member.name}</p>
                    <p class="text-sm text-gray-600">${member.category}</p>
                </div>
                <button data-id="${member.id}" class="remove-btn text-red-500 hover:text-red-700 font-bold">Remove</button>
            `;
            list.appendChild(item);
        });
        // Add event listeners to new remove buttons
        list.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const memberId = e.target.dataset.id;
                appState.itemToRemove = { id: memberId, type: 'member' };
                document.getElementById('confirm-title').textContent = 'Confirm Removal';
                document.getElementById('confirm-message').textContent = 'Are you sure you want to remove this member?';
                showModal('confirmation');
            });
        });
    }
}

/**
 * Renders security alerts on the emergency screen.
 */
function renderSecurityAlerts() {
    const list = document.getElementById('alerts-list');
    const noAlertsMsg = document.getElementById('no-alerts-message');
    list.innerHTML = '';

    if (appState.securityAlerts.length === 0) {
        noAlertsMsg.classList.remove('hidden');
    } else {
        noAlertsMsg.classList.add('hidden');
        appState.securityAlerts.forEach(alert => {
            const item = document.createElement('div');
            item.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg';
            item.innerHTML = `
                <p class="font-bold">${alert.event_type || 'Alert'}</p>
                <p>${alert.details}</p>
                <p class="text-sm text-gray-600 mt-2">${new Date(alert.event_timestamp).toLocaleString()}</p>
                ${alert.image_url ? `<img src="${alert.image_url}" class="mt-2 rounded-lg max-w-xs">` : ''}
            `;
            list.appendChild(item);
        });
    }
}

/**
 * Renders unknown events on the unknown screen.
 */
function renderUnknownEvents() {
    const list = document.getElementById('unknown-list');
    const noUnknownMsg = document.getElementById('no-unknown-message');
    list.innerHTML = '';

    if (appState.unknownEvents.length === 0) {
        noUnknownMsg.classList.remove('hidden');
    } else {
        noUnknownMsg.classList.add('hidden');
        appState.unknownEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg';
            // Since `details` is json, we check for a 'note' property, otherwise stringify.
            const detailsText = event.details && event.details.note ? event.details.note : JSON.stringify(event.details);
            item.innerHTML = `
                <p class="font-bold">Unknown Activity Detected</p>
                <p>${detailsText}</p>
                <p class="text-sm text-gray-600 mt-2">${new Date(event.detected_at).toLocaleString()}</p>
                ${event.image_url ? `<img src="${event.image_url}" class="mt-2 rounded-lg max-w-xs">` : ''}
            `;
            list.appendChild(item);
        });
    }
}


// ===================================================================================
// DATA MANIPULATION & FORM HANDLERS
// ===================================================================================

/**
 * Handles the creation of a new home.
 * @param {Event} event - The form submission event.
 */
async function handleCreateHome(event) {
    event.preventDefault();
    const homeName = document.getElementById('location-name').value;
    const address = document.getElementById('location-address').value;

    const { data, error } = await db
        .from('Homes')
        .insert([{
            home_name: homeName,
            address: address,
            owner_user_id: appState.currentUser.id
        }]);

    if (error) {
        showToast('Error creating home: ' + error.message, 'error');
    } else {
        showToast('Home created successfully!', 'success');
        hideModal('createLocation');
        event.target.reset();
        fetchHomes(); // Refresh the list of homes
    }
}

/**
 * Handles the creation of a new camera.
 * @param {Event} event - The form submission event.
 */
async function handleAddCamera(event) {
    event.preventDefault();
    const camName = document.getElementById('camera-name').value;
    const location = document.getElementById('camera-location').value;
    const streamUrl = document.getElementById('camera-stream-url').value;

    const { data, error } = await db
        .from('Camera')
        .insert([{
            cam_name: camName,
            location: location,
            stream_url: streamUrl,
            home_id: appState.currentHome.id
        }]);

    if (error) {
        showToast('Error adding camera: ' + error.message, 'error');
    } else {
        showToast('Camera added successfully!', 'success');
        hideModal('addCamera');
        event.target.reset();
        fetchCameras(); // Refresh the list of cameras
    }
}

/**
 * Handles adding a new member with image upload.
 * @param {Event} event
 */
async function handleAddMember(event) {
  event.preventDefault();
  const form = event.target;

  const name = document.getElementById('member-name').value;
  const category = document.getElementById('member-category').value;
  const imageFile = document.getElementById('member-image').files[0];

  if (!name || !category || !imageFile) {
    showToast('Please fill out all required fields.', 'error');
    return;
  }

  try {
    const filePath = `public/${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await db.storage
      .from('avatars')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: urlData } = db.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    const { error: insertError } = await db
      .from('Members')
      .insert([{
        name: name,
        category: category,
        home_id: appState.currentHome.id,
        profile_img_url: imageUrl
      }]);

    if (insertError) throw insertError;

    showToast('Member added successfully!', 'success');
    form.reset();
    showScreen('dashboard');
    fetchMembers();

  } catch (error) {
    showToast('Error: ' + error.message, 'error');
    console.error('Error adding member:', error);
  }
}

/**
 * NEW: Handles sending a manual emergency message.
 */
async function handleSendEmergencyMessage() {
    const messageInput = document.getElementById('emergency-message-input');
    const message = messageInput.value.trim();

    if (!message) {
        showToast('Please enter a message for the alert.', 'error');
        return;
    }

    const { error } = await db
        .from('SecurityAlerts')
        .insert([{
            details: message,
            event_type: 'Manual Alert',
            home_id: appState.currentHome.id,
        }]);

    if (error) {
        showToast('Error sending alert: ' + error.message, 'error');
    } else {
        showToast('Alert sent successfully!', 'success');
        messageInput.value = ''; // Clear the input
        fetchSecurityAlerts(); // Refresh the list to show the new alert
    }
}

/**
 * NEW: Handles saving a note about unknown activity.
 */
async function handleSaveUnknownNote() {
    const noteInput = document.getElementById('unknown-note-input');
    const note = noteInput.value.trim();

    if (!note) {
        showToast('Please enter a note to save.', 'error');
        return;
    }

    const { error } = await db
        .from('Unknown')
        .insert([{
            details: { note: note }, // Save as a JSON object with a 'note' key
            home_id: appState.currentHome.id,
        }]);

    if (error) {
        showToast('Error saving note: ' + error.message, 'error');
    } else {
        showToast('Note saved successfully!', 'success');
        noteInput.value = ''; // Clear the input
        fetchUnknownEvents(); // Refresh the list to show the new note
    }
}

/**
 * Handles the confirmed removal of an item (member, camera, etc.).
 */
async function handleConfirmRemove() {
    const { id, type } = appState.itemToRemove;
    if (!id || !type) return;

    let error;
    if (type === 'member') {
        const result = await db.from('Members').delete().match({ id: id });
        error = result.error;
    }

    if (error) {
        showToast(`Error removing ${type}: ` + error.message, 'error');
    } else {
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully.`, 'success');
        if (type === 'member') {
            fetchMembers(); // Refresh the list
        }
    }

    hideModal('confirmation');
    appState.itemToRemove = { id: null, type: null };
}


// ===================================================================================
// INITIALIZATION AND EVENT LISTENERS
// ===================================================================================

/**
 * Sets up the main application UI after successful login.
 */
async function initializeAppUI() {
    document.getElementById('user-email').textContent = appState.currentUser.email;
    await fetchHomes();
    showScreen('home');
}

/**
 * Sets up all event listeners for the application.
 */
function setupEventListeners() {
    // Auth
    document.getElementById('login-form').addEventListener('submit', handleSignIn);
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);
    document.getElementById('logout-button').addEventListener('click', handleSignOut);
    document.getElementById('show-signup-btn').addEventListener('click', () => showScreen('signup'));
    document.getElementById('show-login-btn').addEventListener('click', () => showScreen('auth'));

    // Modals
    document.getElementById('create-new-btn').addEventListener('click', () => showModal('createLocation'));
    document.getElementById('cancel-create').addEventListener('click', () => hideModal('createLocation'));
    document.getElementById('add-camera-btn').addEventListener('click', () => showModal('addCamera'));
    document.getElementById('cancel-add-camera').addEventListener('click', () => hideModal('addCamera'));
    document.getElementById('cancel-remove').addEventListener('click', () => hideModal('confirmation'));
    document.getElementById('confirm-remove').addEventListener('click', handleConfirmRemove);

    // Forms
    document.getElementById('create-location-form').addEventListener('submit', handleCreateHome);
    document.getElementById('add-camera-form').addEventListener('submit', handleAddCamera);
    document.getElementById('add-member-form').addEventListener('submit', handleAddMember);

    // Navigation
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Simplified logic: any back button from a sub-screen goes to the dashboard
            const dashboardSubScreens = ['liveFeed', 'addMember', 'removeMember', 'emergency', 'unknown'];
            if (dashboardSubScreens.includes(appState.currentScreen)) {
                showScreen('dashboard');
            } else {
                showScreen('home'); // Default back action
            }
        });
    });

    document.getElementById('live-feed-btn').addEventListener('click', () => {
        fetchCameras();
        showScreen('liveFeed');
    });

    document.getElementById('add-member-btn').addEventListener('click', () => showScreen('addMember'));

    document.getElementById('remove-member-btn').addEventListener('click', () => {
        fetchMembers();
        showScreen('removeMember');
    });

    document.getElementById('emergency-btn').addEventListener('click', () => {
        fetchSecurityAlerts();
        showScreen('emergency');
    });

    document.getElementById('unknown-btn').addEventListener('click', () => {
        fetchUnknownEvents();
        showScreen('unknown');
    });

    // NEW: Event listeners for message/note forms
    document.getElementById('send-emergency-message-btn').addEventListener('click', handleSendEmergencyMessage);
    document.getElementById('save-unknown-note-btn').addEventListener('click', handleSaveUnknownNote);
}

/**
 * Main function to start the application.
 */
async function main() {
    setupEventListeners();

    // Check for existing session
    const { data } = await db.auth.getSession();
    if (data.session) {
        appState.currentUser = data.session.user;
        initializeAppUI();
    } else {
        showScreen('auth');
    }

    // Listen for auth state changes
    db.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
             appState.currentUser = null;
             showScreen('auth');
        } else if (event === 'SIGNED_IN' && session) {
            appState.currentUser = session.user;
            initializeAppUI();
        }
    });
}

// Run the application
main();