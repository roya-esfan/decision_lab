import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const typescriptPath = resolve(repoRoot, "node_modules/typescript/lib/typescript.js");
const typescriptModule = await import(pathToFileURL(typescriptPath).href);
const ts = typescriptModule.default ?? typescriptModule;

async function loadTypeScriptModule(relativePath, dependencies = {}) {
  const source = await readFile(resolve(repoRoot, relativePath), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: relativePath,
  }).outputText;

  const loadedModule = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier in dependencies) return dependencies[specifier];
    if (specifier === "server-only") return {};
    if (specifier.startsWith("node:")) return requireBuiltin(specifier);
    throw new Error(`Unexpected import ${specifier} in ${relativePath}`);
  };
  const evaluate = new Function("require", "module", "exports", compiled);
  evaluate(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

function requireBuiltin(specifier) {
  if (specifier === "node:crypto") {
    return {
      createHmac: (...args) => globalThis.__nodeCrypto.createHmac(...args),
      timingSafeEqual: (...args) => globalThis.__nodeCrypto.timingSafeEqual(...args),
    };
  }
  throw new Error(`Unexpected built-in import ${specifier}`);
}

const nodeCrypto = await import("node:crypto");
globalThis.__nodeCrypto = nodeCrypto;

const content = await loadTypeScriptModule("content/life-experience-bingo.ts");
const catalogModule = await loadTypeScriptModule("lib/bingo-card-catalog.ts", {
  "@/content/life-experience-bingo": content,
});
const catalog = catalogModule.bingoCardCatalog;
const experiences = content.bingoExperiences;

const poolIds = experiences.map((item) => item.id);
const validIds = new Set(poolIds);
const expectedPoolIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20];
const sunkCostIds = new Set([2, 3, 7]);
const selfJustificationIds = new Set([14, 16]);
const endowmentIds = new Set([8, 18]);

assert.deepEqual(poolIds, expectedPoolIds, "The experience pool must contain only the approved 19 items");
assert.equal(catalog.length, 100, "The catalogue must contain 100 cards");
assert.equal(new Set(catalog.map((card) => card.join(","))).size, 100, "Every ordered card must be unique");

function countFrom(card, group) {
  return card.filter((id) => group.has(id)).length;
}

for (const [index, card] of catalog.entries()) {
  assert.equal(card.length, 16, `Card ${index + 1} must contain 16 squares`);
  assert.equal(new Set(card).size, 16, `Card ${index + 1} must not repeat an item`);
  assert.ok(card.every((id) => validIds.has(id)), `Card ${index + 1} contains an unknown item`);
  assert.equal(countFrom(card, sunkCostIds), 2, `Card ${index + 1} violates the sunk-cost limit`);
  assert.equal(countFrom(card, selfJustificationIds), 1, `Card ${index + 1} violates the self-justification limit`);
  assert.equal(countFrom(card, endowmentIds), 1, `Card ${index + 1} violates the endowment limit`);
  assert.ok(card.includes(19) && card.includes(20), `Card ${index + 1} must include both outcome-bias items`);
}

for (let iteration = 0; iteration < 2000; iteration += 1) {
  const generated = content.generateBingoCard();
  const generatedIds = generated.map((item) => item.id);
  assert.equal(generatedIds.length, 16, "Fallback generator returned the wrong card size");
  assert.equal(new Set(generatedIds).size, 16, "Fallback generator repeated an item");
  assert.equal(countFrom(generatedIds, sunkCostIds), 2, "Fallback generator violated the sunk-cost limit");
  assert.equal(countFrom(generatedIds, selfJustificationIds), 1, "Fallback generator violated the self-justification limit");
  assert.equal(countFrom(generatedIds, endowmentIds), 1, "Fallback generator violated the endowment limit");
}

function difference(left, right) {
  const rightSet = new Set(right);
  let sharedItems = 0;
  let sharedPositions = 0;
  for (let index = 0; index < 16; index += 1) {
    if (rightSet.has(left[index])) sharedItems += 1;
    if (left[index] === right[index]) sharedPositions += 1;
  }
  return {
    differentItems: 16 - sharedItems,
    differentPositions: 16 - sharedPositions,
  };
}

