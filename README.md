# Photographer Portfolio Website

A modern, responsive portfolio website designed specifically for photographers. This application provides a complete solution for showcasing photography work with full CRUD (Create, Read, Update, Delete) functionality and an admin panel for content management.

## Features

### Public Features
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Photo Gallery**: Grid-based layout with hover effects and modal view
- **Image Modal**: Click any photo to view in full size with details
- **About Section**: Personal statement and contact information
- **Smooth Navigation**: Smooth scrolling between sections
- **Professional Styling**: Modern gradient hero section with clean typography

### Admin Features
- **Secure Authentication**: Protected admin panel with session management
- **Artwork Management**: Full CRUD operations for photography works
- **Image Upload**: Support for multiple image formats with size validation
- **Profile Management**: Update personal information, bio, and contact details
- **Responsive Admin**: Mobile-friendly admin interface

### Technical Features
- **Node.js Backend**: Express.js server with RESTful API
- **SQLite Database**: Lightweight database for storing artworks and user profile
- **File Upload**: Multer-based image upload with validation
- **Session Management**: Secure user authentication
- **Modern Frontend**: Vanilla JavaScript with modern ES6+ features

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/0rd1nary13/Personal-portfolio.git
   cd Personal-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Access the website**:
   - Public site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the default credentials immediately after first login for security.

## Usage

### For Photographers

1. **Access Admin Panel**: Navigate to `/admin` and log in
2. **Update Profile**: Go to "Profile Settings" to update your name, email, and biography
3. **Add Artworks**: Use "Manage Artworks" to upload photos with titles, descriptions, and locations
4. **Manage Content**: Edit or delete existing artworks as needed

### For Visitors

1. **Browse Gallery**: View all photography works in the responsive gallery
2. **View Details**: Click any image to see full size with title, description, and location
3. **Contact Information**: Find photographer details in the About section

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout  
- `GET /api/auth/status` - Check authentication status

### Profile Management
- `GET /api/profile` - Get profile information
- `PUT /api/profile` - Update profile information

### Artwork Management
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get specific artwork
- `POST /api/artworks` - Create new artwork (requires auth + image upload)
- `PUT /api/artworks/:id` - Update artwork (requires auth)
- `DELETE /api/artworks/:id` - Delete artwork (requires auth)

## File Structure

```
Personal-portfolio/
├── database/           # SQLite database files
├── public/            # Static assets
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side JavaScript
│   ├── images/       # Static images
│   └── uploads/      # User-uploaded images
├── views/            # HTML templates
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Login username
- `password`: Hashed password
- `name`: Display name
- `email`: Contact email
- `bio`: Biography text
- `created_at`: Creation timestamp

### Artworks Table
- `id`: Primary key
- `title`: Artwork title
- `description`: Artwork description
- `location`: Photo location
- `image_path`: Path to image file
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Customization

### Styling
- Modify `/public/css/styles.css` for main site styling
- Modify `/public/css/admin.css` for admin panel styling
- Color scheme uses modern blues and grays - easy to customize

### Content
- Update the hero section text in `/views/index.html`
- Modify the default user data in `server.js`
- Add your own favicon and branding

### Features
- Add additional artwork fields by modifying the database schema
- Implement categories or tags for artworks
- Add social media integration
- Include contact forms

## Security Considerations

1. **Change Default Credentials**: Update admin username/password
2. **Environment Variables**: Use `.env` file for sensitive data in production
3. **File Upload Limits**: Current limit is 10MB per image
4. **Input Validation**: Server-side validation is implemented for all inputs
5. **Session Security**: Sessions are configured with secure settings

## Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production
1. Set production environment variables
2. Use a process manager like PM2
3. Configure reverse proxy (nginx)
4. Use HTTPS in production
5. Consider using a more robust database for high traffic

## Browser Support

- Chrome 70+
- Firefox 65+  
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use this for your photography portfolio!

## Screenshots

### Main Portfolio Site
![Main Site](https://github.com/user-attachments/assets/5243156a-6061-4693-8054-8bf194e98b93)

### Admin Dashboard  
![Admin Panel](https://github.com/user-attachments/assets/7f56b9d2-48d8-4ab4-9139-6dc23b6c9192)

---

**Built with ❤️ for photographers who want to showcase their work professionally online.**
