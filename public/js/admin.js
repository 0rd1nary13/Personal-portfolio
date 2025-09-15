// Admin JavaScript functionality

let currentArtworkId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            showAdminDashboard();
            loadArtworks();
            loadProfile();
        } else {
            showLoginForm();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLoginForm();
    }
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showAdminDashboard() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Artwork form
    document.getElementById('artwork-form').addEventListener('submit', handleArtworkSubmit);
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', handleProfileSubmit);
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAdminDashboard();
            loadArtworks();
            loadProfile();
            event.target.reset();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Handle logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        showLoginForm();
        document.getElementById('login-form').reset();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Tab functions
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Load artworks
async function loadArtworks() {
    const artworksList = document.getElementById('artworks-list');
    
    try {
        artworksList.innerHTML = '<div class="loading-message">Loading artworks...</div>';
        
        const response = await fetch('/api/artworks');
        if (response.ok) {
            const artworks = await response.json();
            
            if (artworks.length === 0) {
                artworksList.innerHTML = '<div class="loading-message">No artworks found. Add your first artwork!</div>';
                return;
            }
            
            artworksList.innerHTML = artworks.map(artwork => `
                <div class="artwork-card">
                    <img src="${artwork.image_path}" alt="${artwork.title}" class="artwork-image" loading="lazy">
                    <div class="artwork-details">
                        <h3 class="artwork-title">${artwork.title}</h3>
                        <p class="artwork-description">${artwork.description || 'No description'}</p>
                        <p class="artwork-location">${artwork.location || 'Location not specified'}</p>
                        <div class="artwork-actions">
                            <button class="btn-edit" onclick="editArtwork(${artwork.id})">Edit</button>
                            <button class="btn-danger" onclick="deleteArtwork(${artwork.id}, '${artwork.title}')">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            throw new Error('Failed to load artworks');
        }
    } catch (error) {
        console.error('Error loading artworks:', error);
        artworksList.innerHTML = '<div class="loading-message">Error loading artworks. Please try again.</div>';
    }
}

// Show artwork form
function showArtworkForm(isEdit = false) {
    document.getElementById('artworkForm').style.display = 'block';
    document.getElementById('formTitle').textContent = isEdit ? 'Edit Artwork' : 'Add New Artwork';
    
    if (!isEdit) {
        document.getElementById('artwork-form').reset();
        document.getElementById('artworkId').value = '';
        document.getElementById('currentImage').style.display = 'none';
        currentArtworkId = null;
    }
    
    // Scroll to form
    document.getElementById('artworkForm').scrollIntoView({ behavior: 'smooth' });
}

function hideArtworkForm() {
    document.getElementById('artworkForm').style.display = 'none';
    document.getElementById('form-error').style.display = 'none';
}

// Edit artwork
async function editArtwork(id) {
    try {
        const response = await fetch(`/api/artworks/${id}`);
        if (response.ok) {
            const artwork = await response.json();
            
            // Fill form with artwork data
            document.getElementById('artworkId').value = artwork.id;
            document.getElementById('artworkTitle').value = artwork.title;
            document.getElementById('artworkDescription').value = artwork.description || '';
            document.getElementById('artworkLocation').value = artwork.location || '';
            
            // Show current image
            document.getElementById('currentImagePreview').src = artwork.image_path;
            document.getElementById('currentImage').style.display = 'block';
            
            currentArtworkId = artwork.id;
            showArtworkForm(true);
        } else {
            alert('Error loading artwork details');
        }
    } catch (error) {
        console.error('Error loading artwork:', error);
        alert('Error loading artwork details');
    }
}

// Handle artwork form submission
async function handleArtworkSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const errorDiv = document.getElementById('form-error');
    const isEdit = !!currentArtworkId;
    
    try {
        const url = isEdit ? `/api/artworks/${currentArtworkId}` : '/api/artworks';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            hideArtworkForm();
            loadArtworks();
            alert(isEdit ? 'Artwork updated successfully!' : 'Artwork added successfully!');
        } else {
            errorDiv.textContent = data.error || 'Error saving artwork';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error submitting artwork:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Delete artwork
async function deleteArtwork(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/artworks/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadArtworks();
            alert('Artwork deleted successfully');
        } else {
            alert(data.error || 'Error deleting artwork');
        }
    } catch (error) {
        console.error('Error deleting artwork:', error);
        alert('Connection error. Please try again.');
    }
}

// Load profile
async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const profile = await response.json();
            
            document.getElementById('profileName').value = profile.name || '';
            document.getElementById('profileEmail').value = profile.email || '';
            document.getElementById('profileBio').value = profile.bio || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Handle profile form submission
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        bio: formData.get('bio')
    };
    
    const errorDiv = document.getElementById('profile-error');
    const successDiv = document.getElementById('profile-success');
    
    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Profile updated successfully!';
            successDiv.style.display = 'block';
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        } else {
            errorDiv.textContent = data.error || 'Error updating profile';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// File input preview
document.getElementById('artworkImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            event.target.value = '';
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only image files (JPEG, PNG, GIF, WebP) are allowed');
            event.target.value = '';
            return;
        }
    }
});