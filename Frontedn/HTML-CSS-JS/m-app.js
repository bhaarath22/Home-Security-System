// Application state
let appState = {
    currentScreen: 'home-screen',
    currentLocation: null,
    locations: [
        {id: 1, name: "My Home", type: "home"},
        {id: 2, name: "Delhi Office", type: "office"}
    ],
    members: [
        {id: 1, name: "sriya", category: "House keeping", age: 25, sex: "Female", address: "Local area"},
        {id: 2, name: "saurav", category: "worker", age: 30, sex: "Male", address: "Near market"},
        {id: 3, name: "vedt", category: "relative", age: 28, sex: "Male", address: "Family home"}
    ],
    cameras: [
        {id: 1, name: "Main Cam", location: "main"},
        {id: 2, name: "Front Left side Cam", location: "front-left"},
        {id: 3, name: "Front Right Cam", location: "front-right"},
        {id: 4, name: "Back left Cam", location: "back-left"},
        {id: 5, name: "Back right cam", location: "back-right"},
        {id: 6, name: "Cam 6", location: "cam6"},
        {id: 7, name: "Cam 7", location: "cam7"}
    ],
    memberCategories: [
        "Family member",
        "relatives", 
        "House Cleaning",
        "Paper",
        "milk",
        "vegetables boy"
    ],
    maxLocations: 10
};

// DOM elements
const screens = {
    home: document.getElementById('home-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    liveFeed: document.getElementById('live-feed-screen'),
    emergency: document.getElementById('emergency-screen'),
    unknown: document.getElementById('unknown-screen'),
    addMember: document.getElementById('add-member-screen'),
    removeMember: document.getElementById('remove-member-screen')
};

const modals = {
    createLocation: document.getElementById('create-location-modal'),
    confirmation: document.getElementById('confirmation-modal')
};

// Utility functions
function showScreen(screenId) {
    console.log('Switching to screen:', screenId);
    
    // Hide all screens
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        }
    });
    
    // Show target screen
    const targetScreen = screens[screenId] || document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
        console.log('Screen switched successfully to:', screenId);
    } else {
        console.error('Screen not found:', screenId);
    }
}

function showModal(modalId) {
    const modal = modals[modalId] || document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        
        // Focus the first input if it exists
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

function hideModal(modalId) {
    const modal = modals[modalId] || document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const currentScreen = document.querySelector('.screen.active .main-content');
    if (currentScreen) {
        currentScreen.insertBefore(messageDiv, currentScreen.firstChild);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

function generateId() {
    return Date.now() + Math.random();
}

// Location management
function renderLocations() {
    const locationsList = document.getElementById('locations-list');
    if (!locationsList) return;
    
    locationsList.innerHTML = '';
    
    appState.locations.forEach(location => {
        const button = document.createElement('button');
        button.className = 'location-btn';
        button.textContent = location.name;
        button.dataset.locationId = location.id;
        button.dataset.locationName = location.name;
        
        // Add click event listener directly
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Location button clicked:', location.name);
            selectLocation(location);
        });
        
        // Add keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Location button activated via keyboard:', location.name);
                selectLocation(location);
            }
        });
        
        locationsList.appendChild(button);
    });
    
    console.log('Locations rendered:', appState.locations.length);
}

function selectLocation(location) {
    console.log('Selecting location:', location);
    appState.currentLocation = location;
    
    const dashboardTitle = document.getElementById('dashboard-title');
    if (dashboardTitle) {
        dashboardTitle.textContent = location.name;
    }
    
    showScreen('dashboard');
}

function createNewLocation() {
    if (appState.locations.length >= appState.maxLocations) {
        showMessage(`Maximum ${appState.maxLocations} locations allowed`, 'error');
        return;
    }
    showModal('createLocation');
}

function handleCreateLocationForm(event) {
    event.preventDefault();
    const locationName = document.getElementById('location-name').value.trim();
    
    if (!locationName) {
        showMessage('Please enter a location name', 'error');
        return;
    }
    
    // Check if location already exists
    if (appState.locations.some(loc => loc.name.toLowerCase() === locationName.toLowerCase())) {
        showMessage('Location already exists', 'error');
        return;
    }
    
    const newLocation = {
        id: generateId(),
        name: locationName,
        type: locationName.toLowerCase().includes('office') ? 'office' : 'home'
    };
    
    appState.locations.push(newLocation);
    renderLocations();
    hideModal('createLocation');
    document.getElementById('create-location-form').reset();
    showMessage(`Location "${locationName}" created successfully`);
}

