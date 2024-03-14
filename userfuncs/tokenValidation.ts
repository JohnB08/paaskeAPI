
export const validateTokenAsString = (token: string|string[]|undefined): token is string =>{
    return (
        typeof token === "string"
    )
}

export const validateUsernameAsString = (username: string | undefined): username is string =>{
    return (
        typeof username === "string"
    )
}

type bodyType = {
    questionId: number,
    answer: string
}

export const validateBodyasObject = (body: any): body is bodyType =>{
    return (
        typeof body === "object" &&
        typeof (body as bodyType).answer === "string" &&
        typeof (body as bodyType).questionId === "number"
    )
}