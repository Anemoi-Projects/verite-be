const express = require("express");
const bodyParser = require("body-parser");
const connectToMongo = require("./db");
const cors = require("cors");
const http = require("http");

connectToMongo();
const app = express();
const PORT = 8080;
const server = http.createServer(app);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/contents", require("./routes/contents"));
app.use("/api/v1/upload", require("./routes/upload"));
app.use("/api/v1/blogs", require("./routes/blogs"));
app.use("/api/v1/testimonial", require("./routes/testimonial"));
app.use("/api/v1/faq", require("./routes/faq"));
app.use("/api/v1/resources", require("./routes/resources"));
app.use("/api/v1/team", require("./routes/team"));
app.use("/api/v1/partner", require("./routes/partner"));
app.use("/api/v1/enquiry", require("./routes/enquiry"));
app.use("/api/v1/mail", require("./routes/mail"));

server.listen(PORT, () => {
  console.log("App listening on port " + PORT);
});
