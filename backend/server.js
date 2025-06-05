require("dotenv").config();
const imageRoutes = require("./routes/imageRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 80;

app.use(    
  cors({
    origin: "https://realreviewfr.netlify.app/",
  })
);
app.use(express.json());
app.use("/api/images", imageRoutes);
app.use("/api/images", ratingRoutes);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
