export default function TopicSection({ children, id, index, title }) {
  return (
    <section className="section" id={id}>
      <div className="section-header">
        <span className="section-index">{String(index).padStart(2, "0")}</span>
        <div>
          <p className="section-label">Daily Section</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="article-list">{children}</div>
    </section>
  );
}
