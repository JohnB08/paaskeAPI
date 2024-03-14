# Paske API

This is an Express.js application for managing a quiz system. It allows users to create groups, fetch questions, and submit answers.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation
1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies using npm or yarn:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## Usage
To run the server locally:
```bash
npm start
The server will start listening on port 3000 by default. You can change the port by modifying the port variable in index.js.

API Endpoints
GET /new_group

Description: Creates a new group for the quiz.
Request headers:
username (string, required): Username to create the group.
Response:
Success (200 OK):
```
```json
{
  "success": {
    "message": "Groupname saved, Quiz Initiated",
    "api_key": "<api_key>"
  }
}
```
```bash
Error (404 Not Found):
```
```json
{
  "error": {
    "message": "Missing Groupname"
  }
}
```