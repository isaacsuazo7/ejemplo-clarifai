const express = require("express")
const Clarifai = require("clarifai")
const multer = require("multer")
const pug = require("pug")
const bodyParser = require("body-parser");

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer()
const resultsTemplate = pug.compileFile("public/results.pug")

const clarifai = new Clarifai.App({
  apiKey: '5aa3798020e14a588f6311c7060034bf'
});

app.get("/", (req, res) => {
  res.sendFile("public/index.html", {
    root: __dirname
  })
})

app.post("/upload", upload.single("photo"), (req, res) => {
  const base64String = Buffer.from(req.file.buffer).toString("base64")

  clarifai.models.predict("cacao", base64String).then(
   response => {
      res.send(resultsTemplate({
        concepts: response.outputs[0].data.concepts,
        image: base64String
      }))
    },
    err => {
      console.log(err)
    }
  )
})

app.post("/feedback", (req, res) => {
  const image = req.body.image;	
  const value = req.body.value;
  const id = req.body.id;
  clarifai.models.feedback(Clarifai.GENERAL_MODEL, image, {
    id: '29f1e047e6574ed4be288687477d2ff9',
    data: {
      concepts: [
        {'id': id, 'value': value },
      ]
    },
    info: {
      'eventType':  'annotation',
    }
  })
  if (res.statusCode === 200) {
  console.log('Feedback successfully submitted')
  }
})

app.use(express.static("public"))
app.listen(port, () => console.log(`Running on http://localhost:${port}/`))