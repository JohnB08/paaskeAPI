import express from "express";
import cors from "cors";
import { createNewUser, validateUserToken } from "./userfuncs/createUser.js";
import { validateBodyasObject, validateTokenAsString, validateUsernameAsString } from "./userfuncs/tokenValidation.js";
import { getAnswer, getNextQuestion, getUserID, initializeServer } from "./pgFuncs/dbfuncs.js";
import swaggerUi from "swagger-ui-express";
import markdownit from "markdown-it";
import hljs from "highlight.js";
import fs from "fs";
import yaml from "yamljs";
const paskeApi = express();
const port = 3000;
const swaggerDock = yaml.load("./apiDocs/swagger.yaml");
paskeApi.use(express.json());
paskeApi.use(cors());
paskeApi.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDock, {
    customCss: '.swagger-ui .renderedMarkdown pre code { background-color: #333333; color: #f8f4f2; }'
}));
const serverInit = await initializeServer();
console.log(serverInit);
const md = markdownit({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            }
            catch (error) {
                console.log(error);
            }
        }
        return "";
    },
    html: true,
});
/* Redirects a "/" to the readme section */
paskeApi.get("/", (req, res) => {
    res.redirect("/readme");
});
/* Serves the readme.md file to the user. runs it through the markdown-it package first for highlighting and propper html conversion. */
paskeApi.get("/readme", (req, res) => {
    const filepath = "./readme.md";
    fs.readFile(filepath, "utf8", (err, data) => {
        if (err) {
            return res.status(400).json({
                error: {
                    message: "Missing Readme"
                }
            });
        }
        else {
            const html = md.render(data.toString());
            return res.status(200).send(html);
        }
    });
});
/* Tries to post a new group to the postgres database */
paskeApi.get("/new_group", async (req, res) => {
    const username = req.headers.group_name;
    const usernameValidation = validateUsernameAsString(username);
    if (!usernameValidation) {
        return res.status(404).json({
            error: {
                message: "Missing Groupname"
            }
        });
    }
    const postUser = await createNewUser(username);
    if (postUser.error) {
        return res.status(500).json({
            error: {
                message: "Internal Server Error"
            }
        });
    }
    return res.status(200).json({
        success: {
            message: "Groupname saved, Quiz Initiated, Good luck!",
            api_key: postUser.data
        }
    });
});
/* /question serves the next unanswered question as response. requires api_key. */
paskeApi.get("/question", async (req, res) => {
    const token = req.headers.api_key;
    const tokenExists = validateTokenAsString(token);
    if (!tokenExists) {
        return res.status(401).json({
            error: {
                message: "Invalid Api Key."
            }
        });
    }
    const getUsername = await validateUserToken(token);
    if (!getUsername.success || typeof getUsername.data === "undefined") {
        return res.status(401).json({
            error: {
                message: getUsername.error
            }
        });
    }
    const username = getUsername.data;
    const fetchedUserID = await getUserID(username);
    if (!fetchedUserID.success || typeof fetchedUserID.data === "undefined") {
        return res.status(500).json({
            error: {
                message: "internal server error"
            }
        });
    }
    const userID = fetchedUserID.data;
    const nextQuestion = await getNextQuestion(userID);
    if (!nextQuestion.success && typeof nextQuestion.data === "undefined") {
        return res.status(500).json({
            error: {
                message: nextQuestion.error
            }
        });
    }
    if (nextQuestion.success && typeof nextQuestion.data === "undefined") {
        return res.status(200).json({
            success: {
                message: "Congratulations! You're Done!"
            }
        });
    }
    if (typeof nextQuestion.data !== "undefined") {
        return res.status(200).json({
            success: {
                message: "Here comes the next question:",
                question_id: nextQuestion.data[0].questionID,
                question: nextQuestion.data[0].question,
            }
        });
    }
});
/* POST to /question checks the provided answer to the provided question_id and tries to either serve "wrong answer" or the next question. */
paskeApi.post("/question", async (req, res) => {
    const token = req.headers.api_key;
    const body = req.body;
    const bodyExists = validateBodyasObject(body);
    if (!bodyExists) {
        return res.status(400).json({
            error: {
                message: "Missing answer and/or questionID"
            }
        });
    }
    const tokenExists = validateTokenAsString(token);
    if (!tokenExists) {
        return res.status(401).json({
            error: {
                message: "Invalid Api Key."
            }
        });
    }
    const getUsername = await validateUserToken(token);
    if (!getUsername.success || typeof getUsername.data === "undefined") {
        return res.status(401).json({
            error: {
                message: getUsername.error
            }
        });
    }
    const username = getUsername.data;
    const fetchedUserID = await getUserID(username);
    if (!fetchedUserID.success || typeof fetchedUserID.data === "undefined") {
        return res.status(500).json({
            error: {
                message: "internal server error",
                error: fetchedUserID.error
            }
        });
    }
    const userID = fetchedUserID.data;
    const { questionId, answer } = body;
    const checkAnswer = await getAnswer(userID, answer.toLowerCase(), questionId);
    if (!checkAnswer.success || typeof checkAnswer.answer === "undefined") {
        return res.status(500).json({
            error: {
                message: "internal server error",
                error: checkAnswer.error
            }
        });
    }
    if (typeof checkAnswer.answer === "boolean" && checkAnswer.answer === false) {
        return res.status(401).json({
            error: {
                message: "Wrong Answer!"
            }
        });
    }
    if (typeof checkAnswer.answer === "boolean" && checkAnswer.answer === true) {
        const nextQuestion = await getNextQuestion(userID);
        if (!nextQuestion.success && typeof nextQuestion.data === "undefined") {
            return res.status(500).json({
                error: {
                    message: nextQuestion.error
                }
            });
        }
        if (nextQuestion.success && typeof nextQuestion.data === "undefined") {
            return res.status(200).json({
                success: {
                    message: "Congratulations! You're Done!"
                }
            });
        }
        if (typeof nextQuestion.data !== "undefined") {
            return res.status(200).json({
                success: {
                    message: "Here comes the next question:",
                    question_id: nextQuestion.data[0].questionID,
                    question: nextQuestion.data[0].question,
                }
            });
        }
    }
});
/* It listens on variable port. */
paskeApi.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
