export default function Masthead({ daily }) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${daily.date}T12:00:00`));

  return (
    <header className="masthead">
      <div className="masthead-top">
        <span>{formattedDate}</span>
        <span>Issue No. {daily.issueNumber}</span>
      </div>
      <h1 className="masthead-name">Rudy Daily</h1>
      <p className="slogan">A Daily English Newspaper for Your Mind</p>
    </header>
  );
}
