const fs = require("fs");

const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/RoyaltyTracking.sol/RoyaltyDistribution.json", "utf8")
);

const bytecode = artifact.bytecode;
console.log(bytecode);