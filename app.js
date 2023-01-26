var XLSX = require("xlsx");
var workbook = XLSX.readFile("students.xlsx");
var sheetNameList = workbook.SheetNames;
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

sheetNameList.forEach((y) => {
  var worksheet = workbook.Sheets[y];

  var headers = {};
  var data = [];

  function camelCase(str) {
    return str
      .replace(/\s(.)/g, function (a) {
        return a.toUpperCase();
      })
      .replace(/\s/g, "")
      .replace(/^(.)/, function (b) {
        return b.toLowerCase();
      });
  }

  for (z in worksheet) {
    if (z[0] === "!") continue;
    var col = z.substring(0, 1);
    var row = parseInt(z.substring(1));
    var value = worksheet[z].v;

    if (row == 1) {
      headers[col] = camelCase(value.trim());
      continue;
    }

    if (!data[row]) data[row] = {};
    data[row][headers[col]] = value.toString().toUpperCase();
  }

  data.shift();
  data.shift();
});

app.get("/api/image", (req, res) => {
  const image = fs.readFileSync(path.join(__dirname, "oni_girl.jpg"));

  res.writeHead(200, { "Content-Type": "image/jpg" });
  res.end(image);
});

app.get("/api/getCode", (req, res) => {
  const authCode = fs.readFileSync("authCode.txt", "utf-8");

  if (authCode) {
    res.status(200).json({ authCode: authCode });
  } else {
    res.status(422).json({ error: "AuthCode doesn't exists. Generate One" });
  }
});

app.post("/api/generateCode", (req, res) => {
  const { length } = req.body;

  if (!length || typeof length !== "number") {
    res.status(422).json({ error: "Send code length as a decimal value" });
  } else {
    const authCode = Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    );

    fs.writeFileSync("authCode.txt", authCode.toString(), "utf-8");

    const result = fs.readFileSync("authCode.txt", "utf-8");

    res.status(200).json({ msg: "Code Generated" });
  }
});

app.listen(8000, () => {
  console.log("listening on http://localhost:8000");
});
