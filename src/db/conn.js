const mongoose = require("mongoose");

const connectionString = "mongodb+srv://shivam66jnp:XYPPYf4gyJf5El4O@cluster0.ru4bvi9.mongodb.net/StandBymE?retryWrites=true&w=majority";

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log("Connection to MongoDB Atlas successful");
}).catch((error) => {
  console.log("Error connecting to MongoDB Atlas:", error);
});
