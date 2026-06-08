const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const DAILY_PATH = path.join(ROOT, "data", "daily.json");
const HISTORY_PATH = path.join(ROOT, "data", "article-history.json");
const MIN_ARTICLES = 5;
const MAX_ARTICLES = 8;
const MAX_PER_SOURCE = 2;
const MAX_PER_TOPIC = 2;
const HISTORY_DAYS = 7;
const START_DATE = "2026-06-04";

const topics = [
  "Technology & Society",
  "Public Life",
  "Mind & Relationships",
  "Culture & Daily Life",
  "Language & Self"
];

const feeds = [
  { source: "The Conversation", url: "https://theconversation.com/global/articles.atom", topicHint: "Public Life" },
  { source: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", topicHint: "Technology & Society" },
  { source: "Psyche", url: "https://psyche.co/feed", topicHint: "Mind & Relationships" },
  { source: "Aeon", url: "https://aeon.co/feed.rss", topicHint: "Mind & Relationships" },
  { source: "Our World in Data", url: "https://ourworldindata.org/atom.xml", topicHint: "Public Life" },
  { source: "Brookings", url: "https://www.brookings.edu/feed/", topicHint: "Public Life" },
  { source: "Pew Research Center", url: "https://www.pewresearch.org/feed/", topicHint: "Public Life" },
  { source: "IMF Blog", url: "https://www.imf.org/en/Blogs/RSS", topicHint: "Public Life" },
  { source: "World Bank Blogs", url: "https://blogs.worldbank.org/en/rss.xml", topicHint: "Public Life" },
  { source: "Urban Institute", url: "https://www.urban.org/rss.xml", topicHint: "Public Life" }
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
      "robot",
      "software",
      "data center",
      "online learning",
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
      "climate",
      "war",
      "politics",
      "propaganda",
      "international",
      "population",
      "fertility",
      "mortality",
      "children",
      "ecosystem",
      "environment",
      "pollution",
      "health",
      "energy",
      "court",
      "law"
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
      "self",
      "spiritual",
      "mental health"
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
      "home",
      "rave",
      "dance",
      "festival",
      "fashion",
      "lifestyle",
      "entertainment"
    ]
  },
  {
    topic: "Language & Self",
    words: [
      "language",
      "english",
      "writing",
      "speaking",
      "voice",
      "learning",
      "reading",
      "study",
      "studying",
      "notebook",
      "classroom"
    ]
  }
];

