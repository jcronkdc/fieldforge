"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templateGenerator_js_1 = require("../angryLips/templateGenerator.js");
const [, , genreArg, lengthArg] = process.argv;
const genre = genreArg ?? "heist";
const length = lengthArg ?? "quick";
const sampleSeed = `The aurora vault hummed like a neon comet while the crew debated who would go first.
@Starlight flicked the holographic hourglass, watching sand spiral into a countdown hovering above the console.
Someone whispered that the password was hidden inside a joke only the AI co-host understood.
Outside, the sky over City of Thousand Codes rippled with rumors that tonight would rewrite canon.`;
const result = (0, templateGenerator_js_1.generateTemplate)({
    genre,
    length,
    seedText: sampleSeed,
});
console.log(JSON.stringify(result, null, 2));
