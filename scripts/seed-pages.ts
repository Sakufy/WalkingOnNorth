/**
 * Seed page content from CONTENT.md into the Turso pages table.
 *
 * Run: npx tsx scripts/seed-pages.ts
 */

import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function upsert(slug: string, title: string, content: string) {
  return db.execute({
    sql: `INSERT INTO pages (slug, title, content, updated_at)
          VALUES (?, ?, ?, datetime('now'))
          ON CONFLICT (slug) DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            updated_at = datetime('now')`,
    args: [slug, title, content],
  });
}

async function main() {
  console.log("Seeding pages...\n");

  // ====== About page ======
  const aboutSections = [
    {
      heading: "关于我",
      body: [
        "我是路行北，一个在世俗标准与内心真实之间反复校准的普通人。",
        "从职场的迷茫到内心的觉醒，从被外界定义到开始定义自己，这条路走了很久。但每一步的脚印，都成为了今天北行之路的基石。",
        "我拒绝被任何一种单一身份定义。我阅读、思考、写作、践行，试图以独立个体的方式，走出一条属于自己的成长道路。",
        "北行之路就是这样诞生的——它是我自我成长的记录，也是对同路人的邀约。",
      ],
    },
    {
      heading: "网站理念",
      body: [
        "北行之路相信：真正的成长不是向外的攀爬，而是向内的探索。我们称之为「北行」——在一个人人奔向「南方」成功模板的时代，选择逆流而上，走向内心真实的北方。",
        "这里不做流量运营，不贩卖焦虑，不兜售速效配方。每一篇文章都是创作者真实的思考沉淀，每一次更新都是成长的自然流动。读者在这里看到的不是精心包装的「成功学」，而是一个人真诚的成长过程。",
        "我们相信内容的筛选力。每一篇文章既是对同类人的信号，也是对不同路人的尊重告别。不适合的读者会自然离开，真正共鸣的人会留下来——这就是我们想要的双向选择。",
      ],
    },
    {
      heading: "联系我",
      body: [
        "邮箱：northwalking@163.com",
        "如果你也有相似的故事想分享，或者对「北行独元」成长体系有自己的思考，欢迎来信交流。",
      ],
    },
  ];

  const aboutContent = JSON.stringify({ sections: aboutSections });
  await upsert("about", "关于", aboutContent);
  console.log("✅ about page seeded");

  // ====== Home page ======
  const homeContent = JSON.stringify({
    slogan: "向内探寻，向北而行",
    philosophy: [
      "北行之路从不是被划定的人生轨道，而是一片任由自我开拓的旷野。",
      "我们拒绝世俗单一的成功规训，坚持每个人都有自己的成长节奏。在这里，没有标准答案，只有属于你的探索路径。",
      "文字是思考的沉淀，分享是成长的实践。所有内容都是创作者真实的行走记录，而非精心包装的人设。",
    ],
    audience: [
      { title: "不甘规训者", trait: "独立意志", text: "拒绝被社会时钟和他人期待定义，渴望按自己的方式活着。" },
      { title: "向内求索者", trait: "深度自省", text: "不满足于表象答案，习惯追问「为什么」并寻找自己的理解。" },
      { title: "务实破局者", trait: "摒弃内耗", text: "相信行动的力量。不是空想家，而是把思考转化为实践的人。" },
      { title: "长期践行者", trait: "追求自洽", text: "不急于求成，相信时间的力量。在持续积累中寻找内心的平衡与完整。" },
    ],
  });
  await upsert("home", "首页", homeContent);
  console.log("✅ home page seeded");

  // ====== Articles page ======
  const articlesContent = JSON.stringify({
    headline: "长路纪行",
    intro: [
      "每一篇文章，都是一段心路历程的记录。",
      "从自我探索到自我实现，这里是完整成长轨迹的见证——不是终点，而是路上的每一个脚印。",
    ],
  });
  await upsert("articles", "长路纪行", articlesContent);
  console.log("✅ articles page seeded");

  // ====== Section pages ======
  const sections = [
    {
      slug: "section-thinking",
      title: "自我探索",
      content: JSON.stringify({
        headline: "认识自己，是一切成长的起点",
        intro: [
          "真正的成长始于对自我的诚实审视。",
          "在这里，我们通过阅读、写作和反思，剥离外界赋予的标签，逐渐看见那个真实的内在自我。",
        ],
      }),
    },
    {
      slug: "section-reading",
      title: "自我提升",
      content: JSON.stringify({
        headline: "用行动搭建理想的自己",
        intro: [
          "知道不等于做到。自我提升需要将认知转化为习惯，将理想内化为日常。",
          "从读书笔记到实践心得，这里记录着每一个微小但坚实的进步。",
        ],
      }),
    },
    {
      slug: "section-journey",
      title: "自我实现",
      content: JSON.stringify({
        headline: "在创造中找到生命的完整",
        intro: [
          "当探索与提升积累到一定程度，自我实现不再是一个目标，而是一种自然的生命状态。",
          "创造、分享、连接——这是成长闭环的最后一环，也是新一轮成长的起点。",
        ],
      }),
    },
  ];

  for (const s of sections) {
    await upsert(s.slug, s.title, s.content);
    console.log(`✅ ${s.slug} seeded`);
  }

  console.log("\n🎉 All page content seeded!");
}

main().catch(console.error);
