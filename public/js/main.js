// Main JavaScript for the portfolio website

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadGallery();
});

// Smooth scroll to gallery
function scrollToGallery() {
    document.getElementById('gallery').scrollIntoView({
        behavior: 'smooth'
    });
}

// Load photographer profile
async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const profile = await response.json();
            
            // Update page title and navigation
            const photographerName = document.getElementById('photographer-name');
            if (photographerName) {
                photographerName.textContent = profile.name || 'Photographer Portfolio';
            }
            
            // Update about section
            const aboutName = document.getElementById('about-name');
            const aboutBio = document.getElementById('about-bio');
            const contactEmail = document.getElementById('contact-email');
            
            if (aboutName) aboutName.textContent = profile.name || 'Professional Photographer';
            if (aboutBio) aboutBio.textContent = profile.bio || 'Professional photographer with a passion for capturing life\'s beautiful moments.';
            if (contactEmail) contactEmail.textContent = profile.email || 'contact@example.com';
            
            // Update page title
            document.title = `${profile.name || 'Photographer'} Portfolio`;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load gallery
async function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    
    try {
        // Show loading state
        galleryGrid.innerHTML = '<div class="loading">Loading artworks...</div>';
        
        const response = await fetch('/api/artworks');
        if (response.ok) {
            const artworks = await response.json();
            
            if (artworks.length === 0) {
                galleryGrid.innerHTML = `
                    <div class="no-artworks">
                        <h3>No artworks available</h3>
                        <p>Check back soon for new photography!</p>
                    </div>
                `;
                return;
            }
            
            // Create gallery items
            galleryGrid.innerHTML = artworks.map(artwork => `
                <div class="gallery-item" onclick="openModal(${artwork.id})">
                    <img src="${artwork.image_path}" alt="${artwork.title}" class="gallery-image" loading="lazy">
                    <div class="gallery-info">
                        <h3 class="gallery-title">${artwork.title}</h3>
                        <p class="gallery-description">${artwork.description || ''}</p>
                        <p class="gallery-location">${artwork.location || ''}</p>
                    </div>
                </div>
            `).join('');
        } else {
            throw new Error('Failed to load artworks');
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryGrid.innerHTML = `
            <div class="loading">
                <h3>Error loading artworks</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Modal functions
async function openModal(artworkId) {
    try {
        const response = await fetch(`/api/artworks/${artworkId}`);
        if (response.ok) {
            const artwork = await response.json();
            
            // Update modal content
            document.getElementById('modalImage').src = artwork.image_path;
            document.getElementById('modalImage').alt = artwork.title;
            document.getElementById('modalTitle').textContent = artwork.title;
            document.getElementById('modalDescription').textContent = artwork.description || '';
            document.getElementById('modalLocation').textContent = artwork.location || 'Location not specified';
            
            // Show modal
            document.getElementById('imageModal').style.display = 'block';
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error loading artwork details:', error);
    }
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.getElementById('imageModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}