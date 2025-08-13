# Form Builder

A full-stack web application for creating, editing, and filling out custom forms with support for various question types, image uploads, and advanced features like drag-and-drop for fill-in-the-blanks and categorization.

## Live Demo

👉 [Live Website](https://form-builder-git-main-harshgeeds-projects.vercel.app/)

---

## Features

- **User Authentication**: Register and log in securely.
- **Form Creation**: Build forms with:
  - Multiple choice (MCQ)
  - Image-based MCQ
  - Categorization (drag-and-drop)
  - Fill in the blanks (drag-and-drop)
  - Passage + comprehension (with sub-questions)
- **Image Uploads**: Upload images directly to Cloudinary for questions and form headers.
- **Form Preview**: See a live preview of your form as users will see it.
- **Form Responses**: Fill and submit forms, with all responses saved.
- **Modern UI**: Built with React, Tailwind CSS, and Vite for a fast, beautiful experience.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Image Hosting**: Cloudinary
- **Deployment**: Vercel (frontend), Render (backend)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/HarshGeed/Form-Builder.git
cd Form-Builder
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```
VITE_API_BASE=https://your-backend-url/api
```
Start the frontend:
```bash
npm run dev
```

---

## Usage
- Register or log in.
- Create a new form, add questions of various types, and upload images as needed.
- Preview your form and share the link for others to fill it out.
- View and manage responses.

---

## Deployment
- **Frontend**: Deployed on Vercel ([Live Link](https://form-builder-git-main-harshgeeds-projects.vercel.app/))
- **Backend**: Deployed on Render ([API Link](https://form-builder-yl00.onrender.com/api))

---

## License

MIT

---

## Author

- [Harsh Geed](https://github.com/HarshGeed)
