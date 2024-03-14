import { createUserInDB, } from "../pgFuncs/dbfuncs.js";
import jwt from "jsonwebtoken";
export const createNewUser = async (username) => {
    const postNewUser = await createUserInDB(username);
    if (postNewUser.error) {
        return { success: postNewUser.success, error: postNewUser.error };
    }
    const secretKey = process.env.JWT_SECRET;
    const userToken = jwt.sign({ user: username }, secretKey, { expiresIn: "1h" });
    return { success: true, data: userToken };
};
const validateTokenPackage = (tokenPackage) => {
    return (typeof tokenPackage === "object" &&
        typeof tokenPackage.user === "string");
};
const tokenValidation = (token, secret) => {
    let validUsername = undefined;
    console.log(secret);
    try {
        const decoded = jwt.verify(token, secret);
        const validatePackage = validateTokenPackage(decoded);
        if (validatePackage) {
            validUsername = decoded.user;
        }
    }
    catch (error) {
        console.log(error);
    }
    return validUsername;
};
export const validateUserToken = async (token) => {
    console.log(token);
    const secretKey = process.env.JWT_SECRET;
    const validUsername = tokenValidation(token, secretKey);
    if (typeof validUsername === "undefined") {
        return { success: false, error: "Invalid Token" };
    }
    else
        return {
            success: true, data: validUsername
        };
};
