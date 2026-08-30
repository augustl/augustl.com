---
title: "OS X: Extract JDK to folder, without running installer"
date: "2014-07-10"
content_format: "html"
archive_order: 30
---
<p>On Linux, I'm used to downloading the JDK as a tarball, extracting it, and setting PATH and JAVA_HOME accordingly. This makes it super-easy to switch Java versions, run multiple older versions, and so on.</p>

<p>I just got a Macbook Air, and the only option for installing Java there, is a .dmg file with a .pkg installer. <a href="http://slashdot.org/story/01/10/23/1816257/apple-releases-ipod">No wireless. Less space than a nomad. Lame.</a></p>

<img src="/static/posts/extracting-java-to-folder/wat.png">

<h2>How to extract to a folder</h2>

<p>Here, a numbered list, to make it easy for you.</p>

<ol>
  <li>Download the installer .dmg files. They contain the good stuff.</li>
  <li>Mount the .dmg and copy the .pkg file to somewhere</li>
  <li>Open a terminal and cd to the folder you copied the .pkg file into</li>
  <li><code class="highlight">pkgutil --expand JDK<span class="se">\ </span><span class="m">7</span><span class="se">\ </span>Update<span class="se">\ </span><span class="m">60</span>.pkg JDK7u60</code> - extract pkg file to folder</li>
  <li><code class="highlight"><span class="nb">cd</span> JDK7u60/</code> - move to the extracted pkg</li>
  <li><code class="highlight"><span class="nb">cd</span> jdk17060.pkg/</code> - there's a folder with the version number ending with .pkg (but it's just a folder), go there</li>
  <li><code class="highlight">open Payload</code> - this is a gzipped "ASCII cpio archive (pre-SVR4 or odc)", according to <code class="highlight">file</code>. The "open" command will extract it using the Archive Utility app.</li>
  <li><strong>Done!</strong> Now you just need to copy the files.</li>
  <li><code class="highlight">cp Contents/Home ~/local/jdk_1.7u60</code></li>
</ol>

<p>No installer was ever executed. No auto updater will be installed. No global PATH will get whatever "java" you already had overwritten.</p>
