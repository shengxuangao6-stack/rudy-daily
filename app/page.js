import daily from "../data/daily.json";
import ArticleCard from "../components/ArticleCard";
import FrontPageArticle from "../components/FrontPageArticle";
import Layout from "../components/Layout";
import TopicSection from "../components/TopicSection";

const sections = [
  "Technology & Society",
  "Public Life",
  "Mind & Relationships",
  "Culture & Daily Life",
  "Language & Self"
];

export default function HomePage() {
  const frontPageArticle =
    daily.articles.find((article) => article.isFrontPage) || daily.articles[0];

  return (
    <Layout daily={daily}>
      <div className="front-grid" id="front-page">
        <FrontPageArticle article={frontPageArticle} />
        <aside className="editorial-note" aria-label="Editor's note">
          <h2>Morning Note</h2>
          <p>
            Today&apos;s issue is a quiet reading ritual: clear English, useful
            ideas, and subjects close enough to real life to stay with you.
          </p>
        </aside>
      </div>

      {sections.map((section, index) => {
        const articles = daily.articles.filter((article) => article.topic === section);
        if (articles.length === 0) return null;

        return (
          <TopicSection
            id={sectionToId(section)}
            index={index + 1}
            key={section}
            title={section}
          >
            {articles.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </TopicSection>
        );
      })}
    </Layout>
  );
}

function sectionToId(section) {
  return section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
