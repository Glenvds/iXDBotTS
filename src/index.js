"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const inversify_config_1 = require("./inversify.config");
const types_1 = require("./types");
let bot = inversify_config_1.default.get(types_1.TYPES.Bot);
bot.listen().then(() => {
    console.log("Bot started.");
}).catch((err) => {
    console.log("Bot failed to log in: " + err);
});
//# sourceMappingURL=index.js.map