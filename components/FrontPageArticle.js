import Link from "next/link";

export default function FrontPageArticle({ article }) {
  return (
    <main className="front-page">
      <img className="front-image" src={article.imageUrl} alt="" />
      <div className="front-copy">
        <p className="kicker">Front Page / {article.topic}</p>
        <h2 className="front-title">{article.title}</h2>
        <p className="source-line">{article.source}</p>
        <p className="summary">{article.summary}</p>
        <div className="card-actions">
          <Link className="read-button" href={`/articles/${article.id}`}>
            View Recommendation
          </Link>
          <a className="secondary-link" href={article.url} rel="noreferrer" target="_blank">
            Read Original Article
          </a>
        </div>
      </div>
    </main>
  );
}
