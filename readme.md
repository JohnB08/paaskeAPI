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
```
The server will start listening on port 3000 by default. You can change the port by modifying the port variable in index.js.

## API Endpoints

### GET /new_group
Description: Creates a new group for the quiz.
Request headers:
username (string, required): Username to create the group.
## Response:

Success (200 OK):
```json
{
  "success": {
    "message": "Groupname saved, Quiz Initiated",
    "api_key": "<api_key>"
  }
}
```

Error (404 Not Found):
```json
{
  "error": {
    "message": "Missing Groupname"
  }
}
```

### GET /question

Description: Fetches the next question for the user.
Request headers:
api_key (string, required): API key for authentication.


### Response:

Success (200 OK):
```json
{
  "success": {
    "message": "Here comes the next question:",
    "question_id": "<question_id>",
    "question": "<question>"
  }
}
```

Error (401 Unauthorized):
```json
{
  "error": {
    "message": "Invalid Api Key."
  }
}
```

### POST /question

Description: Submits the answer to the current question.
Request headers:
api_key (string, required): API key for authentication.

Request body:
```json
{
  "answer": "<user_answer>"
}
```

### Response:

Success (200 OK):

```json
{
  "success": {
    "message": "Here comes the next question:",
    "question_id": "<question_id>",
    "question": "<question>"
  }
}
```

Error (401 Unauthorized):

```json
{
  "error": {
    "message": "Invalid Api Key."
  }
}
```

## Documentation
API documentation is available at /doc. You can access it through your browser after starting the server.

### Contributing
Contributions are welcome! Feel free to open issues or pull requests.

### License
This project is licensed under the MIT License.