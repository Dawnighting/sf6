const assert = require("node:assert/strict");
const { SITE_CONFIG, RANK_ORDER } = require("../js/config.js");
const Pricing = require("../js/pricing.js");

function quote(curRank, curStar, tgtRank, tgtStar, extra = {}) {
  return Pricing.computeBoostQuote({
    curRank,
    curStar,
    curM: "",
    tgtRank,
    tgtStar,
    tgtM: "",
    mode: "经典",
    character: "卢克",
    ...extra
  });
}

const goldFiveToPlatinumOne = quote("gold", 5, "platinum", 1);
assert.equal(goldFiveToPlatinumOne.ok, true);
assert.equal(goldFiveToPlatinumOne.price, 15);

const goldFourToPlatinumOne = quote("gold", 4, "platinum", 1);
assert.equal(goldFourToPlatinumOne.price, 15);

const modernGoldFiveToPlatinumOne = quote("gold", 5, "platinum", 1, { mode: "现代" });
assert.equal(modernGoldFiveToPlatinumOne.price, 23);

const masterTinyGain = quote("master", 1, "master", 1, {
  curM: 1500,
  tgtM: 1501
});
assert.equal(masterTinyGain.ok, true);
assert.equal(masterTinyGain.price, 15);

const pointRanks = RANK_ORDER.filter((rank) => rank.value !== "newchallenger");
const currentPoints = [{ rank: "newchallenger", star: 1, m: "" }];
for (const rank of pointRanks) {
  for (let star = 1; star <= 5; star += 1) {
    const mValues = rank.value === "master" ? [0, 1, 1400, 1500, 1600, 1800, 2000, 2400] : [""];
    for (const m of mValues) currentPoints.push({ rank: rank.value, star, m });
  }
}

const targetPoints = [];
for (const rank of RANK_ORDER.filter((item) => item.inTarget)) {
  for (let star = 1; star <= 5; star += 1) {
    const mValues = rank.value === "master" ? [1500, 1501, 1600, 1800, 2000, 2400] : [""];
    for (const m of mValues) targetPoints.push({ rank: rank.value, star, m });
  }
}

let validCombinations = 0;
const belowMinimum = [];
for (const mode of ["经典", "现代"]) {
  for (const cur of currentPoints) {
    for (const tgt of targetPoints) {
      const result = Pricing.computeBoostQuote({
        curRank: cur.rank,
        curStar: cur.star,
        curM: cur.m,
        tgtRank: tgt.rank,
        tgtStar: tgt.star,
        tgtM: tgt.m,
        mode,
        character: "卢克"
      });
      if (!result.ok) continue;
      validCombinations += 1;
      if (result.price < SITE_CONFIG.boostMinimumPrice) {
        belowMinimum.push({
          mode,
          cur: `${cur.rank}${cur.rank === "master" ? ` M${cur.m}` : `${cur.star}星`}`,
          target: `${tgt.rank}${tgt.rank === "master" ? ` M${tgt.m}` : `${tgt.star}星`}`,
          price: result.price
        });
      }
    }
  }
}

assert.ok(validCombinations > 0);
assert.deepEqual(belowMinimum, [], `发现低于起步价的组合：${JSON.stringify(belowMinimum)}`);

console.log(`Pricing tests passed: ${validCombinations} valid rank combinations, minimum price ${SITE_CONFIG.boostMinimumPrice}.`);
