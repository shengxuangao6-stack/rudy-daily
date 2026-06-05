const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const DAILY_PATH = path.join(ROOT, "data", "daily.json");
const MIN_ARTICLES = 5;
const MAX_ARTICLES = 8;
const MAX_PER_SOURCE = 2;
const MAX_PER_TOPIC = 2;
const START_DATE = "2026-06-04";

const topics = [
  "Technology & Society",
  "Public Life",
  "Mind & Relationships",
  "Culture & Daily Life",
  "Language & Self"
];

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
  },
  {
    source: "Brookings",
    url: "https://www.brookings.edu/feed/",
    topicHint: "Public Life"
  },
  {
    source: "Urban Institute",
    url: "https://www.urban.org/rss.xml",
    topicHint: "Public Life"
  },
  {
    source: "Pew Research Center",
    url: "https://www.pewresearch.org/feed/",
    topicHint: "Public Life"
  },
  {
    source: "IMF Blog",
    url: "https://www.imf.org/en/Blogs/RSS",
    topicHint: "Public Life"
  }
];

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
      "algorithm",
      "innovation",
      "students",
      "education",
      "laptop"
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
      "transport",
      "society",
      "work",
      "climate"
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
      "communication",
      "solitude",
      "reflection",
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
      "book",
      "books",
      "film",
      "music",
      "daily",
      "habit",
      "home"
    ]
  },
  {
    topic: "Language & Self",
    words: [
      "language",
      "english",
      "writing",
      "speaking",
      "communication",
      "voice",
      "learning",
      "reading",
      "study",
      "notebook"
    ]
  }
];

const topicImagePools = {
  "Technology & Society": [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
  ],
  "Public Life": [
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1200&q=80"
  ],
  "Mind & Relationships": [
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"
  ],
  "Culture & Daily Life": [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1200&q=80"
  ],
  "Language & Self": [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80"
  ]
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const previous = await readPreviousIssue();
  const today = getShanghaiDate();
  const fetched = await fetchAllFeeds();
  const articles = selectArticles(fetched, today);

  if (articles.length < MIN_ARTICLES) {
    console.log(`Only found ${articles.length} suitable articles. Keeping existing daily.json.`);
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
  console.log(`Topics: ${summarizeCounts(articles, "topic")}`);
  console.log(`Sources: ${summarizeCounts(articles, "source")}`);
}

async function readPreviousIssue() {
  const raw = await fs.readFile(DAILY_PATH, "utf8");
  return JSON.parse(raw);
}

async function fetchAllFeeds() {
  const results = await Promise.allSettled(feeds.map(fetchFeed));
  const articles = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      console.warn(result.reason.message);
    }
  }

  return articles;
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
  const candidates = scoreCandidates(items);
  const grouped = groupByTopic(candidates);
  const selected = selectBalancedMix(grouped, today);
  const usedImages = new Set();

  return selected.map((item, index) => {
    const image = pickImage(item.topic, item.title, today, index, usedImages);
    usedImages.add(image);

    return {
      id: `article-${String(index + 1).padStart(3, "0")}`,
      title: item.title,
      source: item.source,
      url: item.url,
      topic: item.topic,
      summary: item.summary,
      whyRecommended: makeWhyRecommended(item.topic),
      image,
      imageUrl: image,
      isFrontPage: index === 0,
      date: today
    };
  });
}

function scoreCandidates(items) {
  const seen = new Set();

  return items
    .map((item) => {
      const topic = classifyTopic(item, item.topicHint);
      const text = `${item.title} ${item.summary}`.toLowerCase();
      return {
        ...item,
        topic,
        score: scoreItem(text, topic)
      };
    })
    .filter((item) => {
      const key = normalizeUrl(item.url);
      if (seen.has(key)) return false;
      seen.add(key);
      return item.score > 0 && isReadableCandidate(item);
    })
    .sort((a, b) => b.score - a.score);
}

