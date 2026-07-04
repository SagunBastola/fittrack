# 🏋️‍♂️ FitTrack Pro

FitTrack Pro is a full-stack health and fitness tracking application. It features a robust Python FastAPI backend and a modern, responsive React frontend. Users can securely register, track their daily nutrition, log workout sessions, and calculate dynamic macronutrient targets based on their physical profile.

---

## ✨ Features

* **Secure Authentication:** OAuth2-compatible JWT (JSON Web Token) authentication with secure password hashing (`pwdlib`).
* **Workout Tracking:** Log exercise sessions including sets, reps, and weight used.
* **Nutrition Logging:** Track daily food intake with automatic aggregations of total calories, protein, carbs, and fats.
* **Macro Calculator:** Dynamically computes target daily calories and macronutrients based on the user's height, weight, activity level, and fitness goals.
* **Modern Dashboard:** A sleek, dark-themed frontend built with React and Tailwind CSS.
* **Data Export:** Generate a summary of lifetime fitness metrics.

---

## 🛠️ Tech Stack

**Backend**
* [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework for APIs
* [SQLAlchemy](https://www.sqlalchemy.org/) - ORM for database interactions
* [SQLite](https://www.sqlite.org/) - Lightweight local database
* [Pydantic](https://docs.pydantic.dev/) - Data validation and settings management
* [PyJWT](https://pyjwt.readthedocs.io/) & [pwdlib](https://github.com/frankie567/pwdlib) - Secure JWT generation and password hashing

**Frontend**
* [React 19](https://react.dev/) - UI Library
* [Vite](https://vitejs.dev/) - Next-generation frontend tooling
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📂 Project Structure

```text
fittrack/
├── app/                        # FastAPI Backend Application
│   ├── main.py                 # Application entry point & router mounting
│   ├── database.py             # SQLAlchemy engine and session setup
│   ├── auth/                   # Authentication Module
│   │   ├── router.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── dependencies.py
│   │   └── utils.py
│   ├── workouts/               # Workout Tracking Module
│   ├── nutrition/              # Nutrition Logging Module
│   └── analytics/              # Macro & Data Export Module
│
├── fittrack-frontend/          # React + Vite Frontend Application
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind styling configuration
│   └── src/
│       ├── App.jsx             # Main React Application & Dashboard
│       ├── main.jsx            # React DOM mounting
│       └── index.css           # Tailwind CSS directives
│
└── README.md