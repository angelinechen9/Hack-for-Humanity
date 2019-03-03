const express = require("express");
const hbs = require("hbs");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({dest: "./public/images"});
const fs = require("fs");
require("dotenv").config();
const app = express();
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const Rekognition = require("node-rekognition");
const AWSParameters = {
  "accessKeyId": process.env.ACCESS_KEY_ID,
  "secretAccessKey": process.env.SECRET_ACCESS_KEY,
  "region": "us-west-2"
}
const rekognition = new Rekognition(AWSParameters);
app.get("/home", (req, res) => {
  res.render("hackForHumanity.hbs");
})
app.get("/", (req, res) => {
  res.render("results.hbs");
})
app.post("/", upload.single("image"), (req, res) => {
  rekognition.detectLabels(fs.readFileSync(req.file.path))
  .then(labels => {
    let category = "landfill";
    let compost = [
      "food scraps",
      "bread",
      "grains",
      "pasta",
      "coffee grounds",
      "tea bags",
      "dairy",
      "eggs",
      "fruits",
      "vegetables",
      "leftovers",
      "spoiled food",
      "meat",
      "plants",
      "branches",
      "brush",
      "flowers",
      "floral trimmings",
      "grasses",
      "weeds",
      "leaves",
      "tree trimmings",
      "soiled paper",
      "coffee filters",
      "greasy pizza boxes",
      "paper plates without film plastic liners",
      "paper to-go containers without film plastic liners",
      "paper towels",
      "napkins",
      "shredded paper",
      "hair",
      "fur",
      "feathers",
      "wood",
      "wooden chop sticks",
      "coffee stir sticks"
    ];
    let recycle = [
      "metal",
      "aluminum cans",
      "steel",
      "aluminum foil",
      "trays",
      "plastic containers",
      "bottles",
      "containers",
      "clamshells containers",
      "cups",
      "glass",
      "glass bottles",
      "jars",
      "paper",
      "cardboard",
      "bags",
      "cardboard",
      "cereal boxes",
      "office paper",
      "egg cartons",
      "envelopes",
      "juice or soy milk boxes with foil liner",
      "junk mail",
      "magazines",
      "milk or juice cartons",
      "newspapers",
      "packing paper",
      "phonebooks",
      "sticky notes",
      "wrapping paper"
    ];
    labels.Labels.forEach(object => {
      let label = object.Name;
      compost.forEach(waste => {
        if (waste.includes(label.toLowerCase())) {
          category = "compost";
        }
      })
      recycle.forEach(waste => {
        if (waste.includes(label.toLowerCase())) {
          category = "recycle";
        }
      })
    })
    if (req.body.categories == category) {
      res.render("results.hbs", {
        result: "Correct"
      });
    }
    else {
      res.render("results.hbs", {
        result: "Incorrect"
      });
    }
  })
  .catch(e => {
    res.status(404).send(e);
  })
})
app.listen(3000);
