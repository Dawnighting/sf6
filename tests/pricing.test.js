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
assert.equal(goldFiveToPlatinumOne.price, 20);

const goldFourToPlatinumOne = quote("gold", 4, "platinum", 1);
assert.equal(goldFourToPlatinumOne.price, 20);

const goldOneToGoldTwo = quote("gold", 1, "gold", 2);
const goldOneToGoldThree = quote("gold", 1, "gold", 3);
assert.equal(goldOneToGoldTwo.price, 15);
assert.equal(goldOneToGoldThree.price, 20);

const platinumFourToPlatinumFive = quote("platinum", 4, "platinum", 5);
const platinumThreeToPlatinumFive = quote("platinum", 3, "platinum", 5);
assert.equal(platinumFourToPlatinumFive.price, 15);
assert.equal(platinumThreeToPlatinumFive.price, 20);

const silverFiveToGoldTwo = quote("silver", 5, "gold", 2);
assert.equal(silverFiveToGoldTwo.price, 15);

const modernGoldFiveToPlatinumOne = quote("gold", 5, "platinum", 1, { mode: "现代" });
assert.equal(modernGoldFiveToPlatinumOne.price, 35);

const classicGoldOneToDiamondFive = quote("gold", 1, "diamond", 5);
const modernGoldOneToDiamondFive = quote("gold", 1, "diamond", 5, { mode: "现代" });
assert.equal(classicGoldOneToDiamondFive.price, 30);
assert.equal(modernGoldOneToDiamondFive.price, 45);

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
      let expectedMinimum = mode === "现代"
        ? SITE_CONFIG.modernBoostMinimumPrice
        : SITE_CONFIG.boostMinimumPrice;
      const curInfo = RANK_ORDER.find((rank) => rank.value === cur.rank);
      const tgtInfo = RANK_ORDER.find((rank) => rank.value === tgt.rank);
      const curScore = Pricing.pointScore(cur.rank, cur.star, cur.m);
      const tgtScore = Pricing.pointScore(tgt.rank, tgt.star, tgt.m);
      if (
        mode === "经典" &&
        curInfo.order >= 50 && curInfo.order < 100 &&
        tgtInfo.order < 100 &&
        (tgtScore - curScore) >= 2
      ) {
        expectedMinimum = SITE_CONFIG.goldPlusTwoStarMinimumPrice;
      }
      if (result.price < expectedMinimum) {
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

console.log(
  `Pricing tests passed: ${validCombinations} valid rank combinations, ` +
  `classic minimum ${SITE_CONFIG.boostMinimumPrice}, modern minimum ${SITE_CONFIG.modernBoostMinimumPrice}.`
);
