/**
 * Typescript function to validate the recieved token as a string.
 * @param token the userprovided token
 * @returns boolean
 */
export const validateTokenAsString = (token) => {
    return (typeof token === "string");
};
/**
 * typescript function to validate the recieved username as a string.
 * @param username the provided username
 * @returns boolean
 */
export const validateUsernameAsString = (username) => {
    return (typeof username === "string" &&
        username.length > 0);
};
/**
 * a function that validates the request body as the correct body type.
 * @param body the provided request body
 * @returns boolean
 */
export const validateBodyasObject = (body) => {
    return (typeof body === "object" &&
        typeof body.answer === "string" &&
        typeof body.question_id === "number");
};
