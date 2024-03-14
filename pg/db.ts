import pgk from "pg"

const {Pool} = pgk
console.log(
    {
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    user: process.env.POSTGRES_USER,
    port: Number(process.env.POSTGRES_PORT)
}
)





export const db = new Pool({
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    user: process.env.POSTGRES_USER,
    port: Number(process.env.POSTGRES_PORT)
})
