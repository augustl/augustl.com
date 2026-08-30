---
title: "Blogging with Word in your Jamstack"
date: "2023-12-07"
content_format: "html"
---
<p>I <a href="https://augustl.com/blog/2023/pro_kotlin_web_apps_from_scratch/">wrote </a><a href="https://augustl.com/blog/2023/pro_kotlin_web_apps_from_scratch/">a</a><a href="https://augustl.com/blog/2023/pro_kotlin_web_apps_from_scratch/"> book</a> in Word. That’s 72&nbsp;000 words in Word. </p><p>But I’ve stopped blogging, partly because writing markdown in my code editor just doesn’t vibe with me anymore. These days, I ask myself the question: how can I just get a Word document online as fast as possible?</p><p>I like Word! It has nice tooling for grammar and spell checking, and it’s a nice environment for editing prose.</p><p>So, I wrote a parser for Word files that slurps them into my blog engine and emits clean HTML – like the post you’re seeing now! Yes, my friends, I now have support for .<code>docx</code> files in my personal blog.</p><p>Tldr: <a href="https://github.com/augustl/augustl.com/tree/master/posts/blog/2023">Here’s the Word document</a> (called blogging_with_word.docx), and <a href="https://github.com/augustl/augustl.com/blob/b6a3382e6ad49a4bd710332618cb58140c2cf4bd/src/augustl_com/word_post_parser.clj">here’s the parser code</a>.</p><h2>A quick word on tech</h2><p>Programmers should build their own <span style="text-decoration: line-through">lightsaber</span> blog.</p><p>This blog is a Jamstack style Clojure app (it used to be a Ruby/Middleman app, and before that, Rails) that reads a bunch of files and outputs static HTML, that I host on CloudFront in AWS. <a href="https://github.com/augustl/augustl.com">Source code here</a>.</p><p>This setup turns out to be the best of both worlds. I get to write some fun code, once, and hopefully when it’s all up and running, I can just paste another docx file into the correct folder and have a fresh blog post online in no time.</p><p>Back in the old days I enjoyed hand-typing markdown in my code editor. In fact, the first years of this blog was hand-typing HTML. Clearly, I have changed.</p><h2>Parsing Word docs</h2><p>I’m glad I use <a href="https://news.ycombinator.com/item?id=4310723">a robust technology like the JVM</a>, which is the platform Clojure runs on. Clojure has great Java interop, so I’m using the <a href="https://poi.apache.org/components/document/quick-guide-xwpf.html">good old Apache POI library</a>. It has full support for everything Microsoft Office, and convenient APIs for extracting text from a Word document.</p><p>Let’s get into it!</p><pre><code>(defn get-body-from-docx [^File file]
  (with-open [doc (XWPFDocument. (io/input-stream file))]
    (-&gt;&gt; (iterator-seq (.getParagraphsIterator doc))
         (drop-while #(re-find header-line-re (.getText %)))
         (map (fn [para]
                (if-let [runs (seq (.getRuns para))]
                  {::runs runs
                   ::style (.getStyleID para)
                   ::para para
                   ::doc doc}
                  ::blank)))
         (word-paragraphs-hiccup-seq))))</code></pre><p><code>iterator-seq</code> and the <code>getParagraphsIterator()</code> method are the juicy bits. It yields the Word document paragraphs as a plain lazy Clojure sequence, which lets me pretend I’m writing code against a neat Clojure library, instead of a noun heavy Java library.</p><p>The <code>drop-while</code> gets rid of the initial header lines. My word document starts with some metadata directly in the text, such as <code>date: 2023-12-07</code>. It also has title of the post, and so on.</p><p>Then I map each paragraph to <code>::blank</code> for empty lines, and create a map with all the data I need for further processing for lines with contents.</p><h2>Chunking paragraphs</h2><p>Then, the fun process of converting Word paragraphs to HTML begins. Paragraphs in Word documents are not like paragraphs on the web. A paragraph in Word is more like a sequence of <code>&lt;div&gt;</code>s, or lines of text separated by a <code>&lt;br&gt;</code> tag. </p><p>Let’s say the word document looks like this:</p><pre><code>Here is my line

Here is my other line
with no space between

Here is my last line</code></pre><p>That should result in HTML that looks roughly like this:</p><pre><code>&lt;p&gt;Here is my line&lt;/p&gt;
&lt;p&gt;Here is my other line&lt;br&gt;with no space between&lt;/p&gt;
&lt;p&gt;Here is my last line&lt;/p&gt;</code></pre><p>In other words, the list of paragraphs from Word needs to be chunked properly.</p><p>This is what <code>word-paragraphs-hiccup-seq</code> does. That function is just some looping mechanics, the meat of that implementation is a function, <code>get-next-hiccup-tag</code>. This function returns the new HTML for the paragraphs it “consumed”, and the remaining paragraphs to be processed. </p><pre><code>(defn get-next-hiccup-tag [paragraphs]
  (let [paragraphs (-&gt;&gt; paragraphs 
                        (drop-while #(= % ::blank))
        {style ::style runs ::runs doc ::doc} (first paragraphs)]
    (case style
      "Code" (let [[code-paras rest] (-&gt;&gt; paragraphs
                                          (consume-paragraph-chunk #(= "Code" (::style %))))]
               [(get-code-block-tag code-paras) rest])
      "Heading2" [(into [:h2] (runs-to-hiccup-seq runs doc)) (rest paragraphs)]
      "Heading3" [(into [:h3] (runs-to-hiccup-seq runs doc)) (rest paragraphs)]
      "Heading4" [(into [:h4] (runs-to-hiccup-seq runs doc)) (rest paragraphs)]
      (get-next-hiccup-paragraph paragraphs))))</code></pre><p>The first step is to remove any preceding blank paragraphs. If I insert 10 blank spaces in a row, I don’t want word to insert to paragraphs separated by 9 (?) <code>&lt;br&gt;</code> tags. This makes my Word documents behave similar to Markdown, where you also have to do some work to get a bunch of whitespace between paragraphs.</p><p>The <code>::style</code> property of the first paragraph determines what to do. If it’s a code block or a header, I immediately create an element and then return the remaining paragraphs. There’s some logic in code blocks I’ll return to later. But that’s about it.</p><p>If the paragraph does not have a style associated with it (meaning it’s just a normal block of text), I invoke the main bulk of the chunking logic.</p><pre><code>(defn get-next-hiccup-paragraph [paragraphs]
  (let [[text-paragraphs rest] (-&gt;&gt; paragraphs
                                    (split-with
                                      #(and (not= % ::blank)
                                            (nil? (::style %)))))]
    [(into [:p]
           (-&gt;&gt; text-paragraphs
                (map #(runs-to-hiccup-seq (::runs %) (::doc %)))
                (interpose [:br])))
     rest]))</code></pre><p>First, I take all the blocks of non-styled paragraphs that also aren’t blank lines. Then, I build a <code>&lt;p&gt;</code> tag  that contains each paragraph converted into HTML  (it reads out bold, italics, links, etc from the text runs), and I insert a <code>&lt;br&gt;</code> between each line in the paragraph.</p><p>The <code>rest</code> is what is returned to the looping code, meaning that for the next iteration of the processing loop, the remaining characters will be processed.</p><h2>Processing code blocks</h2><p>I invoke a function called <code>consume-paragraph-chunk</code> to build the code blocks. Here’s that function.</p><pre><code>(defn consume-paragraph-chunk [pred xs]
  (let [[chunk rest] (split-with #(or (pred %) (= ::blank %)) xs)
        whitespace-tail (-&gt;&gt; chunk (reverse) (take-while #(= ::blank %)))]
    [(-&gt;&gt; chunk
          (drop-last (count whitespace-tail)))
     (concat whitespace-tail rest)]))</code></pre><p>Maybe there’s a smarter way to do this, but at this point I just wanted to get this blog post published. The function takes all lines that are blank or matches the predicate (in this case, <code>::style</code> is <code>"Code"</code>). I don’t want it to include any tails of whitespace after the last chunk of code, so I yank those out and add them to the <code>rest</code> for further processing in the loop.</p><h2>Great success</h2><p>So that’s about it! I wrote this very blog post in Word. This has increased the likelihood of increased blog output by at least 1%.</p><p>My number one fear is that this will turn out to be some kind of churnfest due to incompatibilities with my old blog posts in new versions of Word, or something like that. The  <code>docx</code> format has been stable for a while now though, so I sure hope not. At any rate, it was a fun little project to get up and running.</p><h2>Test area</h2><p>Because I’m lazy, I don’t want to set up a separate test environment. So here’s a blurb that tests some random stuff.</p><p>Here, we should see a continuous block of code, with newlines inside it but not after.</p><pre><code>(defn here-is-some-code []
  ;; Test newline stuff

  ;; Ok here we go
  (prn "Hello, World!"))</code></pre><p>Here, we should see a set of words separated by <code>&lt;br&gt;</code> tags. And, we should not see an actual line break here, but a single paragraph, and some in-line escaped HTML.</p><p>Can we have in-line code? <code>(+ 1 2)</code>. This should use a monospace font.</p><p>Here<br>We<br>Go</p><p>We’ve already tested links. But let’s <a href="https://crud.business/">test it again</a>.</p>
