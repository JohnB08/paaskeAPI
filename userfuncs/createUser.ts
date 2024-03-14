import { createUserInDB, getAllUsernames } from "../pgFuncs/dbfuncs.js"
import jwt from "jsonwebtoken"

type tokenType = {
    user: string
}


export const createNewUser = async(username: string)=>{
    const postNewUser = await createUserInDB(username)
    if (postNewUser.error){
        return {success: postNewUser.success, error: postNewUser.error}
    }
    const secretKey = process.env.JWT_SECRET as string
    const userToken = jwt.sign({user: username}, `${secretKey}/${username}`, {expiresIn: "1h"})
    return {success: true, data: userToken}
}

const validateTokenPackage = (tokenPackage: string|jwt.JwtPayload): tokenPackage is tokenType =>{
    return(
        typeof tokenPackage === "object" &&
        typeof (tokenPackage as tokenType).user === "string"
    )
}

const tokenValidation = (usernameArray: string[], token: string, secret: string) =>{
    let validUsername = undefined
    console.log(secret)
    for (let username of usernameArray){
        try{
            const decoded = jwt.verify(token, `${secret}/${username}`)
            const validatePackage = validateTokenPackage(decoded)
            if (validatePackage){
                validUsername = decoded.user
            }
        }
        catch (error){
            console.log(error)
        }
    }
    return validUsername
}

export const validateUserToken = async(token:string)=>{
    const fetchedUsers = await getAllUsernames()
    console.log(fetchedUsers.data)
    if (fetchedUsers.error){
        return {success: fetchedUsers.success, error: fetchedUsers.error}
    }
    const usernameArray = fetchedUsers.data as string[]
    const secretKey = process.env.JWT_SECRET as string
    const validUsername = tokenValidation(usernameArray, token, secretKey)
    if (typeof validUsername === "undefined"){
        return {success: false, error: "Invalid Token"}
    } else return {
        success: true, data: validUsername
    }
}

