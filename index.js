const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectToMongo = require("./db");
connectToMongo();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
const port = 8080;

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});


app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/contents", require("./routes/contents"));
app.use('/api/v1/upload', require("./routes/upload"));
app.use("/api/v1/blogs", require("./routes/blogs"));
app.use("/api/v1/testimonial", require("./routes/testimonial"));
app.use("/api/v1/faq", require("./routes/faq"));
app.use("/api/v1/resources", require("./routes/resources"));
app.use("/api/v1/team", require("./routes/team"));
app.use("/api/v1/partner", require("./routes/partner"));
app.use("/api/v1/enquiry", require("./routes/enquiry"));