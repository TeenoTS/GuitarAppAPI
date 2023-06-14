const express = require('express')
const cors = require('cors')
// const database = require('./firebase')
// const admin = require('firebase-admin')
const { initializeApp } = require('firebase/app')
const { getDatabase, set, update, remove, ref, query, orderByChild, equalTo, get } = require('firebase/database')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const jwtdecoder = require('jwt-decode')

const app = express()
const PORT = 8080
const TOKEN_KEY = "guitarpracticeapp"
const expTime = "30d"

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const firebaseConfig = {
  apiKey: "AIzaSyDnE11NVCpch1SAzWuVipUYUyrx74hYSvw",
  authDomain: "gt-app-c27ea.firebaseapp.com",
  databaseURL: "https://gt-app-c27ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gt-app-c27ea",
  storageBucket: "gt-app-c27ea.appspot.com",
  messagingSenderId: "279440809790",
  appId: "1:279440809790:web:872a96b8cb1df8ffbed66f",
  measurementId: "G-45PSXF550M"
}

// admin.initializeApp(firebaseConfig);
// const database = admin.firestore();
const firebase = initializeApp(firebaseConfig)
const database = getDatabase(firebase)

app.get("/", (req, res) => {
  res.status(200).send('Welcome to GT-App API')
})

app.get("/user/:token",(req, res) => {
  const token = req.params.token
  if(!token){
    return res.status(401).send({
      status: "Authentication error",
      detail: "No token or token invalid"
    })
  }else{
    try {
      const decode = jwtdecoder(token)
      return res.status(200).send(decode)
    } catch (err) {
      return res.status(401).send({
        status: "Authentication error",
        detail: "No token or token invalid"
      })
    }
  }
})

app.post("/user",(req, res) => {
  try{
    const { name, email, password } = req.body
    if(!name || !email || !password){
      return res.status(400).send({
        status: "Data required",
        details: "Required data: name, email, password"
      })
    }
    
    const userRef = ref(database, "user");
    const emailQuery = query(userRef, orderByChild("email"), equalTo(email))
  
    get(emailQuery)
      .then((snapshot) => {
        //console.log("emailQuery: " + emailQuery)
        console.log("snapshot: ", snapshot.val())
        if (snapshot.exists()) {
          return res.status(400).send({
            status: "Email already exists",
            details: "-"
          });
        } else {
          set(ref(database, 'user/' + name), {
            name: name, 
            email: email,
            password: password,
            memorize_chord: {
              beginner: 0,
              intermediate: 0,
              advance: 0
            },
            listening_chord: {
              beginner: 0,
              intermediate: 0,
              advance: 0
            },
            playing_chord: {
              beginner: 0,
              intermediate: 0,
              advance: 0
            }
          })
          .then((result) => {
            return res.status(200).send({
              status: "Success",
              details: result
            })
          })
          .catch((err) => {
            console.log("err: " + err)
            return res.status(500).send({
              status: "API Error",
              details: "Register Error"
            })
          })
        }
      })
  } catch(err){
    console.log(err)
    return res.status(500).send({
      status: "API Error",
      details: "Unknown Error"
    })
  }
})

app.put("/user",(req, res) => {
  const { name, token } = req.body
  if(!name, !token){
    return res.status(400).send({
      status: "Data required",
      details: "Required data: name, token"
    })
  }
  
  try{
    const token_data = jwtdecoder(token)
    //console.log("decoded token: ", token_data)
    const userRef = ref(database, "user");
    const emailQuery = query(userRef, orderByChild("email"), equalTo(token_data.email));

    get(emailQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const user = snapshot.val()
          //console.log("emailQuery: " + emailQuery)
          console.log("snapshot: ", user)
          const userData = Object.values(user).find(user => user.email === token_data.email)
          
          set(ref(database, 'user/' + name),{
            name: name,
            email: userData.email,
            password: userData.password,
            memorize_chord: userData.memorize_chord,
            listening_chord: userData.listening_chord,
            playing_chord: userData.playing_chord
          })
          .then((result) => {
            remove(ref(database, 'user/' + userData.name))
            const token = jwt.sign(
              {
                name: name,
                email: token_data.email
              },TOKEN_KEY,{
                expiresIn: expTime
              }
            )
            return res.status(200).send({
              token,
              status: "Success",
              details: result
            })
          })
          .catch((err) => {
            console.log("err: " + err)
            return res.status(500).send({
              status: "API Error",
              details: "Register Error"
            })
          })
      } else {
        return res.status(401).send({
          status: "Authentication Failed",
          detail: "Email not exists"
        })
      }
    })
    
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: "API Error",
      details: "Unknown Error"
    })
  }
})

