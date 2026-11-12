let totalRequests = 0;

const requestLogger = (req, res, next) => {
  totalRequests++;
  console.log("\n========== REQUEST ==========");
  console.log({
    requestNumber: totalRequests,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    time: new Date().toISOString()
  });
  console.log("=============================");
  next();
};

module.exports = requestLogger;