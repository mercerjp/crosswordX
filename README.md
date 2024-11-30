
# Crossword Puzzle API

This README provides a detailed guide on how to set up, run, and use the Crossword Puzzle API.

---

## **Table of Contents**

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Available Endpoints](#available-endpoints)
  - [POST /api/v1/register](#post-apiv1register)
  - [POST /api/v1/login](#post-apiv1login)
  - [POST /api/v1/prompt](#post-apiv1prompt)
- [How to Use](#how-to-use)
- [Error Handling](#error-handling)
- [License](#license)

---

## **Overview**

The Crossword Puzzle API allows users to:
1. Register and login with secure authentication.
2. Generate crossword puzzles based on themes using OpenAI's GPT API.
3. Receive the crossword answers in CSV format.

---

## **Prerequisites**

Ensure the following tools are installed on your system:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- SQLite for the database

---

## **Setup and Installation**

1. Clone the repository:

   ```bash
   git clone crosswordX
   cd crosswordX
   ```

2. Install dependencies:

   ```bash
   npm install
   ```


3. Run the server:

   ```bash
   node index.js
   ```

   The server will run on `http://localhost:3000` or the port specified in the `.env` file.

---

## **Environment Variables**

Create a `.env` file in the root directory and add the following variables:

```env
PORT=3000
JWT_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

Replace `your_secret_key` and `your_openai_api_key` with your actual secret key and OpenAI API key.

---

## **Available Endpoints**

### **POST /api/v1/register**

Register a new user.

- **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

- **Response:**
  ```json
  {
    "message": "User created successfully",
    "userId": 1
  }
  ```

### **POST /api/v1/login**

Log in to generate a JWT token.

- **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

- **Response:**
  ```json
  {
    "token": "your_jwt_token"
  }
  ```

### **POST /api/v1/prompt**

Generate a crossword puzzle based on a theme.

- **Headers:**
  - `x-api-key`: Your JWT token

- **Request Body:**
  ```json
  {
    "phrase": "bees",
    "size": 15
  }
  ```

  `size` is optional and defaults to 15.

- **Response:**
  ```json
  {
    "csv": "Position, Answer, Clue\n1A, HONEY, Sweet substance made by bees\n1D, QUEEN, Female bee responsible for laying eggs..."
  }
  ```

---

## **How to Use**

1. **Register a User:**
   - Make a `POST` request to `/api/v1/register` with a `username` and `password`.

2. **Login to Get a Token:**
   - Use `/api/v1/login` to log in and get a JWT token.

3. **Generate a Crossword Puzzle:**
   - Use `/api/v1/prompt` with the token in the `x-api-key` header.
   - Provide a `phrase` (theme) and optionally a `size` for the crossword puzzle.

---

## **Error Handling**

The API returns error messages in the following format:

- **400 Bad Request:**
  ```json
  {
    "error": "Invalid username or password"
  }
  ```

- **401 Unauthorized:**
  ```json
  {
    "error": "Access denied. No token provided."
  }
  ```

- **500 Internal Server Error:**
  ```json
  {
    "error": "An error occurred while processing your request."
  }
  ```

---

## **License**

This project is owned by James Mercer and Dale Millington.
