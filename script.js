require('dotenv').config()

const express = require("express")
const r = require("./utils/redis")
const jwt = require("jsonwebtoken")
const app = express()
app.use(express.json())
app.get("/:hkey/:key?", authinticateToken, async (req,res)=>{
  if(req.params.key) res.json({status:"ok",code:200,data: await r.hGet(req.params.hkey,req.params.key)})
  res.json({status:"ok",code:200,data: await r.hGetAll(req.params.hkey)})
})
app.post("/:hkey/:key", authinticateToken, async (req,res)=>{
  const val = JSON.stringify(req.body.data)
  if(val === null ) res.json({status:"not found",code:401,msg:'no data in body found'})
  await r.hSet(req.params.hkey,req.params.key, val)
  res.status(200).json({success:"Setted"})
})

app.post('/auth',(req,res)=>{
  const sugar = req.body.sugar
  if(sugar !== process.env.SUGAR) return res.status(403).send({status:"NOT AUTH",code:403,msg:"you are not authorized to see this data"})
  const user = { sugar: sugar }
  const accessToken = jwt.sign(user, process.env.AUTH_TOKEN)
  res.json({ authToken: accessToken })
})


function authinticateToken(req,res,next){
  const reqHeader = req.headers['authorization']
  const token = reqHeader && reqHeader.split(' ')[1]
  if(token === null) return res.status(401).send({status:"NOT AUTH",code:401,msg:"you are not authorized to see this data"})
  jwt.verify(token, process.env.AUTH_TOKEN, (err, user)=>{
    if(err) return res.status(403).send({status:"Forbidden",code:403,msg:"you are not authorized to see this data"})
    req.user = user
    next()
  })
}


app.listen(process.env.PORT || 5000)