function diversityReport(count) {
  let pairs = 0;
  let itemDifferenceTotal = 0;
  let positionDifferenceTotal = 0;
  let minimumItemDifference = 16;
  let minimumPositionDifference = 16;
  let maximumSamePositions = 0;

  for (let left = 0; left < count; left += 1) {
    for (let right = left + 1; right < count; right += 1) {
      const result = difference(catalog[left], catalog[right]);
      pairs += 1;
      itemDifferenceTotal += result.differentItems;
      positionDifferenceTotal += result.differentPositions;
      minimumItemDifference = Math.min(minimumItemDifference, result.differentItems);
      minimumPositionDifference = Math.min(minimumPositionDifference, result.differentPositions);
      maximumSamePositions = Math.max(maximumSamePositions, 16 - result.differentPositions);
    }
  }

  return {
    count,
    pairs,
    minimumDifferentItems: minimumItemDifference,
    averageDifferentItems: Number((itemDifferenceTotal / pairs).toFixed(2)),
    minimumDifferentPositions: minimumPositionDifference,
    averageDifferentPositions: Number((positionDifferenceTotal / pairs).toFixed(2)),
    maximumSamePositions,
  };
}

class AtomicCounterSimulation {
  constructor(size) {
    this.size = size;
    this.nextCard = 0;
    this.queue = Promise.resolve();
  }

  claim() {
    const result = this.queue.then(async () => {
      await Promise.resolve();
      const claimed = this.nextCard % this.size;
      this.nextCard = (claimed + 1) % this.size;
      return claimed;
    });
    this.queue = result.then(() => undefined);
    return result;
  }
}

for (let round = 0; round < 25; round += 1) {
  const allocator = new AtomicCounterSimulation(catalog.length);
  const claims = await Promise.all(Array.from({ length: 60 }, () => allocator.claim()));
  assert.deepEqual([...claims].sort((a, b) => a - b), Array.from({ length: 60 }, (_, index) => index));
}

const wrapAllocator = new AtomicCounterSimulation(catalog.length);
const wrappedClaims = await Promise.all(Array.from({ length: 200 }, () => wrapAllocator.claim()));
const claimCounts = new Map();
wrappedClaims.forEach((index) => claimCounts.set(index, (claimCounts.get(index) ?? 0) + 1));
assert.equal(claimCounts.size, 100, "Two hundred claims must use the whole catalogue");
assert.ok([...claimCounts.values()].every((count) => count === 2), "The catalogue must wrap evenly");

const previousSecret = process.env.SESSION_SIGNING_SECRET;
process.env.SESSION_SIGNING_SECRET = "bingo-test-secret-that-is-longer-than-thirty-two-characters";
const sessions = await loadTypeScriptModule("lib/signed-session.ts");
const token = sessions.signSession({ kind: "bingo", cardIndex: 27, expiresAt: Date.now() + 60_000 });
assert.equal(sessions.verifySession(token)?.cardIndex, 27, "A valid card cookie must survive refreshes");
assert.equal(sessions.verifySession(`${token.slice(0, -1)}x`), null, "A forged card cookie must be rejected");
const expired = sessions.signSession({ kind: "bingo", cardIndex: 27, expiresAt: Date.now() - 1 });
assert.equal(sessions.verifySession(expired), null, "An expired card cookie must be rejected");
if (previousSecret === undefined) delete process.env.SESSION_SIGNING_SECRET;
else process.env.SESSION_SIGNING_SECRET = previousSecret;

const migration = await readFile(resolve(repoRoot, "supabase/migrations/202609040001_bingo_card_allocator.sql"), "utf8");
assert.match(migration, /for update/i, "The database allocator must lock the counter row");
assert.match(migration, /enable row level security/i, "The counter table must use RLS");
assert.match(migration, /revoke all[\s\S]+anon[\s\S]+authenticated/i, "Public database roles must be revoked");
assert.doesNotMatch(migration, /\b(email|student_id|name|ip_address|fingerprint)\b/i, "The allocator must not add identifying fields");

const report = {
  cards: catalog.length,
  experiences: experiences.length,
  fallbackCardsGenerated: 2000,
  simultaneousClassRounds: 25,
  simultaneousStudentsPerRound: 60,
  first10: diversityReport(10),
  first30: diversityReport(30),
  first50: diversityReport(50),
};

const jsonArgumentIndex = process.argv.indexOf("--write-json");
if (jsonArgumentIndex >= 0) {
  const outputPath = process.argv[jsonArgumentIndex + 1];
  if (!outputPath) throw new Error("--write-json requires an output path");
  await writeFile(resolve(repoRoot, outputPath), `${JSON.stringify({ experiences, cards: catalog, report }, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
