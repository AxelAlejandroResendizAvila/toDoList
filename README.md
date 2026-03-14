# 📝 ToDoList

### Modern Collaborative Task Management Platform

TodoList is a **full-stack task management platform** designed for organizing personal and collaborative workflows with a modern UI and secure architecture.

The application allows users to create shared sections, assign tasks, manage priorities, and collaborate with role-based permissions — all within a responsive and intuitive interface.

🌐 **Live Demo:**
https://to-do-list-axelresendiz.vercel.app/

**Demo access:**
Use any email from the demo dataset and password:

```
Password: 123456
```

Example users:

* [axel@example.com](mailto:axel@example.com)
* [sofia.dev@example.com](mailto:sofia.dev@example.com)
* [damian.ops@example.com](mailto:damian.ops@example.com)
* [mario.game@example.com](mailto:mario.game@example.com)

---

# ✨ Features

### 👥 Collaborative Workspaces

* Create **shared sections** with other users
* Role-based access:

  * **ADMIN**
  * **EDITOR**
  * **READER**

### 📋 Task Management

* Create and organize tasks inside sections
* Task priorities:

  * High
  * Medium
  * Low
* Task states:

  * Pending
  * In Progress
  * Completed
* Assign tasks to multiple collaborators

### 🔐 Privacy-Oriented Profiles

Users can only see profiles of collaborators **within shared sections**, protecting user privacy.

### 🎨 Modern UI

* Clean and responsive design
* Component-based architecture
* Smooth user interactions
* Optimized for desktop and mobile

### ⚡ JSON Data Seeding

The system supports **bulk user and task loading through JSON**, useful for testing environments and performance simulations.

---

# 🧱 Tech Stack

## Backend

* **Java 17**
* **Spring Boot**
* **Spring Security (JWT Authentication)**
* **Spring Data JPA**
* **Hibernate**

## Frontend

* **React (Vite)**
* **Modern JavaScript**

## Styling

* **Tailwind CSS**
* **Custom CSS**

## Database

* **PostgreSQL (Neon Serverless)**

## Infrastructure

* **Docker** – Backend containerization
* **Render** – Backend hosting
* **Vercel** – Frontend deployment

---

# 🏗 Architecture

TodoList follows a **decoupled full-stack architecture**.

```
React (Frontend)
      │
      │ REST API
      ▼
Spring Boot API
      │
      ▼
PostgreSQL Database (Neon)
```

Key decisions:

* Stateless authentication using **JWT**
* **Dockerized backend** to ensure environment parity
* Cloud deployment with **Render + Vercel**
* Modular project structure

---

# ⚙️ Local Installation

## 1️⃣ Clone the repository

```
git clone https://github.com/yourusername/todolist.git
cd todolist
```

---

## 2️⃣ Backend

```
cd backend
./mvnw spring-boot:run
```

Or run with Docker:

```
docker build -t todolist-backend .
docker run -p 8080:8080 todolist-backend
```

---

## 3️⃣ Frontend

```
cd frontend
npm install
npm run dev
```

---

# ☁ Infrastructure

TodoList uses a modern cloud deployment pipeline.

**Neon**
Serverless PostgreSQL database.

**Render**
Hosts the Spring Boot backend service.

**Vercel**
Deploys the React frontend with global CDN.

This setup provides:

* scalable infrastructure
* automated deployments
* cloud-native architecture

---

# 📸 Screenshots

Add screenshots here:

* Dashboard
* Task management
* Shared sections
* User profiles
* Task assignment

---

# 🚀 Future Improvements

* Real-time collaboration (WebSockets)
* Notification system
* Activity logs
* Kanban board
* Progressive Web App (PWA)

---

# 👨‍💻 Author

**Axel Alejandro Reséndiz Ávila**

Software Engineering student focused on building scalable full-stack applications and modern web platforms.