const topicImagePools = {
  "Technology & Society": [
    ["ai", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"],
    ["ai", "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80"],
    ["laptop", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"],
    ["laptop", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"],
    ["innovation", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"],
    ["data", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80"],
    ["data", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80"],
    ["robot", "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=80"],
    ["digital", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"],
    ["team", "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"],
    ["online learning", "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"]
  ],
  "Public Life": [
    ["city", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80"],
    ["city", "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80"],
    ["government", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"],
    ["government", "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80"],
    ["housing", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"],
    ["policy", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"],
    ["urban life", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"],
    ["transportation", "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80"],
    ["environment", "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"],
    ["public health", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"],
    ["community", "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1200&q=80"],
    ["community", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"]
  ],
  "Mind & Relationships": [
    ["reflection", "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80"],
    ["reflection", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"],
    ["solitude", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"],
    ["mental health", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"],
    ["friendship", "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"],
    ["conversation", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"],
    ["conversation", "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=1200&q=80"],
    ["community", "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"],
    ["journal", "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80"],
    ["family", "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80"]
  ],
  "Culture & Daily Life": [
    ["cafe", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"],
    ["cafe", "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"],
    ["coffee", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"],
    ["books", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"],
    ["music", "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80"],
    ["music", "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=1200&q=80"],
    ["food", "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80"],
    ["film", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"],
    ["travel", "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1200&q=80"],
    ["daily moments", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"]
  ],
  "Language & Self": [
    ["reading", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"],
    ["reading", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"],
    ["bookshelf", "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80"],
    ["studying", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80"],
    ["studying", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"],
    ["notebook", "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80"],
    ["classroom", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"],
    ["writing", "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80"],
    ["library", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80"],
    ["learning", "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80"]
  ]
};

const backupCandidates = [
  {
    title: "How cities can make everyday life easier",
    source: "Urban Institute",
    url: "https://www.urban.org/",
    topicHint: "Public Life",
    summary: "This recommendation focuses on housing, transport, public space, and the small policy choices that shape city life."
  },
  {
    title: "Why friendship needs ordinary time",
    source: "Psyche",
    url: "https://psyche.co/",
    topicHint: "Mind & Relationships",
    summary: "This readable essay-style recommendation explores friendship, attention, and the emotional work of staying connected."
  },
  {
    title: "How technology changes student attention",
    source: "MIT Technology Review",
    url: "https://www.technologyreview.com/",
    topicHint: "Technology & Society",
    summary: "This recommendation connects digital tools, learning habits, and the everyday choices students make around attention."
  },
  {
    title: "The language of ordinary daily rituals",
    source: "Aeon",
    url: "https://aeon.co/",
    topicHint: "Culture & Daily Life",
    summary: "This recommendation uses daily life, culture, habits, and public places as material for natural English reading."
  },
  {
    title: "Finding your own voice while learning English",
    source: "The Conversation",
    url: "https://theconversation.com/",
    topicHint: "Language & Self",
    summary: "This recommendation connects reading, writing, expression, and the slow process of building a second-language voice."
  }
];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const previous = await readJsonFile(DAILY_PATH, { issueNumber: "000", articles: [] });
  const history = await readJsonFile(HISTORY_PATH, { recentArticles: [], recentFrontPages: [] });
  const today = getShanghaiDate();

  console.log(`Rudy Daily update started for ${today}`);
  console.log(`Old issue number: ${previous.issueNumber || "unknown"}`);

  const fetched = await fetchAllFeeds();
  console.log(`Fetched candidate articles: ${fetched.length}`);

  const candidatePool = fetched.length >= MIN_ARTICLES ? fetched : fetched.concat(backupCandidates);
  if (fetched.length < MIN_ARTICLES) {
    console.warn("Not enough fetched candidates. Using backup candidate pool.");
  }

  const articles = selectArticles(candidatePool, today, history);
  if (articles.length < MIN_ARTICLES) {
    console.warn(`Only found ${articles.length} suitable articles. Keeping existing daily.json.`);
    return;
  }

  const daily = {
    date: today,
    issueNumber: getIssueNumber(today),
    generatedAt: new Date().toISOString(),
    articles
  };

  console.log(`New issue number: ${daily.issueNumber}`);
  console.log(`Selected articles: ${articles.length}`);
  for (const article of articles) {
    console.log(`- ${article.isFrontPage ? "[FRONT] " : ""}${article.title}`);
    console.log(`  source=${article.source}; topic=${article.topic}; imageKeyword=${article.imageKeyword}`);
  }
  console.log(`Topics: ${summarizeCounts(articles, "topic")}`);
  console.log(`Sources: ${summarizeCounts(articles, "source")}`);
  console.log(`Front page article: ${articles.find((article) => article.isFrontPage)?.title || "none"}`);

  const nextJson = `${JSON.stringify(daily, null, 2)}\n`;
  const previousJson = `${JSON.stringify(previous, null, 2)}\n`;
  if (nextJson === previousJson) {
    console.log("daily.json changed: no");
    return;
  }

  await fs.writeFile(DAILY_PATH, nextJson, "utf8");
  await fs.writeFile(HISTORY_PATH, `${JSON.stringify(updateHistory(history, articles, today), null, 2)}\n`, "utf8");
  console.log("daily.json changed: yes");
  console.log("article-history.json updated: yes");
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
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
  let response;
  try {
    response = await fetch(feed.url, {
      headers: { "user-agent": "Rudy Daily article discovery bot/1.0" }
    });
  } catch (error) {
    throw new Error(`${feed.source} fetch failed: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`${feed.source} returned ${response.status}`);
  }

  const xml = await response.text();
  return parseFeed(xml).map((item) => ({ ...item, source: feed.source, topicHint: feed.topicHint }));
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
  return readTag(block, "link").trim();
}

function selectArticles(items, today, history) {
  const candidates = scoreCandidates(items, today, history);
  const grouped = groupByTopic(candidates);
  const selected = selectBalancedMix(grouped, today);
  const frontPage = selectFrontPage(selected, history, today);
  const ordered = frontPage ? [frontPage, ...selected.filter((item) => item !== frontPage)] : selected;
  const usedImages = new Set();

  return ordered.map((item, index) => {
    const imageMeta = pickImage(item, today, index, usedImages);
    usedImages.add(imageMeta.url);

    return {
      id: `article-${String(index + 1).padStart(3, "0")}`,
      title: item.title,
      source: item.source,
      url: item.url,
      topic: item.topic,
      summary: item.summary,
      whyRecommended: makeWhyRecommended(item.topic),
      image: imageMeta.url,
      imageUrl: imageMeta.url,
      imageKeyword: imageMeta.keyword,
      isFrontPage: index === 0,
      date: today
    };
  });
}

function scoreCandidates(items, today, history) {
  const seen = new Set();
  const recentUrls = new Set((history.recentArticles || [])
    .filter((item) => daysBetween(item.date, today) < HISTORY_DAYS)
    .map((item) => normalizeUrl(item.url)));

  return items
    .map((item) => {
      const topic = classifyTopic(item, item.topicHint);
      const text = `${item.title} ${item.summary}`.toLowerCase();
      return { ...item, topic, score: scoreItem(text, topic) };
    })
    .filter((item) => {
      const key = normalizeUrl(item.url);
      if (seen.has(key) || recentUrls.has(key)) return false;
      seen.add(key);
      return item.score > 0 && isReadableCandidate(item);
    })
    .sort((a, b) => b.score - a.score);
}

function groupByTopic(candidates) {
  const grouped = Object.fromEntries(topics.map((topic) => [topic, []]));
  for (const candidate of candidates) grouped[candidate.topic]?.push(candidate);
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
  }

  const requiredPairs = [
    ["Culture & Daily Life", "Mind & Relationships"],
    ["Public Life", "Technology & Society"]
  ];
  for (const pair of requiredPairs) {
    if (!selected.some((item) => pair.includes(item.topic))) {
      for (const topic of pair) {
        const picked = takeCandidate(grouped[topic], sourceCounts, topicCounts, { topic, strictTopicLimit: true });
        if (picked) {
          selected.push(picked);
          break;
        }
      }
    }
  }

  while (selected.length < MAX_ARTICLES) {
    const before = selected.length;
    for (const topic of topicOrder) {
      const picked = takeCandidate(grouped[topic], sourceCounts, topicCounts, { topic, strictTopicLimit: true });
      if (picked) selected.push(picked);
      if (selected.length >= MAX_ARTICLES) break;
    }
    if (selected.length === before) break;
  }

  if (countDistinct(selected, "source") < 3) console.warn("Source diversity warning: fewer than 3 sources selected.");
  if (countDistinct(selected, "topic") < 3) console.warn("Topic diversity warning: fewer than 3 topics selected.");
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
  const text = `${item.title} ${item.summary} ${item.source} ${fallback || ""}`.toLowerCase();
  const forcedTopic = forceTopic(text);
  if (forcedTopic) return forcedTopic;

  let best = { topic: fallback || "Public Life", hits: 0 };
  for (const group of topicKeywords) {
    const hits = group.words.reduce((count, word) => count + (matchesKeyword(text, word) ? keywordWeight(word, text) : 0), 0);
    if (hits > best.hits) best = { topic: group.topic, hits };
  }
  return best.topic;
}

function forceTopic(text) {
  if (/\b(ecosystem|ecosystems|environment|pollution|climate|farm animals|food system|battery|batteries|transport|electrified transport|immigration|migration|population|fertility|mortality|abortion|abortions|health care|healthcare|global health|china|maritime|international affairs|earth's true shape|shape is the earth)\b/.test(text)) {
    return "Public Life";
  }
  if (/\b(friendship|relationship|family|anxiety|mental health|emotion|loneliness|solitude|kindness|cruelty|goodness|psychologist|psychology|moral character|senses|perception|attention|body)\b/.test(text)) {
    return "Mind & Relationships";
  }
  if (/\b(rave|raves|music|dance|festival|film|movie|food|cafe|coffee|fashion|opera|artist|entertainment|world cup|football|sport|sports|ball)\b/.test(text)) {
    return "Culture & Daily Life";
  }
  if (/\b(ai|artificial intelligence|chatbot|chatbots|algorithm|software|digital platform|data center)\b/.test(text)) {
    return "Technology & Society";
  }
  if (/\b(population|fertility|mortality|children die|public health|ecosystem|pollution|climate|housing|government|policy|court|lawsuit|war|propaganda)\b/.test(text)) {
    return "Public Life";
  }
  if (/\b(english|language learning|writing|speaking|reading|notebook|classroom)\b/.test(text)) {
    return "Language & Self";
  }
  return null;
}

function scoreItem(text, topic) {
  const topicWords = topicKeywords.find((item) => item.topic === topic)?.words || [];
  const topicScore = topicWords.reduce((score, word) => score + (matchesKeyword(text, word) ? 2 : 0), 0);
  const readabilityScore = text.length > 120 && text.length < 900 ? 2 : 0;
  const clearArgumentScore = /\bwhy\b|\bhow\b|\bwhat\b|\bcan\b|\bshould\b|\bmake\b/.test(text) ? 2 : 0;
  const newsletterPenalty = /\bthe download\b|\bnewsletter\b|\broundup\b|\bpodcast\b|\bdaily briefing\b/.test(text) ? -8 : 0;
  const videoPenalty = /\bwatch on\b|\bvideo\b/.test(text) ? -2 : 0;
  return topicScore + readabilityScore + clearArgumentScore + newsletterPenalty + videoPenalty + 2;
}

function isReadableCandidate(item) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const title = item.title.toLowerCase();
  if (item.title.length > 120) return false;
  if (item.summary.length < 55) return false;
  if (/\bthe download\b|\bdaily briefing\b|\blive updates\b|\bwe're looking for\b|\bwe are looking for\b|\bhiring\b|\bjob opening\b|\bapply now\b|\bcall for pitches\b/.test(text)) return false;
  if (item.title.length < 24 && !/\b(how|why|what|can|should|guide|friend|talk|habit|people|student|city|life|language|read|write)\b/.test(title)) return false;
  return true;
}

function selectFrontPage(articles, history, today) {
  const recentFrontPages = new Set((history.recentFrontPages || [])
    .filter((item) => daysBetween(item.date, today) < HISTORY_DAYS)
    .map((item) => normalizeUrl(item.url)));
  return articles.map((article) => ({ article, score: frontPageScore(article, recentFrontPages) }))
    .sort((a, b) => b.score - a.score)[0]?.article;
}

function frontPageScore(article, recentFrontPages) {
  const broadTopicBonus = ["Technology & Society", "Public Life", "Mind & Relationships"].includes(article.topic) ? 3 : 1;
  const titleBonus = /\bhow\b|\bwhy\b|\bwhat\b|\bcan\b|\bshould\b/i.test(article.title) ? 2 : 0;
  const lengthBonus = article.title.length >= 35 && article.title.length <= 95 ? 2 : 0;
  const sourceBonus = ["The Conversation", "Psyche", "Aeon", "MIT Technology Review", "Our World in Data"].includes(article.source) ? 2 : 1;
  const repeatPenalty = recentFrontPages.has(normalizeUrl(article.url)) ? -10 : 0;
  return article.score + broadTopicBonus + titleBonus + lengthBonus + sourceBonus + repeatPenalty;
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
    "Technology & Society": "This article connects technology with everyday learning, attention, and social change, making it useful for building modern English expressions.",
    "Public Life": "This article gives clear language for public issues, evidence, and social change without becoming too academic.",
    "Mind & Relationships": "This article helps the reader describe emotions, relationships, and personal growth in natural English.",
    "Culture & Daily Life": "This article links English reading with ordinary culture and daily experience, so the language feels easier to absorb.",
    "Language & Self": "This article supports the reader's goal of developing an English version of their own thoughts and expression."
  };
  return reasons[topic] || reasons["Public Life"];
}

function pickImage(article, today, index, usedImages) {
  const pool = topicImagePools[article.topic] || topicImagePools["Public Life"];
  const keyword = pickImageKeyword(article);
  const preferredOptions = pool.filter(([candidateKeyword]) => candidateKeyword === keyword);
  const rotatedPreferred = rotateArray(
    preferredOptions,
    seededIndex(`${today}-${article.title}-${index}`, keyword, preferredOptions.length)
  );
  const fallbackOptions = rotateArray(
    pool.filter(([candidateKeyword]) => candidateKeyword !== keyword),
    seededIndex(`${today}-${article.source}-${index}`, article.topic, pool.length)
  );
  const orderedPool = rotatedPreferred.concat(fallbackOptions);

  for (const [candidateKeyword, url] of orderedPool) {
    if (!usedImages.has(url)) return { keyword: candidateKeyword, url };
  }
  const [fallbackKeyword, fallbackUrl] = orderedPool[0];
  return { keyword: fallbackKeyword, url: fallbackUrl };
}

function pickImageKeyword(article) {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  const keywordMap = {
    "Technology & Society": [["ai", ["ai", "artificial intelligence", "algorithm"]], ["robot", ["robot", "automation"]], ["data", ["data", "digital", "platform", "internet"]], ["laptop", ["student", "learning", "education", "online"]], ["innovation", ["innovation", "technology"]]],
    "Public Life": [["public health", ["health", "health care", "healthcare", "abortion", "abortions"]], ["community", ["population", "children", "community", "migration", "fertility", "mortality"]], ["government", ["government", "policy", "court", "law", "politic", "propaganda", "war", "immigration"]], ["housing", ["housing", "home", "rent"]], ["transportation", ["transport", "vehicle", "street", "traffic"]], ["environment", ["climate", "ecosystem", "pollution", "energy", "environment", "earth"]], ["city", ["city", "urban"]]],
    "Mind & Relationships": [["conversation", ["conversation", "communication"]], ["friendship", ["friend", "family", "relationship"]], ["mental health", ["mental", "anxiety", "emotion"]], ["solitude", ["solitude", "alone"]], ["reflection", ["reflection", "self", "spiritual"]]],
    "Culture & Daily Life": [["music", ["rave", "music", "dance", "festival"]], ["film", ["film", "movie", "video"]], ["food", ["food", "restaurant"]], ["cafe", ["cafe", "coffee"]], ["books", ["book", "knowledge"]], ["travel", ["travel", "city life"]]],
    "Language & Self": [["reading", ["reading", "english"]], ["writing", ["writing", "voice"]], ["notebook", ["notebook", "journal"]], ["studying", ["study", "learning"]], ["classroom", ["classroom", "language"]]]
  };
  for (const [keyword, words] of keywordMap[article.topic] || keywordMap["Public Life"]) {
    if (words.some((word) => matchesKeyword(text, word))) return keyword;
  }
  const defaults = {
    "Technology & Society": "innovation",
    "Public Life": "city",
    "Mind & Relationships": "reflection",
    "Culture & Daily Life": "daily moments",
    "Language & Self": "reading"
  };
  return defaults[article.topic] || "city";
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

function updateHistory(history, articles, today) {
  const recentArticles = history.recentArticles || [];
  const recentFrontPages = history.recentFrontPages || [];
  const nextArticles = recentArticles.concat(articles.map((article) => ({
    date: today,
    title: article.title,
    url: article.url,
    source: article.source,
    topic: article.topic
  })));
  const frontPage = articles.find((article) => article.isFrontPage);
  const nextFrontPages = frontPage
    ? recentFrontPages.concat({ date: today, title: frontPage.title, url: frontPage.url })
    : recentFrontPages;
  return {
    recentArticles: nextArticles.filter((item) => daysBetween(item.date, today) < HISTORY_DAYS),
    recentFrontPages: nextFrontPages.filter((item) => daysBetween(item.date, today) < HISTORY_DAYS)
  };
}

function cleanText(value) {
  return repairMojibake(decodeEntities(stripTags(value || ""))).replace(/\s+/g, " ").trim();
}

function repairMojibake(value) {
  return value
    .replace(/鈥檚/g, "'s")
    .replace(/鈥檛/g, "n't")
    .replace(/鈥檙/g, "'r")
    .replace(/鈥檓/g, "'m")
    .replace(/鈥檒/g, "'l")
    .replace(/鈥檝/g, "'v")
    .replace(/鈥檇/g, "'d")
    .replace(/鈥\?/g, "-")
    .replace(/鈥淎/g, '"A')
    .replace(/鈥漌/g, '"W')
    .replace(/鈥/g, "'")
    .replace(/檚/g, "'s")
    .replace(/�/g, "'");
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

function keywordWeight(word, text) {
  return matchesKeyword(text.slice(0, 160), word) ? 3 : 1;
}

function matchesKeyword(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function daysBetween(date, today) {
  const start = Date.parse(`${date}T00:00:00Z`);
  const end = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return HISTORY_DAYS;
  return Math.max(0, Math.floor((end - start) / 86400000));
}

function countDistinct(items, key) {
  return new Set(items.map((item) => item[key])).size;
}

function summarizeCounts(items, key) {
  const counts = new Map();
  for (const item of items) counts.set(item[key], (counts.get(item[key]) || 0) + 1);
  return [...counts.entries()].map(([name, count]) => `${name}: ${count}`).join(", ");
}
