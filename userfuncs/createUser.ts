import { createUserInDB, } from "../pgFuncs/dbfuncs.js"
import jwt from "jsonwebtoken"

type tokenType = {
    user: string
}

/**
 * A function that posts a new username to the postgres database, then if that's successfull, generates a unique jwt token for that user. 
 * @param username the username provided.
 * @returns an object {
 * success: boolean,
 * if success = true, data: the jwt token generated, else error. 
 * }
 */
export const createNewUser = async(username: string)=>{
    const postNewUser = await createUserInDB(username)
    if (postNewUser.error){
        return {success: postNewUser.success, error: postNewUser.error}
    }
    const secretKey = process.env.JWT_SECRET as string
    const userToken = jwt.sign({user: username}, secretKey, {expiresIn: "1h"})
    return {success: true, data: userToken}
}

/**
 * A function that validats if the token is an object that contains a .user after decoding. 
 * @param tokenPackage 
 * @returns 
 */
const validateTokenPackage = (tokenPackage: string|jwt.JwtPayload): tokenPackage is tokenType =>{
    return(
        typeof tokenPackage === "object" &&
        typeof (tokenPackage as tokenType).user === "string"
    )
}

/**
 * A function that tries to decode a provided jwt token, and returns either a valid username or undefined.
 * @param token the provided jwt token
 * @param secret the stored secret key.
 * @returns validUsername = string | undefined.
 */
const tokenValidation = ( token: string, secret: string) =>{
    let validUsername = undefined
    console.log(secret)
        try{
            const decoded = jwt.verify(token, secret)
            const validatePackage = validateTokenPackage(decoded)
            if (validatePackage){
                validUsername = decoded.user
            }
        }
        catch (error){
            console.log(error)
        }
    return validUsername
}

/**
 * A function that validates the userToken
 * @param token the provided token.
 * @returns object {
 * success: boolean
 * if success = true return data: validUsername, else error "Invalid Token"
 * }
 */
export const validateUserToken = async(token:string)=>{
    console.log(token)
    const secretKey = process.env.JWT_SECRET as string
    const validUsername = tokenValidation( token, secretKey)
    if (typeof validUsername === "undefined"){
        return {success: false, error: "Invalid Token"}
    } else return {
        success: true, data: validUsername
    }
}

