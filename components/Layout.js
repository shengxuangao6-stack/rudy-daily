import Masthead from "./Masthead";

export default function Layout({ children, daily }) {
  return (
    <div className="site-shell">
      <div className="newspaper">
        <div className="inner">
          <Masthead daily={daily} />
          {children}
          <footer className="footer">
            Rudy Daily recommends articles and links to original publishers. Full
            article text stays with the source.
          </footer>
        </div>
      </div>
    </div>
  );
}
