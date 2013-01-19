class Post
  attr_reader :title
  attr_reader :html_date
  attr_reader :display_date
  attr_reader :timestamp
  attr_reader :url
  attr_reader :body

  def self.all
    Dir.chdir(File.join(File.dirname(__FILE__), "..", "posts")) do
      Dir["**/*.html"].map do |path|
        Post.new(path)
      end.sort_by(&:timestamp).reverse
    end
  end

  def self.escape_html(html)
    html
      .gsub(/&(?!\w+;)/, '&amp;')
      .gsub(/</, '&lt;')
      .gsub(/>/, '&gt;')
      .gsub(/"/, '&quot;')
  end

  def initialize(path)
    html = File.read(path)
    @url = "/" + path[0...-(File.extname(path).length)]

    headers = {}
    num_header_chars = 0

    html.each_line.each do |line|
      if line =~ /[a-z]+\:./
        key, _, value = *line.partition(":")
        headers[key] = value.chomp
        num_header_chars += line.length
      else
        break
      end
    end

    @timestamp = Time.parse(headers["date"])
    @html_date = @timestamp.strftime("%Y-%m-%d")
    @display_date = @timestamp.strftime("%B %d, %Y")

    @title = headers["title"].strip
    @body = html[num_header_chars..-1].gsub(/\<code\>(.*?)\<\/code\>/m) do
      self.class.escape_html($1)
    end
  end

  def to_html
    title_html = "<h1>" + @title + "</h1>"
    timestamp_html = '<p class="timestamp">Published ' + @display_date + '</p>'
    '<div id="article" class="article">' + title_html + timestamp_html + @body + "</div>"
  end
end
