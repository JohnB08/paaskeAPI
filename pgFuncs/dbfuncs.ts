
import { db } from "../pg/db.js";

const createQuestionTable = async()=>{
    try{
        const data = await db.query(`
        CREATE TABLE paskequestions (question_id SERIAL PRIMARY KEY, question VARCHAR(255), answer VARCHAR(255))
        `)
        return {success: true, data}
    } catch (error){
        return {success: false, error}
    }
}

const createUserTable = async()=>{
    try{
        const data = await db.query(`
        CREATE TABLE paskeusers (user_id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL)
        `)
        return {success: true, data}
    } catch(error){
        return {success: false, error}
    }
}

const userQuestionRelation = async()=>{
    try{
        const data = await db.query(`
        CREATE TABLE paskeuserquestionrelationship (
            user_id INT REFERENCES paskeusers(user_id) ON DELETE CASCADE,
            question_id INT REFERENCES paskequestions(question_id) ON DELETE CASCADE,
            complete BOOLEAN DEFAULT FALSE,
            PRIMARY KEY (user_id, question_id)
        )
        `)
        return {success: true, data}
    } catch(error){
        return {success: false, error}
    }
}

const getRandomQuestions = async(questionAmount: number = 14, excludedID:number[] = [22])=>{

    try{
        const data = await db.query(`
        SELECT question_id
        FROM paskequestions
        WHERE question_id NOT IN (${excludedID.join(",")})
        ORDER BY RANDOM()
        LIMIT $1
        `, [questionAmount])
        return {success: true, data: data.rows.map(row=>row.question_id)}
    } catch(error){
        return {success: false, error}
    }
}

const insertUserQuestionRelationship = async(userID: number, questionId: number[])=>{
    try{
        const successArray = []
        for (let question of questionId){
                const data = await db.query(`
                INSERT INTO paskeuserquestionrelationship (user_id, question_id)
                VALUES($1, $2)
                `, [userID, question])
                successArray.push(data)
        }
        return {success: true, successArray}

    } catch (error){
        return {success: false, error}
    }
}



export const createUserInDB = async(username: string, questionAmount: number = 14, excludedID: number[] = [22])=>{
    try{
        const data = await db.query(`
        INSERT INTO paskeusers (username)
        VALUES ($1)
        RETURNING user_id
        `, [username])
        const randomQuestionArray = await getRandomQuestions(questionAmount, excludedID)
        const userID = data.rows[0].user_id as number
        const questionIDArray = randomQuestionArray.data as number[]
        const insertRandomQuestion = await insertUserQuestionRelationship(userID, questionIDArray)
        const insertFinalQuestions = await insertUserQuestionRelationship(userID, excludedID)
        return {success: true, data: [userID, questionIDArray, insertRandomQuestion, insertFinalQuestions]}
    } catch (error){
        return {success: false, error}
    }
}

export const getUserID = async(username: string)=>{
    try{
        const data = await db.query(`
        SELECT user_id
        FROM paskeusers
        WHERE username = $1
        `, [username])
        return {success: true, data: data.rows[0].user_id as number}
    } catch(error){
        return {success: false, error}
    }
}

export const getAllUsernames = async()=>{
    try{
        const data = await db.query(`
        SELECT username
        FROM paskeusers
        `)
        return {success: true, data: data.rows.map(row=>
            row.username as string
        )}
    } catch(error){
        return {success: false, error}
    }
}

export const getAnswer = async(userID: number, answer: string) =>{
    try{
        const data = await db.query(`
        SELECT question_id
        FROM paskequestions
        WHERE answer = $1
        `, [answer])
        if (data.rows.length === 0){
            return {success: true, answer: false}
        } else{
            const questionID = data.rows[0].question_id as number
            const setComplete = await db.query(`
            UPDATE paskeuserquestionrelationship
            SET complete = TRUE
            WHERE user_id = $1
            AND question_id = $2
            `, [userID, questionID])
            return {success: true, answer: true, data: setComplete}
        }
    } catch (error){
        return {success: false, error}
    }
}

export const getNextQuestion = async(userId: number)=>{
    try{
        const data = await db.query(`
        SELECT paskequestions.question_id, paskequestions.question
        FROM paskeuserquestionrelationship
        JOIN paskequestions ON paskeuserquestionrelationship.question_id = paskequestions.question_id
        WHERE paskeuserquestionrelationship.user_id = $1
        AND paskeuserquestionrelationship.complete = FALSE
        LIMIT 1
        `, [userId])
        if (data.rows.length > 0){
            return {success: true, data: data.rows.map(row=>{
                return {questionID: row.question_id, question: row.question}
            })}
        } else {
            return {success: true, data: undefined}
        }
    } catch(error){
        return {success: false, error}
    }
}


export const initializeServer = async()=>{
    const userTable = await createUserTable()
    const questionTable = await createQuestionTable()
    const userQuestionRel = await userQuestionRelation()
    return [userTable, questionTable, userQuestionRel]
}