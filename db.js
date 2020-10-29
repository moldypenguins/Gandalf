const config = require('./config');
const mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(config.db.uri + '/' + config.db.name);
mongoose.connection.on("error", () => {
  console.log("Error: database connection failed.");
});
mongoose.connection.once("open", () => {
  console.log("Evil is stirring in Mordor.");
});
module.exports = mongoose;

