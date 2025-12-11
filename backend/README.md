# Trade Talkies Backend

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Copy `.env.example` to `.env` and fill in the values.
    ```bash
    cp .env.example .env
    ```
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `FIREBASE_SERVICE_ACCOUNT`: The content of your Firebase Admin SDK service account JSON file. You can paste the JSON content directly (minified) or provide a path to the file.

3.  **Run Server:**
    *   Development:
        ```bash
        npm run dev
        ```
    *   Production:
        ```bash
        npm start
        ```

## API Endpoints

### Auth
*   **POST /api/users**
    *   Headers: `Authorization: Bearer <firebase_token>`
    *   Body: `{ "username": "optional" }`
    *   Description: Create or update user profile.

*   **GET /api/users/me**
    *   Headers: `Authorization: Bearer <firebase_token>`
    *   Description: Get current user profile.

### Messages
*   **GET /api/messages/:channelId?**
    *   Headers: `Authorization: Bearer <firebase_token>`
    *   Query: `limit=50`, `before=<timestamp>`
    *   Description: Get messages for a channel.

*   **POST /api/messages**
    *   Headers: `Authorization: Bearer <firebase_token>`
    *   Body: `{ "message": "text", "channelId": "general", "type": "text" }`
    *   Description: Send a message (HTTP fallback).

## Socket.IO Events

*   **Connection:**
    *   Auth: `{ token: <firebase_token> }`

*   **Emit: join_channel**
    *   Data: `channelId` (string)

*   **Emit: send_message**
    *   Data: `{ "message": "...", "channelId": "...", "type": "..." }`

*   **Listen: receive_message**
    *   Data: Message object
