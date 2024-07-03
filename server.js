const app = require("./src/app");
require('dotenv').config()

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
	console.log(`Server starting on port ${PORT}`);
});

process.on("SIGINT", () => {
	server.close(() => console.log(`Exit Server`));
});
