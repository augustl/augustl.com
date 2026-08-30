import { SERIES } from "../lib/series";
import type { RenderedPost } from "../lib/content";

export function PostPage({ post }: { post: RenderedPost }) {
  return (
    <>
      <div className="site-content">
        <p><a href="/" className="take-me-home">Take me home</a></p>
      </div>
      <div className="site-content site-content-main">
        <div id="article" className="article">
          <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
          <p className="timestamp">{`Written by August Lilleaas, published ${post.prettyDate}`}</p>
          {post.series ? (
            <div className="series">
              This post is part of a series: <a href={`/series/${post.series}/`}>{SERIES[post.series].title}</a>
            </div>
          ) : null}
          <article dangerouslySetInnerHTML={{ __html: post.html }} />
          <hr className="post-sep" />
          <p>Questions or comments?</p>
          <p>
            Feel free to contact me on Twitter, <a href="http://twitter.com/augustl">@augustl</a>{", or e-mail me at "}
            <a href="mailto:august@augustl.com">august@augustl.com</a>.
          </p>
        </div>
      </div>
    </>
  );
}
