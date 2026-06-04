const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const DAILY_PATH = path.join(ROOT, "data", "daily.json");
const MAX_ARTICLES = 8;
const START_DATE = "2026-06-04";

const feeds = [
  {
    source: "The Conversation",
    url: "https://theconversation.com/global/articles.atom",
    topicHint: "Public Life"
  },
  {
    source: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    topicHint: "Technology & Society"
  },
  {
    source: "Psyche",
    url: "https://psyche.co/feed",
    topicHint: "Mind & Relationships"
  },
  {
    source: "Aeon",
    url: "https://aeon.co/feed.rss",
    topicHint: "Mind & Relationships"
  },
  {
    source: "Our World in Data",
    url: "https://ourworldindata.org/atom.xml",
    topicHint: "Public Life"
  },
  {
    source: "World Bank Blogs",
    url: "https://blogs.worldbank.org/en/rss.xml",
    topicHint: "Public Life"
  }
];

const topicImages = {
  "Technology & Society":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
  "Public Life":
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80",
  "Mind & Relationships":
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80",
  "Culture & Daily Life":
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
  "Language & Self":
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80"
};

const topicKeywords = [
  {
    topic: "Technology & Society",
    words: [
      "ai",
      "artificial intelligence",
      "technology",
      "digital",
      "platform",
      "internet",
      "media",
      "students",
      "education"
    ]
  },
  {
    topic: "Public Life",
    words: [
      "policy",
      "city",
      "cities",
      "housing",
      "economy",
      "inequality",
      "government",
      "public",
      "urban",
      "society"
    ]
  },
  {
    topic: "Mind & Relationships",
    words: [
      "psychology",
      "emotion",
      "friendship",
      "relationship",
      "mental",
      "anxiety",
      "family",
      "self"
    ]
  },
  {
    topic: "Culture & Daily Life",
    words: [
      "culture",
      "life",
      "travel",
      "food",
      "cafe",
      "film",
      "music",
      "daily",
      "habit"
    ]
  },
  {
    topic: "Language & Self",
    words: ["language", "english", "writing", "speaking", "communication", "voice", "learning"]
  }
];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const previous = await readPreviousIssue();
  const today = getShanghaiDate();
  const fetched = await fetchAllFeeds();
  const articles = selectArticles(fetched, today);

  if (articles.length < 5) {
    console.log("Not enough feed articles fetched. Keeping existing daily.json.");
    return;
  }

  const daily = {
    date: today,
    issueNumber: getIssueNumber(today),
    articles
  };

  const nextJson = `${JSON.stringify(daily, null, 2)}\n`;
  const previousJson = `${JSON.stringify(previous, null, 2)}\n`;

  if (nextJson === previousJson) {
    console.log("daily.json is already up to date.");
    return;
  }

  await fs.writeFile(DAILY_PATH, nextJson, "utf8");
  console.log(`Updated daily.json for ${today} with ${articles.length} articles.`);
}

async function readPreviousIssue() {
  const raw = await fs.readFile(DAILY_PATH, "utf8");
  return JSON.parse(raw);
}

async function fetchAllFeeds() {
  const results = await Promise.allSettled(feeds.map(fetchFeed));
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      "user-agent": "Rudy Daily article discovery bot/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`${feed.source} returned ${response.status}`);
  }

  const xml = await response.text();
  return parseFeed(xml).map((item) => ({
    ...item,
    source: feed.source,
    topicHint: feed.topicHint
  }));
}

function parseFeed(xml) {
  const itemBlocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0]);

  return itemBlocks
    .map((block) => {
      const title = cleanText(readTag(block, "title"));
      const summary = makeSummary(cleanText(readTag(block, "summary") || readTag(block, "description") || readTag(block, "content")));
      const url = readLink(block);
      const date = cleanText(readTag(block, "published") || readTag(block, "updated") || readTag(block, "pubDate"));

      return { title, summary, url, publishedAt: date };
    })
    .filter((item) => item.title && item.url && item.summary);
}

function readTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(stripCdata(match[1])) : "";
}

function readLink(block) {
  const hrefMatch = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (hrefMatch) return decodeEntities(hrefMatch[1]);

  const linkText = readTag(block, "link");
  return linkText.trim();
}

function selectArticles(items, today) {
  const seen = new Set();
  const scored = items
    .map((item) => {
      const topic = classifyTopic(item, item.topicHint);
      const text = `${item.title} ${item.summary}`.toLowerCase();
      const score = scoreItem(text, topic);
      return { ...item, topic, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected = [];
  for (const item of scored) {
    const key = normalizeUrl(item.url);
    if (seen.has(key)) continue;
    seen.add(key);

    selected.push({
      id: `article-${String(selected.length + 1).padStart(3, "0")}`,
      title: item.title,
      source: item.source,
      url: item.url,
      topic: item.topic,
      summary: item.summary,
      whyRecommended: makeWhyRecommended(item.topic),
      imageUrl: selected.length === 0 ? frontPageImage(item.topic) : topicImages[item.topic],
      isFrontPage: selected.length === 0,
      date: today
    });

    if (selected.length >= MAX_ARTICLES) break;
  }

  return selected;
}

function classifyTopic(item, fallback) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  let best = { topic: fallback || "Public Life", hits: 0 };

  for (const group of topicKeywords) {
    const hits = group.words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    if (hits > best.hits) best = { topic: group.topic, hits };
  }

  return best.topic;
}

function scoreItem(text, topic) {
  const topicWords = topicKeywords.find((item) => item.topic === topic)?.words || [];
  const topicScore = topicWords.reduce((score, word) => score + (text.includes(word) ? 2 : 0), 0);
  const readabilityScore = text.length > 120 && text.length < 900 ? 2 : 0;
  const interestScore = topicScore > 0 ? 3 : 1;
  return topicScore + readabilityScore + interestScore;
}

function makeSummary(text) {
  const cleaned = cleanText(text);
  if (!cleaned) return "";

  const sentence = cleaned.match(/^.*?[.!?](\s|$)/)?.[0]?.trim();
  const summary = sentence && sentence.length >= 60 ? sentence : cleaned;
  return truncate(summary, 180);
}

function makeWhyRecommended(topic) {
  const reasons = {
    "Technology & Society":
      "This article connects technology with everyday learning, attention, and social change, making it useful for building modern English expressions.",
    "Public Life":
      "This article gives clear language for public issues, evidence, and social change without becoming too academic.",
    "Mind & Relationships":
      "This article helps the reader describe emotions, relationships, and personal growth in natural English.",
    "Culture & Daily Life":
      "This article links English reading with ordinary culture and daily experience, so the language feels easier to absorb.",
    "Language & Self":
      "This article supports the reader's goal of developing an English version of their own thoughts and expression."
  };

  return reasons[topic] || reasons["Public Life"];
}

function frontPageImage(topic) {
  if (topic === "Technology & Society") {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";
  }

  return topicImages[topic];
}

function getShanghaiDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getIssueNumber(today) {
  const start = Date.parse(`${START_DATE}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  const days = Math.max(0, Math.floor((current - start) / 86400000));
  return String(days + 1).padStart(3, "0");
}

function cleanText(value) {
  return decodeEntities(stripTags(value || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ");
}

function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-");
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url;
  }
}
