require("dotenv").config()

const redis = require("redis")

const client = redis.createClient({socket: 
{
  host:process.env.REDIS_HOST,
  port:process.env.REDIS_PORT,
},password:process.env.REDIS_PASS})
client.connect().then((con)=>console.log("Connected")).catch((err)=>console.log("Error",err))


module.exports = client