function groupByTopic(candidates) {
  const grouped = Object.fromEntries(topics.map((topic) => [topic, []]));

  for (const candidate of candidates) {
    grouped[candidate.topic]?.push(candidate);
  }

  return grouped;
}

function selectBalancedMix(grouped, today) {
  const selected = [];
  const sourceCounts = new Map();
  const topicCounts = new Map();
  const topicOrder = rotateArray(topics, seededIndex(today, "topic-order", topics.length));

  for (const topic of topicOrder) {
    const picked = takeCandidate(grouped[topic], sourceCounts, topicCounts, { topic, strictTopicLimit: true });
    if (picked) selected.push(picked);
    if (selected.length >= MIN_ARTICLES && countDistinct(selected, "topic") >= 4) break;
  }

  let relaxedTopicLimit = false;
  while (selected.length < MAX_ARTICLES) {
    const before = selected.length;

    for (const topic of topicOrder) {
      const picked = takeCandidate(grouped[topic], sourceCounts, topicCounts, {
        topic,
        strictTopicLimit: !relaxedTopicLimit
      });
      if (picked) selected.push(picked);
      if (selected.length >= MAX_ARTICLES) break;
    }

    if (selected.length === before) {
      if (!relaxedTopicLimit) {
        relaxedTopicLimit = true;
      } else {
        break;
      }
    }
  }

  return selected.slice(0, MAX_ARTICLES);
}

function takeCandidate(candidates, sourceCounts, topicCounts, options) {
  if (!candidates || candidates.length === 0) return null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const sourceCount = sourceCounts.get(candidate.source) || 0;
    const topicCount = topicCounts.get(options.topic) || 0;

    if (sourceCount >= MAX_PER_SOURCE) continue;
    if (options.strictTopicLimit && topicCount >= MAX_PER_TOPIC) continue;

    candidates.splice(index, 1);
    sourceCounts.set(candidate.source, sourceCount + 1);
    topicCounts.set(options.topic, topicCount + 1);
    return candidate;
  }

  return null;
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
  const clearArgumentScore = /\bwhy\b|\bhow\b|\bwhat\b|\bcan\b|\bshould\b|\bmake\b/.test(text) ? 2 : 0;
  const newsletterPenalty = /\bthe download\b|\bnewsletter\b|\broundup\b|\bpodcast\b/.test(text) ? -6 : 0;
  const videoPenalty = /\bwatch on\b|\bvideo\b/.test(text) ? -2 : 0;

  return topicScore + readabilityScore + clearArgumentScore + newsletterPenalty + videoPenalty + 2;
}

function isReadableCandidate(item) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  if (item.title.length > 115) return false;
  if (item.summary.length < 60) return false;
  if (/\bthe download\b|\bdaily briefing\b|\blive updates\b/.test(text)) return false;
  return true;
}

function makeSummary(text) {
  const cleaned = cleanText(text);
  if (!cleaned) return "";

  const sentence = cleaned.match(/^.*?[.!?](\s|$)/)?.[0]?.trim();
  const summary = sentence && sentence.length >= 60 ? sentence : cleaned;
  return truncate(summary, 190);
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

function pickImage(topic, title, today, index, usedImages) {
  const pool = topicImagePools[topic] || topicImagePools["Public Life"];
  const startIndex = seededIndex(`${today}-${title}-${index}`, topic, pool.length);

  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(startIndex + offset) % pool.length];
    if (!usedImages.has(candidate)) return candidate;
  }

  return pool[startIndex];
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
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
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

function rotateArray(values, startIndex) {
  return values.slice(startIndex).concat(values.slice(0, startIndex));
}

function seededIndex(seed, salt, length) {
  if (length <= 1) return 0;

  let hash = 2166136261;
  const text = `${seed}:${salt}`;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash) % length;
}

function countDistinct(items, key) {
  return new Set(items.map((item) => item[key])).size;
}

function summarizeCounts(items, key) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) || 0) + 1);
  }

  return [...counts.entries()].map(([name, count]) => `${name}: ${count}`).join(", ");
}
