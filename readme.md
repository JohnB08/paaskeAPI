<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/night-owl.min.css">

# Paske API

This is an Express.js application for managing a quiz system. It allows users to create groups, fetch questions, and submit answers. <br>
This readme goes through what is needed if you fork and reuse this elsewhere. If you are interested in using the quiz feature, <br> check out
the <a href="https://paaskeapi.onrender.com/doc">docs</a>

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation
1. Clone this repository to your local machine. <a href="https://github.com/JohnB08/paaskeAPI">Link to repository</a>
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
npm run start
```
The server will start listening on port 3000 by default. You can change the port by modifying the port variable in server.ts. <br>
This server requires a connection to a postgres database to function. <br>
Either connect it to a postgres image running locally, or a postgres database hosted elsewhere. <br>
You need to include a .env file in the root folder with the following values:

```toml
POSTGRES_PASSWORD="<your database password>"
POSTGRES_USER="<your username>"
POSTGRES_DB="<your database name>"
POSTGRES_HOST="<the database host>"
POSTGRES_PORT="<the database port>"
JWT_SECRET="<secret key for jwt generation>"
```

## API Endpoints

### GET /new_group
Description: Creates a new group for the quiz. <br>
Request headers: <br>
username (string, required): Username to create the group. <br>
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

Error (400 Bad Request):
```json
{
  "error": {
    "message": "Missing Groupname"
  }
}
```

### GET /question

Description: Fetches the next question for the user. <br>
Request headers: <br>
api_key (string, required): API key for authentication. <br>


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

Description: Submits the answer to the current question. <br>
Request headers: <br>
api_key (string, required): API key for authentication. <br>

Request body:
```json
{
  "answer": "<user_answer>",
  "questionId": "<question_id>"
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
API documentation is available at <a href="https://paaskeapi.onrender.com/doc">/doc</a>. <br> You can access it through your browser after starting the server.

### Contributing
Contributions are welcome! Feel free to open issues or pull requests.

### License
This project is licensed under the MIT License.

<style>
  body{
    display: flex;
    flex-direction: column;
    align-content: center;
    background-color: #F4F6F4;
  }
  .language-json, .language-bash, .language-toml{
    display: inline-block;
    background-color: #333333;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px; 
    padding-bottom: 10px;
    border-radius: 10px;
  }
  pre code {
    color: #f8f4f2;
  }
</style>