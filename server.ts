import express from "express"
import cors from "cors"
import { createNewUser, validateUserToken } from "./userfuncs/createUser.js";
import { validateBodyasObject, validateTokenAsString } from "./userfuncs/tokenValidation.js";
import { getAnswer, getNextQuestion, getUserID, initializeServer } from "./pgFuncs/dbfuncs.js";
import swaggerUi from "swagger-ui-express"
import swaggerFile from "./apiDocs/swagger_ouput.json" assert {type: "json"}
import fs from "fs"
import {marked} from "marked"

const paskeApi = express();
const port = 3000
paskeApi.use(express.json());
paskeApi.use(cors());
paskeApi.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile))

const serverInit = await initializeServer()
console.log(serverInit)


paskeApi.get("/readme", (req, res)=>{
    const filepath = "./readme.md"
    fs.readFile(filepath, "utf8", (err, data)=>{
        if (err){
            res.status(404).json({
                error: {
                    message: "File not Found"
                }
            })
        } else {
            const html = marked(data.toString())
            res.status(200).send(html)
        }
    })
})


paskeApi.get("/new_group", async(req, res)=>{
    const username = req.headers.username as string
    if (!username){
        return res.status(404).json({
            error:{
                message: "Missing Groupname"
            }
        })
    }
    const postUser = await createNewUser(username)
    if (postUser.error){
        return res.status(500).json({
            error: {
                message: "Internal Server Error"
            }
        })
    }
    return res.status(200).json({
        success: {
            message: "Groupname saved, Quiz Initiated",
            api_key: postUser.data
        }
    })
})

paskeApi.get("/question", async(req, res)=>{
    const token = req.headers.api_key
    const tokenExists = validateTokenAsString(token)
    if (!tokenExists){
        return res.status(401).json({
            error:{
                message: "Invalid Api Key."
            }
        })
    }
    const getUsername = await validateUserToken(token)
    if (!getUsername.success || typeof getUsername.data === "undefined"){
        return res.status(401).json({
            error:{
                message: getUsername.error
            }
        })
    }
    const username = getUsername.data
    const fetchedUserID = await getUserID(username)
    if (!fetchedUserID.success || typeof fetchedUserID.data === "undefined"){
        return res.status(500).json({
            error: {
                message: "internal server error"
            }
        })
    }
    const userID = fetchedUserID.data
    const nextQuestion = await getNextQuestion(userID)
    if (!nextQuestion.success && typeof nextQuestion.data === "undefined"){
        return res.status(500).json({
            error: {
                message: nextQuestion.error
            }
        })
    }
    if (nextQuestion.success && typeof nextQuestion.data === "undefined"){
        return res.status(200).json({
            success:{
                message: "Congratulations! You're Done!"
            }
        })
    }
    if (typeof nextQuestion.data !== "undefined"){
        return res.status(200).json({
            success:{
                message: "Here comes the next question:",
                question_id: nextQuestion.data[0].questionID,
                question: nextQuestion.data[0].question,
            }
        })
    }
})

paskeApi.post("/question", async(req, res)=>{
    const token = req.headers.api_key
    const body = req.body
    const bodyExists = validateBodyasObject(body)
    if (!bodyExists){
        return res.status(404).json({
            error: {
                message: "Missing answer and/or questionID"
            }
        })
    }
    const tokenExists = validateTokenAsString(token)
    if (!tokenExists){
        return res.status(401).json({
            error:{
                message: "Invalid Api Key."
            }
        })
    }
    const getUsername = await validateUserToken(token)
    if (!getUsername.success || typeof getUsername.data === "undefined"){
        return res.status(401).json({
            error:{
                message: getUsername.error
            }
        })
    }
    const username = getUsername.data
    const fetchedUserID = await getUserID(username)
    if (!fetchedUserID.success || typeof fetchedUserID.data === "undefined"){
        return res.status(500).json({
            error: {
                message: "internal server error"
            }
        })
    }
    const userID = fetchedUserID.data
    const {answer} = body
    const checkAnswer = await getAnswer(userID, answer)
    if (!checkAnswer.success || typeof checkAnswer.answer === "undefined"){
        return res.status(500).json({
            error: {
                message: "internal server error"
            }
        })
    } 
    if (typeof checkAnswer.answer === "boolean" && checkAnswer.answer === false){
        return res.status(401).json({
            error: {
                message: "Wrong Answer!"
            }
        })
    }
    if (typeof checkAnswer.answer === "boolean" && checkAnswer.answer === true){
        const nextQuestion = await getNextQuestion(userID)
        if (!nextQuestion.success && typeof nextQuestion.data === "undefined"){
            return res.status(500).json({
                error: {
                    message: nextQuestion.error
                }
            })
        }
        if (nextQuestion.success && typeof nextQuestion.data === "undefined"){
            return res.status(200).json({
                success:{
                    message: "Congratulations! You're Done!"
                }
            })
        }
        if (typeof nextQuestion.data !== "undefined"){
            return res.status(200).json({
                success:{
                    message: "Here comes the next question:",
                    question_id: nextQuestion.data[0].questionID,
                    question: nextQuestion.data[0].question,
                }
            })
        }
    }

})



paskeApi.listen(port, ()=>{
    console.log(`Listening on port: ${port}`)
})