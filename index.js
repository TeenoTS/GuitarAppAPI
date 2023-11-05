const express = require('express')
const cors = require('cors')
// const database = require('./firebase')
// const admin = require('firebase-admin')
const { initializeApp } = require('firebase/app')
const { getDatabase, set, update, remove, ref, query, orderByChild, equalTo, get } = require('firebase/database')
// const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = require('firebase/storage')
const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = require('firebase/storage');

const multer = require('multer')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const jwtdecoder = require('jwt-decode')
const mime = require('mime')
const fs = require('fs')
const { spawn, exec } = require('child_process')
const path = require('path')

const app = express()
const PORT = 8080
const TOKEN_KEY = "guitarpracticeapp"
const expTime = "30d"

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
const storage = getStorage(firebase)
// const upload = multer({ dest: 'uploads/' })
const uploadFile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './files/')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`)
    }
  })
})

const listFilesInPath = (directoryPath, callback) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      callback(err, null)
    } else {
      // const fileList = files.map(file => path.join(directoryPath, file))
      const fileList = files.map(file => path.basename(file))
      callback(null, fileList)
    }
  })
}

const file2model = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './UserChordSound/')
    },
    filename: function (req, file, cb) {
      cb(null, 'userSound' + path.extname(file.originalname))
    }
  })
})

const sound4detail = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './fileTemp/')
    },
    filename: function (req, file, cb) {
      const currentDate = new Date();
      const formattedDate = currentDate.getFullYear().toString() +
        ('0' + (currentDate.getMonth() + 1)).slice(-2) +
        ('0' + currentDate.getDate()).slice(-2)
      cb(null, Date.now() + "-" + formattedDate + '-testerSound' + path.extname(file.originalname))
    }
  })
})

if (!fs.existsSync('./UserChordSound')) {
  fs.mkdirSync('./UserChordSound');
}

if (!fs.existsSync('./files')) {
  fs.mkdirSync('./files')
}

if (!fs.existsSync('./fileTemp')) {
  fs.mkdirSync('./fileTemp')
}

const newID = async () => {
  var newerID = 0
  await get(ref(database, 'userID/ID'))
    .then((snapshot) => {
      const id = snapshot.val() + 1
      update(ref(database, 'userID'), {
        ID: id
      })
      newerID = id
    })
    .catch((err) => {
      newerID = -1
    })
  return newerID
}

app.post('/upload', uploadFile.single('file'), async (req, res) => {
  console.log("upload activated")
  try {

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded or empty file' });
    }
    else {

    }
    console.log(file)
    // const storagePath = 'path/to/file/' + file.originalname;
    // const storageReference = storageRef(getStorage(), storagePath);
    // await uploadBytes(storageReference, file.buffer);

    return res.status(200).send({
      status: "File uploaded successfully",
      filename: file.filename,
      mimetype: file.mimetype
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'Error uploading file' })
  }
})

app.get("/", async (req, res) => {
  // const id = await newID()
  // console.log("newID: " + id)
  // res.status(200).send('Welcome to GT-App API')
  res.sendFile(__dirname + '/index.html');
})

app.get("/getfile/:filename", (req, res) => {
  const filename = req.params.filename
  const filePath = __dirname + '/files/' + filename
  console.log(filePath)
  return res.sendFile(filePath)
})

app.get("/user/:token", (req, res) => {
  const token = req.params.token
  if (!token) {
    return res.status(401).send({
      status: "Authentication error",
      detail: "No token or token invalid"
    })
  } else {
    try {
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

            return res.status(200).send({ token_data, userData })
          }
          else {
            return res.status(401).send({
              status: "Authentication Failed",
              detail: "Email not exists"
            })
          }
        })
    } catch (err) {
      return res.status(401).send({
        status: "Authentication error",
        detail: "No token or token invalid"
      })
    }
  }
})

app.post("/user", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).send({
        status: "Data required",
        details: "Required data: name, email, password"
      })
    }

    const userRef = ref(database, "user");
    const emailQuery = query(userRef, orderByChild("email"), equalTo(email))

    get(emailQuery)
      .then(async (snapshot) => {
        //console.log("emailQuery: " + emailQuery)
        console.log("snapshot: ", snapshot.val())
        if (snapshot.exists()) {
          return res.status(400).send({
            status: "Email already exists",
            details: "-"
          });
        } else {
          const id = await newID()
          set(ref(database, 'user/' + name), {
            id: id,
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
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: "API Error",
      details: "Unknown Error"
    })
  }
})

app.put("/user", (req, res) => {
  const { name, token } = req.body
  if (!name, !token) {
    return res.status(400).send({
      status: "Data required",
      details: "Required data: name, token"
    })
  }

  try {
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

          set(ref(database, 'user/' + name), {
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
                }, TOKEN_KEY, {
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

app.post("/login", (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).send({
      status: "Data required",
      details: "Required data: email, password"
    })
  }
  try {
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
          if (userData.password != password) {
            return res.status(401).send({
              status: "Authentication Failed",
              detail: "Password incorrect"
            })
          }
          else {
            const token = jwt.sign(
              {
                name: userData.name,
                email: email
              }, TOKEN_KEY, {
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
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: "API Error",
      details: "Unknown Error"
    })
  }
})

app.post("/score/:mode/:difficulty", (req, res) => {
  const mode = req.params.mode
  const difficulty = req.params.difficulty
  //console.log(difficulty)
  //console.log(mode)
  const { token, score } = req.body
  //console.log(req.body)

  if (!mode || !difficulty || !token || !score) {
    return res.status(400).send({
      status: "Data require",
      detail: "required: mode, difficulty, token, score"
    })
  }

  if (mode != "listening_chord" && mode != "memorize_chord" && mode != "playing_chord") {
    return res.status(400).send({
      status: "Mode invalid",
      details: "mode: listening_chord, memorize_chord, playing_chord"
    })
  }

  if (difficulty != "beginner" && difficulty != "intermediate" && difficulty != "advance") {
    return res.status(400).send({
      status: "Difficulty invalid",
      details: "difficulty: beginner, intermediate, advance"
    })
  }

  try {
    const token_data = jwtdecoder(token)
    const userRef = ref(database, "user");
    const emailQuery = query(userRef, orderByChild("email"), equalTo(token_data.email));

    get(emailQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const user = snapshot.val()
          //console.log("emailQuery: " + emailQuery)
          //console.log("snapshot: ", user)
          const userData = Object.values(user).find(user => user.email === token_data.email)

          if (difficulty == "beginner") {
            set(ref(database, 'user/' + token_data.name + '/' + mode), {
              beginner: score,
              intermediate: userData[mode].intermediate,
              advance: userData[mode].advance,
            })
          }
          else if (difficulty == "intermediate") {
            set(ref(database, 'user/' + token_data.name + '/' + mode), {
              beginner: userData[mode].beginner,
              intermediate: score,
              advance: userData[mode].advance,
            })
          }
          else if (difficulty == "advance") {
            set(ref(database, 'user/' + token_data.name + '/' + mode), {
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

app.get('/runpy', async (req, res) => {
  const { chordName, chordFile } = req.body
  const modelFile = 'testPy.py'
  let dataToSend = ''

  const pyProcess = await spawn('python', [__dirname + "/model/" + modelFile, chordName, chordFile])

  pyProcess.stdout.on('data', function (data) {
    dataToSend += data.toString()
  })

  // res.status(200).send(__dirname + "model/" + modelFile)
  pyProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send(`Python script exited with code ${code}`)
    }
    // console.log('Data received from script')
    return res.status(200).send(dataToSend)
  })
})

app.post("/model", file2model.single('file'), async (req, res) => {
  try {

    const soundFile = req.file
    await console.log('Sound file:', soundFile)

    try {
      const storage = getStorage(firebase)
      const storagePath = 'modelUsingHistory/' + file.filename
      const storageReference = storageRef(storage, storagePath)
      await uploadBytes(storageReference, fs.readFileSync(soundFile.path))
      const downloadURL = await getDownloadURL(storageReference)
      console.log("Upload Successfully. Download file link:", downloadURL)
    } catch (error) {
      console.error('Error uploading file:', error)
    }

    const modelFile = 'Predict.py'
    let predicted = ''

    if (!soundFile) { return res.status(400).send("File not Found") }

    const model = await spawn('python', [__dirname + "/model/" + modelFile])

    model.stdout.on('data', function (data) {
      console.log("Data:", data.toString(), "Update")
      predicted = data.toString()
    })

    model.on('close', (code) => {
      if (code !== 0) {
        console.log(`Python script exited with code ${code}`)
        return res.status(500).send(`Python script exited with code ${code}`)
      }
      console.log("Predict.py Return:", predicted)
      return res.status(200).send(predicted)
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error, Error:", error)
  }
})

//------- Endpoint for testing with cloud platform ----------

app.get("/listfile", async (req, res) => {
  const { reqPath } = req.body
  let searchPath = __dirname
  let output = ""
  console.log(searchPath)
  if (reqPath) {
    searchPath = searchPath + reqPath
  }
  const path = __dirname
  console.log(path)
  console.log(searchPath)
  await listFilesInPath(searchPath, (err, fileList) => {
    if (err) {
      res.status(500).send({ searchPath, Response: "Path Error" })
    } else {
      res.status(200).send({ searchPath, fileList })
    }
  })
  // res.send(searchPath)
})

app.get("/download", (req, res) => {
  const { filepath } = req.body
  if (!filepath) { return res.status(400).send("No file path") }
  const targetFile = __dirname + "/" + filepath
  console.log(targetFile)
  res.download(targetFile)
})

app.get("/getusersound", async (req, res) => {
  const userSoundPath = __dirname + "/UserChordSound/userSound.wav"
  res.sendFile(userSoundPath)
})

app.post("/soundcheck", sound4detail.single('file'), async (req, res) => {
  const file = req.file
  let Response = ''

  const pyProcess = await spawn('python', [__dirname + "/functionPy/soundDetail.py", file.filename])

  pyProcess.stdout.on('data', function (data) {
    Response += data.toString()
  })

  pyProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send(`Python script exited with code ${code}`)
    }
    // console.log('Data received from script')
    return res.status(200).send(Response)
  })
})

app.post("/mimetype", sound4detail.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded or empty file' });
  }

  const storage = getStorage(firebase)
  const storagePath = 'fileTemp/' + file.filename
  const storageReference = storageRef(storage, storagePath)
  try {
    await uploadBytes(storageReference, fs.readFileSync(file.path))
    const downloadURL = await getDownloadURL(storageReference)
    console.log(file)
    return res.status(200).json({ file, downloadURL: downloadURL })
  } catch (error) {
    console.error('Error uploading file:', error)
    return res.status(500).json({ error: 'Error uploading file' })
  }

})

app.post('/testupload', uploadFile.single('file'), async (req, res) => {
  console.log("upload activated")
  try {
    const file = req.file;
    console.log(file)
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded or empty file' });
    }

    // เข้าถึง Storage ใน Firebase
    const storage = getStorage(firebase);

    // กำหนด path ใน Storage ที่คุณต้องการเก็บไฟล์
    const storagePath = 'files/' + file.filename;

    // สร้าง reference ใน Storage
    const storageReference = storageRef(storage, storagePath);

    // อัปโหลดไฟล์
    await uploadBytes(storageReference, fs.readFileSync(file.path))
    const downloadURL = await getDownloadURL(storageReference)

    return res.status(200).send({
      status: "File uploaded successfully",
      filename: file.filename,
      mimetype: file.mimetype,
      downloadURL: downloadURL
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'Error uploading file' })
  }
})


//-----------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server in running on Port ${PORT}`)
})