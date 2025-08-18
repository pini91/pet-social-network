# Pet Social Network

A social network application for pet owners to connect, share posts, and find friends for their pets.

## Features

- User authentication and authorization
- Pet profile creation and management
- Social posts with image uploads
- Friend system for connecting with other pet owners
- Comment system on posts
- Search functionality
- Password reset functionality
- Responsive design

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer with Cloudinary integration
- **View Engine**: EJS
- **Session Management**: Express-session with MongoDB store
- **Testing**: Jest with Supertest
- **Linting**: ESLint with Standard config
- **Deployment**: Railway with Nixpacks

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd pet-social-network
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example config/.env
```

4. Configure environment variables in `config/.env`:
```env
# Database
DB_STRING=mongodb+srv://username:password@cluster.mongodb.net/petnetwork

# Application
PORT=3000
NODE_ENV=development

# Session
SESSION_SECRET=your-super-secret-session-key-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

5. Run the application:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

6. Visit `http://localhost:3000` in your browser

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Deployment

### Railway Deployment

This application is configured for deployment on Railway with automatic CI/CD:

1. **Automatic Deployment**: 
   - Push to `main` branch deploys to production
   - Push to `develop` branch deploys to development environment

2. **Environment Variables on Railway**:
   Set these in your Railway project settings:
   ```
   DB_STRING=your-mongodb-connection-string
   SESSION_SECRET=your-session-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email
   EMAIL_PASS=your-email-password
   NODE_ENV=production
   ```

3. **Railway MongoDB**: 
   - Add MongoDB service in Railway
   - Railway automatically provides `MONGO_URL` variable
   - Application prefers `MONGO_URL` over `DB_STRING`

4. **Health Check**: 
   - Railway monitors `/health` endpoint
   - Returns application status and uptime

## CI/CD Pipeline

The application includes comprehensive CI/CD with:

### Continuous Integration (`ci.yml`)
- **Linting**: ESLint with Standard configuration
- **Security Scanning**: GitLeaks for secret detection
- **Dependency Audit**: npm audit for vulnerability scanning
- **Testing**: Jest test suite
- **Triggers**: Push to main/develop, Pull requests to main

### Continuous Deployment (`deploy.yml`)
- **Development**: Auto-deploy from `develop` branch
- **Production**: Auto-deploy from `main` branch
- **Health Checks**: Automated endpoint monitoring
- **Release Management**: GitHub releases for production deployments

### Security Features
- Secret scanning with GitLeaks
- Dependency vulnerability checking
- Environment variable validation
- Graceful shutdown handling
- Railway deployment optimizations

## API Endpoints

### Authentication
- `GET /` - Home page
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /signup` - Signup page
- `POST /signup` - Register user
- `GET /logout` - Logout user

### Posts
- `GET /feed` - View feed
- `GET /profile` - User profile
- `POST /post/createPost` - Create new post
- `PUT /post/likePost/:id` - Like/unlike post
- `DELETE /post/deletePost/:id` - Delete post

### Friends
- `POST /friends/addFriend` - Send friend request
- `POST /friends/acceptFriend` - Accept friend request
- `GET /friends/findFriends` - Find new friends

### Health Check
- `GET /health` - Application health status

## Project Structure

```
├── __test__/              # Test files
├── config/                # Configuration files
│   ├── database.js        # Database connection
│   └── passport.js        # Passport configuration
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
├── models/                # Mongoose models
├── public/                # Static assets
├── routes/                # Express routes
├── views/                 # EJS templates
├── .github/workflows/     # CI/CD pipelines
├── server.js              # Application entry point
└── package.json           # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
