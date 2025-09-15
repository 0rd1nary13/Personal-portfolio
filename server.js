const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'photographer-portfolio-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Set up SQLite database
const db = new sqlite3.Database('./database/portfolio.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    // Users table (for the single photographer)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Artworks table
    db.run(`CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        image_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create default user if none exists
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (!err && row.count === 0) {
            const defaultPassword = bcrypt.hashSync('admin123', 10);
            db.run(`INSERT INTO users (username, password, name, email, bio) 
                    VALUES (?, ?, ?, ?, ?)`,
                ['admin', defaultPassword, 'Photographer Name', 'photographer@example.com', 'Professional photographer with a passion for capturing life\'s beautiful moments.'],
                (err) => {
                    if (err) {
                        console.error('Error creating default user:', err);
                    } else {
                        console.log('Default user created. Username: admin, Password: admin123');
                    }
                });
        }
    });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// Routes
// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Authentication routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.userId = user.id;
        res.json({ success: true, message: 'Logged in successfully' });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: !!req.session.userId });
});

// User profile routes
app.get('/api/profile', (req, res) => {
    db.get("SELECT id, username, name, email, bio FROM users LIMIT 1", (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(user);
    });
});

app.put('/api/profile', requireAuth, (req, res) => {
    const { name, email, bio } = req.body;
    
    db.run("UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?",
        [name, email, bio, req.session.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, message: 'Profile updated successfully' });
        }
    );
});

// Artwork CRUD routes
// Get all artworks
app.get('/api/artworks', (req, res) => {
    db.all("SELECT * FROM artworks ORDER BY created_at DESC", (err, artworks) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(artworks);
    });
});

// Get single artwork
app.get('/api/artworks/:id', (req, res) => {
    const { id } = req.params;
    
    db.get("SELECT * FROM artworks WHERE id = ?", [id], (err, artwork) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }
        res.json(artwork);
    });
});

// Create artwork
app.post('/api/artworks', requireAuth, upload.single('image'), (req, res) => {
    const { title, description, location } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }
    
    const imagePath = '/uploads/' + req.file.filename;
    
    db.run(`INSERT INTO artworks (title, description, location, image_path) VALUES (?, ?, ?, ?)`,
        [title, description, location, imagePath],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Get the created artwork
            db.get("SELECT * FROM artworks WHERE id = ?", [this.lastID], (err, artwork) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json(artwork);
            });
        }
    );
});

// Update artwork
app.put('/api/artworks/:id', requireAuth, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { title, description, location } = req.body;
    
    // Get current artwork to handle image update
    db.get("SELECT * FROM artworks WHERE id = ?", [id], (err, currentArtwork) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!currentArtwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }
        
        let imagePath = currentArtwork.image_path;
        
        // If new image uploaded, update path and delete old image
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
            
            // Delete old image file
            const oldImagePath = path.join(__dirname, 'public', currentArtwork.image_path);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        db.run(`UPDATE artworks SET title = ?, description = ?, location = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [title, description, location, imagePath, id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Get updated artwork
                db.get("SELECT * FROM artworks WHERE id = ?", [id], (err, artwork) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json(artwork);
                });
            }
        );
    });
});

// Delete artwork
app.delete('/api/artworks/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    // Get artwork to delete associated image file
    db.get("SELECT * FROM artworks WHERE id = ?", [id], (err, artwork) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }
        
        // Delete artwork from database
        db.run("DELETE FROM artworks WHERE id = ?", [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Delete associated image file
            const imagePath = path.join(__dirname, 'public', artwork.image_path);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            res.json({ success: true, message: 'Artwork deleted successfully' });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});