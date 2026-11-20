const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const requestLogger = require("./middleware/requestLogger");
const apiLimiter = require("./config/apiLimiter");     // Import global rate limiter

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRouters = require("./routes/mpesa")

const app = express();
app.use(requestLogger);
app.set('trust proxy', 1);

app.use(cors({

    origin: ["http://localhost:5173", 
      "https://my-first-project.hydarzuma.workers.dev"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRouters);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
