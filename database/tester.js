const URL = "http://localhost:5000/api/auth/login";
const NUMBER_OF_REQUESTS = 7;

async function runTest() {
  console.log(`Sending ${NUMBER_OF_REQUESTS} requests...`);

  const results = await Promise.all(
    Array.from({ length: NUMBER_OF_REQUESTS }, async (_, i) => {
      try {
        const response = await fetch(URL);

        return {
          request: i + 1,
          status: response.status
        };
      } catch (error) {
        return {
          request: i + 1,
          error: error.message
        };
      }
    })
  );

  console.table(results);

  console.log(
    "Successful:",
    results.filter(r => r.status === 200).length
  );

  console.log(
    "Rate limited:",
    results.filter(r => r.status === 429).length
  );
}

runTest();