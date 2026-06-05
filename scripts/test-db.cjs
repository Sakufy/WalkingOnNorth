const postgres = require("postgres");

async function test(label, opts) {
  const sql = postgres(opts);
  try {
    const r = await sql`SELECT 1 AS test`;
    console.log("OK", label, "->", r);
    await sql.end();
    return true;
  } catch (e) {
    console.log("FAIL", label, ":", e.message?.slice(0, 200));
    await sql.end().catch(() => {});
    return false;
  }
}

async function main() {
  // Test via object config (avoid URL parsing issues)
  const base = {
    user: "postgres.rktekmylbzleclksfibv",
    password: "GODmon666",
    database: "postgres",
    prepare: false,
    connect_timeout: 5,
  };

  // Pooler regions
  const regions = [
    "us-east-1",
    "ap-southeast-1",
    "us-west-2",
    "eu-west-1",
    "ap-northeast-1",
    "ap-south-1",
  ];

  for (const r of regions) {
    if (
      await test(`pooler ${r}:6543`, {
        ...base,
        host: `aws-0-${r}.pooler.supabase.com`,
        port: 6543,
      })
    )
      return;

    if (
      await test(`pooler ${r}:5432`, {
        ...base,
        host: `aws-0-${r}.pooler.supabase.com`,
        port: 5432,
      })
    )
      return;
  }

  // IPv4 directly to the pooler IP that resolved earlier
  if (
    await test("direct IPv4 44.216.29.125:6543", {
      ...base,
      host: "44.216.29.125",
      port: 6543,
    })
  )
    return;

  // Try without project ref in username
  if (
    await test("no-ref us-east-1:6543", {
      host: "aws-0-us-east-1.pooler.supabase.com",
      port: 6543,
      user: "postgres",
      password: "GODmon666",
      database: "postgres",
      prepare: false,
      connect_timeout: 5,
    })
  )
    return;
}

main().catch((e) => console.error("FATAL:", e));
