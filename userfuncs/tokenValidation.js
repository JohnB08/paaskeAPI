export const validateTokenAsString = (token) => {
    return (typeof token === "string");
};
export const validateUsernameAsString = (username) => {
    return (typeof username === "string");
};
export const validateBodyasObject = (body) => {
    return (typeof body === "object" &&
        typeof body.answer === "string" &&
        typeof body.questionId === "number");
};
