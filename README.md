# TechTalk App

## Problem Statement
Technology enthusiasts want to share knowledge, discuss tech topics, and stay updated with the latest trends. The TechTalk App aims to address these needs by providing a platform for users to register, authenticate, post discussions, rate and comment on posts, and manage their profiles and preferences.

## MVP Features

### React Frontend

#### User Registration and Authentication
- **Registration and Login Forms**: Create forms with fields for username, email, and password.
- **Client-side Validation**: Ensure form inputs are validated before submission.
- **Integration with Backend API**: Connect forms to backend API endpoints for user registration and authentication.

#### Post Upload
- **Upload Form**: Allow users to submit discussion posts, questions, and images.

#### User Profile
- **Saved Favorite Posts**: Enable users to save and view their favorite posts.
- **Profile Management with Tech Interests**: Allow users to update their personal information and tech interests.
- **Profile Management**: Enable users to update their personal information.

#### Rating and Comments
- **User Reviews and Ratings for Posts**: Allow users to review and rate posts.
- **Display of Average Ratings and Review Summaries**: Show average ratings and summaries for each post.

### Flask Backend

#### User Management
- **API Endpoints for User Registration, Login, and Authentication**: Use Flask routes to handle user management.
- **JWT Authentication**: Secure endpoints and validate user sessions with JWT tokens.

#### Database Integration
- **Relational Database (e.g., PostgreSQL)**: Store user information, posts, and reviews.
- **SQLAlchemy ORM**: Interact with the database within Flask applications.

#### Post Management API
- **CRUD Operations for Posts**: Create, read, update, and delete posts.
- **Search Algorithm for Filtering Posts**: Allow users to filter posts by title or content.

#### Rating and Comments
- **Submit and Retrieve Reviews**: Create endpoints for submitting and retrieving post ratings and comments.

#### User Profile
- **Manage Favorites**: Develop endpoints for saving, retrieving, and removing favorite posts.
- **Profile Management**: Create endpoints for updating user profile information.

#### User Profile and Preferences Endpoint
- **Manage User Profiles**: Develop endpoints for managing user profiles, updating personal information, and setting preferences.
- **Save Favorite Posts and Create Wishlists**: Provide functionality to save favorite posts and create wishlists.

#### Authentication Middleware
- **Secure API Endpoints**: Use middleware to validate user authentication with JWT tokens.
- **Enforce Authentication Requirements**: Use decorators to enforce authentication for accessing protected resources.

#### Logging and Monitoring
- **Log Critical Events**: Monitor system health to identify and resolve issues proactively.
- **Log User Actions, API Requests, and Errors**: Track system activity and troubleshoot problems.

## Getting Started

### Prerequisites
- Node.js
- npm (Node Package Manager)
- Python
- Flask
- PostgreSQL

### Installation

#### Frontend
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/TechTalk-App.git
2. Navigate to the project directory:
   ```sh
   cd TechTalk-App/frontend/   
3. Install dependencies:
   ```sh
   npm install
4. Start the development server:
   ```sh
   npm start
### Backend

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/TechTalk-App.git
2. Navigate to the directory:
   ```sh
   cd TechTalk-App/backend
3. Install dependencies using pipenv:
   ```sh
   pipenv install
4. Activate the virtual environment:
   ```sh
   pipenv shell
5. Set up the database:
   ```sh
   flask db init
   flask db migrate
   flask db upgrade
6. Start the development server:
   ```sh
   flask run
### Usage

1. Register a new user account or log in with existing credentials.
2. Create and upload discussion posts.
3. Rate and comment on posts.
4. Manage your profile and save favorite posts.

### Contribution Workflow

1. First, while on the 'main' branch retrieve any changes to the remote repository:
   ```sh
   git pull
2. Create a new branch:
   ```sh
   git chechkout -b your-feature-name
3. Complete and commit your tasks:
   ```sh
   git add .
   git commit -m "your commit message"
   git push -u origin your-feature-name
4. Once satisfied with your work:
   ```sh
   git switch main
   git pull origin main
   git merge your-feature-name
5. Fix any merge conflicts:
   ```sh
   git push origin main
6. Once your changes have been added to the main branch and no merge conflicts exist, delete your branch:
   ```sh
   git branch -d your-feature-name
### License

This project is licensed under the MIT License. See the LICENSE file for details.

### Team Members

**David Mugambi** - davidmugambi104@gmail.com <br><br>
**Daniel Kamanthi** - dani3lkamanthi@gmail.com <br><br>
**Elvis Kiongo** - kiongoelviswork@gmail.com




