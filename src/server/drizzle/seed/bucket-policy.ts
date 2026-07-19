import { join } from "node:path";
import { seedBucketPolicy } from "./apply-bucket-policy";

async function main() {
  const sqlDir = join(__dirname, "sql");
  await seedBucketPolicy(sqlDir);
  console.log("\n🎉 Bucket policy seed completed successfully!");
}

main().catch((error) => {
  console.error("\n❌ Bucket policy seed failed:", error);
  process.exit(1);
});
