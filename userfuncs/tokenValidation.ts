

/**
 * Typescript function to validate the recieved token as a string. 
 * @param token the userprovided token
 * @returns boolean
 */
export const validateTokenAsString = (token: string|string[]|undefined): token is string =>{
    return (
        typeof token === "string"
    )
}


/**
 * typescript function to validate the recieved username as a string. 
 * @param username the provided username
 * @returns boolean
 */
export const validateUsernameAsString = (username: string | undefined): username is string =>{
    return (
        typeof username === "string"
    )
}

/**
 * the typescript type for the required request.body
 */
type bodyType = {
    questionId: number,
    answer: string
}

/**
 * a function that validates the request body as the correct body type. 
 * @param body the provided request body
 * @returns boolean
 */
export const validateBodyasObject = (body: any): body is bodyType =>{
    return (
        typeof body === "object" &&
        typeof (body as bodyType).answer === "string" &&
        typeof (body as bodyType).questionId === "number"
    )
}