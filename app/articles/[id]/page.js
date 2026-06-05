import Link from "next/link";
import daily from "../../../data/daily.json";
import Layout from "../../../components/Layout";

export function generateStaticParams() {
  return daily.articles.map((article) => ({ id: article.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = daily.articles.find((item) => item.id === id);

  return {
    title: article ? `${article.title} | Rudy Daily` : "Article | Rudy Daily"
  };
}

export default async function ArticleDetailPage({ params }) {
  const { id } = await params;
  const article = daily.articles.find((item) => item.id === id);
  const image = article?.image || article?.imageUrl;

  return (
    <Layout daily={daily}>
      {!article ? (
        <main className="not-found">
          <p className="kicker">Archive Notice</p>
          <h1>Article not found</h1>
          <Link className="read-button" href="/">
            Back to Rudy Daily
          </Link>
        </main>
      ) : (
        <main className="detail-page">
          <Link className="back-button" href="/">
            Back to Home
          </Link>
          <p className="kicker">{article.topic}</p>
          <h1 className="detail-title">{article.title}</h1>
          <p className="source-line">{article.source}</p>
          <img className="detail-image" src={image} alt="" />

          <section className="detail-panel" aria-labelledby="summary-heading">
            <h2 id="summary-heading">One-Sentence Summary</h2>
            <p>{article.summary}</p>
          </section>

          <section className="detail-panel" aria-labelledby="why-heading">
            <h2 id="why-heading">Why Recommended</h2>
            <p>{article.whyRecommended}</p>
          </section>

          <a className="read-button" href={article.url} rel="noreferrer" target="_blank">
            Read Original Article
          </a>
        </main>
      )}
    </Layout>
  );
}
