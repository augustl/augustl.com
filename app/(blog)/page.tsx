import { Fragment } from "react";
import { getListedPosts } from "../../lib/content";

export default function HomePage() {
  const postsByYear = Map.groupBy(getListedPosts(), (post) => post.date.slice(0, 4));

  return (
    <div className="site-content site-content-main">
      <h1>Blog</h1>
      <ul className="plain" style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "20px" }}>
        <li><a href="https://www.snowbee.no">Work</a></li>
        <li><a href="https://github.com/augustl">Code</a></li>
        <li><a href="https://x.com/augustl">X</a></li>
        <li><a href="https://www.linkedin.com/in/augustlilleaas/">LinkedIn</a></li>
      </ul>
      {[...postsByYear.entries()].map(([year, posts]) => (
        <Fragment key={year}>
          <h2>{year}</h2>
          {posts.map((post) => (
            <p key={post.url}>
              <a href={post.url} dangerouslySetInnerHTML={{ __html: post.title }} />{` (${post.prettyDate})`}
            </p>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