app.post("/login",(req, res) => {
  const { email, password } = req.body
  if(!email || !password){
    return res.status(400).send({
      status: "Data required",
      details: "Required data: email, password"
    })
  }
  try{
    const userRef = ref(database, "user");
    const emailQuery = query(userRef, orderByChild("email"), equalTo(email));
  
    get(emailQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const user = snapshot.val()
          //console.log("emailQuery: " + emailQuery)
          console.log("snapshot: ", user)
          const userData = Object.values(user).find(user => user.email === email)
          console.log("user data: ", userData)
          if(userData.password != password){
            return res.status(401).send({
              status: "Authentication Failed",
              detail: "Password incorrect"
            })
          }
          else{
            const token = jwt.sign(
              {
                name: userData.name,
                email: email
              },TOKEN_KEY,{
                expiresIn: expTime
              }
            )
            return res.status(200).send({
              token,
              status: "Login Successfully",
              detail: "user: " + userData.name
            })
          }
      } else {
        return res.status(401).send({
          status: "Authentication Failed",
          detail: "Email not exists"
        })
      }
    })
  } catch(err){
    console.log(err)
    return res.status(500).send({
      status: "API Error",
      details: "Unknown Error"
    })
  }
})

app.post("/score/:mode/:difficulty",(req, res) => {
  const mode = req.params.mode
  const difficulty = req.params.difficulty
  console.log(mode)
  const { token, score } = req.body

  if(!mode || !difficulty || !token || !score){
    return res.status(400).send({
      status: "Data require",
      detail: "required: mode, difficulty, token, score"
    })
  }

  if(mode != "listening_chord" && mode != "memorize_chord" && mode != "playing_chord"){
    return res.status(400).send({
      status: "Mode invalid",
      details: "mode: listening_chord, memorize_chord, playing_chord"
    })
  }

  if(difficulty != "beginner" && difficulty != "intermediate" && difficulty != "advance"){
    return res.status(400).send({
      status: "Difficulty invalid",
      details: "difficulty: beginner, intermediate, advance"
    })
  }

  try{
    const token_data = jwtdecoder(token)
    const userRef = ref(database, "user");
    const emailQuery = query(userRef, orderByChild("email"), equalTo(token_data.email));

    get(emailQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const user = snapshot.val()
          //console.log("emailQuery: " + emailQuery)
          console.log("snapshot: ", user)
          const userData = Object.values(user).find(user => user.email === token_data.email)

          if(difficulty == "beginner"){
            set(ref(database, 'user/' + token_data.name + '/' + mode),{
              beginner: score,
              intermediate: userData[mode].intermediate,
              advance: userData[mode].advance,
            })
          }
          else if(difficulty == "intermediate"){
            set(ref(database, 'user/' + token_data.name + '/' + mode),{
              beginner: userData[mode].beginner,
              intermediate: score,
              advance: userData[mode].advance,
            })
          }
          else if(difficulty == "advance"){
            set(ref(database, 'user/' + token_data.name + '/' + mode),{
              beginner: userData[mode].beginner,
              intermediate: userData[mode].intermediate,
              advance: score,
            })
          }
          return res.status(200).send({
            status: "Success",
            details: "-"
          })
      } else {
        return res.status(401).send({
          status: "Authentication Failed",
          detail: "Email not exists"
        })
      }
    })
    
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: "API Error",
      details: "Unknown Error"
    })
  }
})

//-----------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server in running on Port ${PORT}`)
})