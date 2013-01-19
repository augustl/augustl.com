class Post
  attr_reader :url
  attr_reader :body

  def self.all
    Dir.chdir(File.join(File.dirname(__FILE__), "..", "posts")) do
      Dir["**/*.html"].map do |path|
        Post.new(Dir.pwd, path)
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

  def initialize(cwd, path)
    @path = path
    @cwd = cwd
    @url = "/" + @path[0...-(File.extname(@path).length)]
    reload!
  end

  def reload!
    html = File.read(@cwd + "/" + @path)

    @headers = {}
    num_header_chars = 0

    html.each_line.each do |line|
      if line =~ /[a-z]+\:./
        key, _, value = *line.partition(":")
        @headers[key] = value.chomp
        num_header_chars += line.length
      else
        break
      end
    end

    @body = html[num_header_chars..-1].gsub(/\<code\>(.*?)\<\/code\>/m) do
      self.class.escape_html($1)
    end
  end

  def title
    @headers["title"].strip
  end

  def timestamp
    Time.parse(@headers["date"])
  end

  def html_date
    timestamp.strftime("%Y-%m-%d")
  end

  def display_date
    timestamp.strftime("%B %d, %Y")
  end
end
