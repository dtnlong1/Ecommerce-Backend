const app = require("./src/app");

PORT = 3035;

const server = app.listen(PORT, () => {
	console.log(`Server starting on port ${PORT}`);
});
process.on("SIGINT", () => {
	server.close(() => console.log(`Exit Server`));
});
