const express = require('express')
const jwt = require('jsonwebtoken')
const dotEnv = require('dotenv')
const ejs = require('ejs')

const app = express()
const PORT = 5014

app.use(express.json())
dotEnv.config()
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))

const secrectkey = process.env.mySecretkey

const users = [
    {
    id : "1",
    username :"srinu",
    password :"srinu",
    isAdmin :true
    },
    {
        id : "2",
        username:"babu",
        password:"babu",
        isAdmin:false
    }
]


const verifyUser = (req, res, next) => {
    const userToken = req.headers.authorization 
    if(userToken){
        const token = userToken.split(" ")[1]
        jwt.verify(token, secrectkey, (err, user) => {
            if(err) {
                return res.status(403).json({err:"Token not valied"})
            }
            req.user = user
            next()
        })

    } else {
        res.status(401).json("You are not authenticated")

    }

}

app.post('/api/login', (req, res) => {
    const {username, password} = req.body;

    const user = users.find((person) =>{
        return person.username === username && person.password === password
    })
    if(user) {
        const accessToken = jwt.sign({
            is:user.id, 
            username:user.username,
            isAdmin:user.isAdmin
        }, secrectkey)

        res.json({
            username:user.username,
            isAdmin:user.isAdmin,
            accessToken
        })
    } else {
        res.status(401).json("user credentials not matched")
    }


})

app.delete('/api/users/:userId', verifyUser, (req, res) => {
    if(req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("User is deleted Successfully")
    } else {
        res.status(401).json("You are not allowed to delete")
    }

})

app.get('/srinu', (req, res) => {
    res.render("srinu")
})

app.get('/babu', (req, res) => {
    res.render("babu")
})


app.get('/api/login/:userId', (req,res) => {
    const userId  = req.params.userId
    if(userId) {
        if(userId === "1") {
            res.redirect('/srinu')
        } else if (userId === "2"){
            res.redirect('/babu') 
        }

    }else {
        res.status(403).json("user not found")

    }
})

app.post("/api/logout", (req, res) => {
    const userTokens = req.headers.authorization 
    if(userTokens){
        const token = userTokens.split(" ")[1]
        if(token) {
            let allTokens = []
            const tokenIndex = allTokens.indexOf(token)
            if(tokenIndex !== -1){
                allTokens.slice(tokenIndex, 1)
                res.status(200).json("Logout Successfully")
                res.redirect("/")
            } else {
                res.status(400).json("you are not valid user")
            }

        }else {
            res.status(400).json("token not found")

        }
    } else {
        res.status(400).json("You are not authenitcated")
    }

})

app.get('/api/logout', (req, res) => {
    res.redirect('/')
})

app.get('/', (req, res) => {
    res.render('welcome')
})

app.listen(PORT, () => {
    console.log(`Server started & running @ ${PORT}`)
})
