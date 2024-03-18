import { db } from "../pg/db.js";
/**
 * Utility function that creates a table if it doesn't exist
 * The table has three columns:
 * question_id, a serialized unique key for each question.
 * question, the questiontext.
 * answer, a string of answers. If i had spent more than two days on this i would've made it an array. For now separate answers with a comma for it to recognize several different answers as valid.
 *
 * @returns an object {
 * success: boolean,
 * if success = true, data. else error
 * }
 */
const createQuestionTable = async () => {
    try {
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS paskequestions (question_id SERIAL PRIMARY KEY, question VARCHAR(255), answer VARCHAR(255))
        `);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that creates a table for users if it doesn't allready exist.
 * columns:
 * user_id, a serialized unique key.
 * username, a string of characters. Has to be unique and not null.
 * @returns an object {
 * success: boolean,
 * if success = true, data. Else error
 * }
 */
const createUserTable = async () => {
    try {
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS paskeusers (user_id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL)
        `);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * Creates a relationship table if it doesn't exists.
 * columns:
 * user_id, a unique serialized reference to the paskeusers(user_id) column.
 * question_id, a unique serialized reference to the paskequestions(question_id) column.
 * complete, a boolean defautled to FALSE
 * @returns an object {
 * success: boolean
 * if success = true data, else error
 * }
 */
const userQuestionRelation = async () => {
    try {
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS paskeuserquestionrelationship (
            user_id INT REFERENCES paskeusers(user_id) ON DELETE CASCADE,
            question_id INT REFERENCES paskequestions(question_id) ON DELETE CASCADE,
            complete BOOLEAN DEFAULT FALSE,
            PRIMARY KEY (user_id, question_id)
        )
        `);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that returns a random set of question_ids, can exclude an array of question_ids.
 * @param questionAmount the amount of question_ids you want.
 * @param excludedID an array of question_ids to exclude in the random fetch.
 * @returns an object {
 * success: boolean,
 * if success = true, data is an array of question_ids.
 * else error.
 * }
 */
const getRandomQuestions = async (questionAmount = 14, excludedID = [22]) => {
    try {
        const data = await db.query(`
        SELECT question_id
        FROM paskequestions
        WHERE question_id NOT IN (${excludedID.join(",")})
        ORDER BY RANDOM()
        LIMIT $1
        `, [questionAmount]);
        return { success: true, data: data.rows.map(row => row.question_id) };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that creates a relationship between a question_id and a user_id, for an array of question_ids in the paskeuserquestionrelationship table.
 * @param userID the serialized key identifying a user in the paskeusers table.
 * @param questionIdArray an array of question_ids.
 * @returns
 */
const insertUserQuestionRelationship = async (userID, questionIdArray) => {
    try {
        const successArray = [];
        for (let question of questionIdArray) {
            const data = await db.query(`
                INSERT INTO paskeuserquestionrelationship (user_id, question_id)
                VALUES($1, $2)
                `, [userID, question]);
            successArray.push(data);
        }
        return { success: true, successArray };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that creates a new user in the database, and sets up the random answer pool for the user.
 * @param username The username in string you want to insert.
 * @param questionAmount How many questions do you want.
 * @param excludedID If you want to exclude certain questions from the random question fetching.
 * @param insertAtEnd If you want to include the excluded question at the end of the questionpool. Defaults to true.
 * @returns an object {
 * success: boolean,
 * data: if success = true, it's an array of the different successes. if false error instead.
 * }
 */
export const createUserInDB = async (username, questionAmount = 14, excludedID = [22], insertAtEnd = true) => {
    try {
        const data = await db.query(`
        INSERT INTO paskeusers (username)
        VALUES ($1)
        RETURNING user_id
        `, [username]);
        const randomQuestionArray = await getRandomQuestions(questionAmount, excludedID);
        const userID = data.rows[0].user_id;
        const questionIDArray = randomQuestionArray.data;
        const insertRandomQuestion = await insertUserQuestionRelationship(userID, questionIDArray);
        let insertFinalQuestions = null;
        if (excludedID.length > 0 && insertAtEnd === true) {
            insertFinalQuestions = await insertUserQuestionRelationship(userID, excludedID);
        }
        return { success: true, data: [userID, questionIDArray, insertRandomQuestion, insertFinalQuestions] };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that returns a user_id value for a username string.
 * @param username the username you want the user_id from.
 * @returns an object {
 * success: boolean,
 * if success = true, data. Else error.
 * }
 */
export const getUserID = async (username) => {
    try {
        const data = await db.query(`
        SELECT user_id
        FROM paskeusers
        WHERE username = $1
        `, [username]);
        return { success: true, data: data.rows[0].user_id };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that returns all usernames in the paskeusers table. Currently not used.
 * @returns an object {
 * success: boolean,
 * if success = true, returns data = an array of usernames. else returns error
 * }
 */
export const getAllUsernames = async () => {
    try {
        const data = await db.query(`
        SELECT username
        FROM paskeusers
        `);
        return { success: true, data: data.rows.map(row => row.username) };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that checks if an answer provided exists in the row of the question_id provided. Will also create a string from the answer column.
 * If it finds an answer, it will set the "complete" boolean in the relationship table as complete for the given question_id and user_id.
 * @param userID the user_id for the user currently providing an answer.
 * @param answer the answer as a string given by the user.
 * @param questionId the question_id as a number given by the user.
 * @returns an object {
 * success: boolean,
 * if success = true, but it doesn't find an answer. answer = false.
 * if success = true, and answer = true, it returns data for setComplete.
 * If success = false, returns error.
 * }
 */
export const getAnswer = async (userID, answer, questionId) => {
    try {
        const data = await db.query(`
        SELECT question_id
        FROM paskequestions
        WHERE $1 = ANY(string_to_array(answer, ', '))
        AND question_id = $2
        `, [answer, questionId]);
        if (data.rows.length === 0) {
            return { success: true, answer: false };
        }
        else {
            const setComplete = await db.query(`
            UPDATE paskeuserquestionrelationship
            SET complete = TRUE
            WHERE user_id = $1
            AND question_id = $2
            `, [userID, questionId]);
            return { success: true, answer: true, data: setComplete };
        }
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function for returning the next question not set to complete in the relationship table for a given user_id
 * @param userId the unique key for the user.
 * @returns an object {
 * success: boolean
 * if success = true, data: {
 * questionId: number, question: string
 * }, else error.
 * }
 */
export const getNextQuestion = async (userId) => {
    try {
        const data = await db.query(`
        SELECT paskequestions.question_id, paskequestions.question
        FROM paskeuserquestionrelationship
        JOIN paskequestions ON paskeuserquestionrelationship.question_id = paskequestions.question_id
        WHERE paskeuserquestionrelationship.user_id = $1
        AND paskeuserquestionrelationship.complete = FALSE
        LIMIT 1
        `, [userId]);
        if (data.rows.length > 0) {
            return { success: true, data: data.rows.map(row => {
                    return { questionID: row.question_id, question: row.question };
                }) };
        }
        else {
            return { success: true, data: undefined };
        }
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * A function that creates the tables if they don't exists at server start.
 * @returns
 */
export const initializeServer = async () => {
    const userTable = await createUserTable();
    const questionTable = await createQuestionTable();
    const userQuestionRel = await userQuestionRelation();
    return [userTable, questionTable, userQuestionRel];
};