// Member management
function renderMembers() {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;
    
    membersList.innerHTML = '';
    
    appState.members.forEach(member => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-cell">${member.name}</div>
            <div class="table-cell">${member.category}</div>
            <div class="table-cell">
                <button class="remove-member-btn" data-member-id="${member.id}">
                    remove
                </button>
            </div>
        `;
        membersList.appendChild(row);
    });
    
    // Add event listeners to remove buttons
    membersList.querySelectorAll('.remove-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const memberId = parseInt(e.target.dataset.memberId);
            showRemoveConfirmation(memberId);
        });
    });
}

function handleAddMemberForm(event) {
    event.preventDefault();
    
    const memberData = {
        id: generateId(),
        name: document.getElementById('member-name').value.trim(),
        category: document.getElementById('member-category').value,
        age: parseInt(document.getElementById('member-age').value),
        sex: document.querySelector('input[name="sex"]:checked')?.value,
        address: document.getElementById('member-address').value.trim(),
        image: document.getElementById('member-image').files[0]?.name || null
    };
    
    // Validation
    if (!memberData.name || !memberData.category || !memberData.age || !memberData.sex || !memberData.address) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (memberData.age < 1 || memberData.age > 120) {
        showMessage('Please enter a valid age between 1 and 120', 'error');
        return;
    }
    
    // Check if member already exists
    if (appState.members.some(member => member.name.toLowerCase() === memberData.name.toLowerCase())) {
        showMessage('Member with this name already exists', 'error');
        return;
    }
    
    appState.members.push(memberData);
    event.target.reset();
    showMessage(`Member "${memberData.name}" added successfully`);
    
    // Navigate back to dashboard after short delay
    setTimeout(() => {
        showScreen('dashboard');
    }, 1500);
}

function showRemoveConfirmation(memberId) {
    appState.memberToRemove = memberId;
    showModal('confirmation');
}

function removeMember() {
    if (appState.memberToRemove) {
        const memberIndex = appState.members.findIndex(m => m.id === appState.memberToRemove);
        if (memberIndex !== -1) {
            const memberName = appState.members[memberIndex].name;
            appState.members.splice(memberIndex, 1);
            renderMembers();
            showMessage(`Member "${memberName}" removed successfully`);
        }
        appState.memberToRemove = null;
    }
    hideModal('confirmation');
}

// Camera management
function renderCameras() {
    const cameraGrid = document.getElementById('camera-grid');
    if (!cameraGrid) return;
    
    cameraGrid.innerHTML = '';
    
    appState.cameras.forEach(camera => {
        const button = document.createElement('button');
        button.className = 'camera-btn';
        button.textContent = camera.name;
        button.dataset.camera = camera.name;
        button.addEventListener('click', () => {
            showMessage(`Connecting to ${camera.name}...`);
        });
        cameraGrid.appendChild(button);
    });
}

// Emergency functionality
function initializeEmergencyFeatures() {
    // Image navigation
    const imagesPrev = document.getElementById('images-prev');
    const imagesNext = document.getElementById('images-next');
    const clipsPrev = document.getElementById('clips-prev');
    const clipsNext = document.getElementById('clips-next');
    const sendBtn = document.querySelector('.send-btn');
    const saveMessageBtn = document.querySelector('.save-message-btn');
    
    if (imagesPrev) {
        imagesPrev.addEventListener('click', () => {
            showMessage('Previous image');
        });
    }
    
    if (imagesNext) {
        imagesNext.addEventListener('click', () => {
            showMessage('Next image');
        });
    }
    
    // Clips navigation
    if (clipsPrev) {
        clipsPrev.addEventListener('click', () => {
            showMessage('Previous clip');
        });
    }
    
    if (clipsNext) {
        clipsNext.addEventListener('click', () => {
            showMessage('Next clip');
        });
    }
    
    // Message sending
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const messageBox = document.querySelector('.message-box');
            const message = messageBox?.value.trim();
            
            if (message) {
                showMessage('Emergency message sent successfully');
                messageBox.value = '';
            } else {
                showMessage('Please enter a message', 'error');
            }
        });
    }
    
    // Unknown screen message saving
    if (saveMessageBtn) {
        saveMessageBtn.addEventListener('click', () => {
            const messageArea = document.querySelector('.message-area');
            const message = messageArea?.value.trim();
            
            if (message) {
                showMessage('Message saved successfully');
            } else {
                showMessage('Please enter a message', 'error');
            }
        });
    }
}

// Event listeners setup
function setupEventListeners() {
    // Navigation buttons - with null checks
    const dashboardBack = document.getElementById('dashboard-back');
    const liveFeedBack = document.getElementById('live-feed-back');
    const emergencyBack = document.getElementById('emergency-back');
    const unknownBack = document.getElementById('unknown-back');
    const addMemberBack = document.getElementById('add-member-back');
    const removeMemberBack = document.getElementById('remove-member-back');
    
    if (dashboardBack) dashboardBack.addEventListener('click', () => showScreen('home'));
    if (liveFeedBack) liveFeedBack.addEventListener('click', () => showScreen('dashboard'));
    if (emergencyBack) emergencyBack.addEventListener('click', () => showScreen('dashboard'));
    if (unknownBack) unknownBack.addEventListener('click', () => showScreen('dashboard'));
    if (addMemberBack) addMemberBack.addEventListener('click', () => showScreen('dashboard'));
    if (removeMemberBack) removeMemberBack.addEventListener('click', () => showScreen('dashboard'));
    
    // Home screen buttons
    const createNewBtn = document.getElementById('create-new-btn');
    if (createNewBtn) {
        createNewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            createNewLocation();
        });
    }
    
    // Dashboard buttons
    const liveFeedBtn = document.getElementById('live-feed-btn');
    const emergencyBtn = document.getElementById('emergency-btn');
    const unknownBtn = document.getElementById('unknown-btn');
    const addMemberBtn = document.getElementById('add-member-btn');
    const removeMemberBtn = document.getElementById('remove-member-btn');
    
    if (liveFeedBtn) {
        liveFeedBtn.addEventListener('click', () => {
            renderCameras();
            showScreen('liveFeed');
        });
    }
    
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => showScreen('emergency'));
    }
    
    if (unknownBtn) {
        unknownBtn.addEventListener('click', () => showScreen('unknown'));
    }
    
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => showScreen('addMember'));
    }
    
    if (removeMemberBtn) {
        removeMemberBtn.addEventListener('click', () => {
            renderMembers();
            showScreen('removeMember');
        });
    }
    
    // Modal buttons
    const cancelCreate = document.getElementById('cancel-create');
    const cancelRemove = document.getElementById('cancel-remove');
    const confirmRemove = document.getElementById('confirm-remove');
    
    if (cancelCreate) {
        cancelCreate.addEventListener('click', () => {
            hideModal('createLocation');
            document.getElementById('create-location-form').reset();
        });
    }
    
    if (cancelRemove) {
        cancelRemove.addEventListener('click', () => {
            hideModal('confirmation');
            appState.memberToRemove = null;
        });
    }
    
    if (confirmRemove) {
        confirmRemove.addEventListener('click', removeMember);
    }
    
    // Form submissions
    const createLocationForm = document.getElementById('create-location-form');
    const addMemberForm = document.getElementById('add-member-form');
    
    if (createLocationForm) {
        createLocationForm.addEventListener('submit', handleCreateLocationForm);
    }
    
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', handleAddMemberForm);
    }
    
    // Hamburger menu (placeholder functionality)
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            showMessage('Menu functionality would be implemented here');
        });
    }
    
    // Close modals when clicking outside (with proper event handling)
    Object.values(modals).forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                    if (modal.id === 'create-location-modal') {
                        const form = document.getElementById('create-location-form');
                        if (form) form.reset();
                    }
                    if (modal.id === 'confirmation-modal') {
                        appState.memberToRemove = null;
                    }
                }
            });
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modals
            Object.values(modals).forEach(modal => {
                if (modal && !modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                }
            });
            
            // Reset form if create location modal was closed
            const createForm = document.getElementById('create-location-form');
            if (createForm) createForm.reset();
            appState.memberToRemove = null;
        }
    });
    
    // Form validation enhancements
    const ageInput = document.getElementById('member-age');
    if (ageInput) {
        ageInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 1) e.target.value = 1;
            if (value > 120) e.target.value = 120;
        });
    }
    
    // File upload feedback
    const memberImage = document.getElementById('member-image');
    if (memberImage) {
        memberImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showMessage('Image file too large. Please select a file under 5MB.', 'error');
                    e.target.value = '';
                    return;
                }
                
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showMessage('Please select a valid image file (JPEG, PNG, GIF, or WebP).', 'error');
                    e.target.value = '';
                    return;
                }
                
                showMessage(`Image "${file.name}" selected`);
            }
        });
    }
}

// Initialize application
function initializeApp() {
    try {
        console.log('Initializing Home Security System...');
        
        // Render initial data
        renderLocations();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize emergency features
        initializeEmergencyFeatures();
        
        // Show home screen
        showScreen('home');
        
        console.log('Home Security System initialized successfully');
        console.log('Current locations:', appState.locations);
    } catch (error) {
        console.error('Error during initialization:', error);
        showMessage('An error occurred during initialization. Please refresh the page.', 'error');
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    initializeApp();
    
    // Additional debugging
    setTimeout(() => {
        console.log('App state after initialization:', appState);
        console.log('Available screens:', Object.keys(screens));
        console.log('Current screen classes:', {
            home: document.getElementById('home-screen')?.className,
            dashboard: document.getElementById('dashboard-screen')?.className
        });
    }, 1000);
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        showScreen,
        showModal,
        hideModal,
        createNewLocation,
        selectLocation,
        renderLocations,
        renderMembers,
        renderCameras
    };
}