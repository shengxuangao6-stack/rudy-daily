import Link from "next/link";

export default function ArticleCard({ article }) {
  const image = article.image || article.imageUrl;

  return (
    <article className="article-card">
      <img className="article-image" src={image} alt="" />
      <div className="article-card-body">
        <div className="article-meta">
          <span className="topic-tag">{article.topic}</span>
          <span className="dot" aria-hidden="true" />
          <span className="source-line">{article.source}</span>
        </div>
        <h3 className="article-title">{article.title}</h3>
        <p className="summary">{article.summary}</p>
        <div className="card-actions">
          <Link className="read-button" href={`/articles/${article.id}`}>
            Details
          </Link>
          <a className="secondary-link" href={article.url} rel="noreferrer" target="_blank">
            Read Original Article
          </a>
        </div>
      </div>
    </article>
  );
}
