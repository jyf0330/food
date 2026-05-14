import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "src", "data");
const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), "utf8"));

const expectedFiles = [
  "data-sources.json",
  "dishes.seed.json",
  "ingredients.seed.json",
  "nutrition.seed.json",
  "platform-keywords.json",
  "price-baseline.json",
  "season-shenzhen.json",
];
const defaultHomeDishes = [
  "番茄炒蛋",
  "土豆焖鸡",
  "清蒸鲈鱼",
  "蒜蓉菜心",
  "肉末蒸蛋",
  "番茄牛肉",
  "紫菜蛋花汤",
  "虾仁滑蛋",
  "白灼芥兰",
  "丝瓜蛋花汤",
  "玉米胡萝卜排骨汤",
  "家常豆腐",
];

const files = new Set(readdirSync(dataDir));
const missingFiles = expectedFiles.filter((file) => !files.has(file));
if (missingFiles.length) {
  throw new Error(`src/data missing files: ${missingFiles.join(", ")}`);
}

const dishes = readJson("dishes.seed.json");
const ingredients = readJson("ingredients.seed.json");
if (dishes.length !== 302) {
  throw new Error(`expected 302 dishes, got ${dishes.length}`);
}
if (ingredients.length !== 165) {
  throw new Error(`expected 165 ingredients, got ${ingredients.length}`);
}

const dishNames = new Set(dishes.map((dish) => dish.dish_name));
const missingHomeDishes = defaultHomeDishes.filter((name) => !dishNames.has(name));
if (missingHomeDishes.length) {
  throw new Error(`default home dishes missing from migrated catalog: ${missingHomeDishes.join(", ")}`);
}

console.log("data migration ok: 302 dishes, 165 ingredients, 12 default home dishes found");
