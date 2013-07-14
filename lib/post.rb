require "nokogiri"
require "open3"
require "parallel"

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

  def self.parse_html_attrs(attrs)
    if attrs.blank?
      return {}
    else
      Nokogiri::HTML("<div#{attrs}></div>").css("div")[0].attributes.inject({}) do |prev, curr|
        key = curr[0]
        value = curr[1]
        prev[key] = value.value
        prev
      end
    end
  end

  def self.format_code(code, lang)
    if lang
      formatted = nil
      Open3.popen3("pygmentize", "-l", lang, "-f", "html", "-P", "nowrap=true") do |stdin, stdout, stderr, wait_thr|
        stdin.write(code)
        stdin.close_write

        lines = []
        until (line = stdout.gets).nil?
          lines.push(line)
        end

        formatted = lines.join("")
      end

      "<code class=\"highlight\">#{formatted}</code>"
    else
      "<code>" + escape_html(code) + "</code>"
    end
  end

  def self.separate_on(str, re, result = [])
    match_data = str.match(re)
    if match_data
      result.push(match_data.pre_match)
      result.push(match_data)
      separate_on(match_data.post_match, re, result)
    else
      result.push(str)
      result
    end
  end

  def initialize(cwd, path)
    @path = path
    @cwd = cwd
    @url = "/" + @path[0...-(File.extname(@path).length)]
    reload!
  end

  def self.parse_body(body)
    chunks = separate_on(body, /\<code(.*?)\>(.*?)\<\/code\>/m)
    Parallel.map(chunks, :in_threads => chunks.length) do |chunk|
      case chunk
      when String
        chunk
      when MatchData
        attrs = parse_html_attrs(chunk[1])
        code = chunk[2]
        format_code(code, attrs["data-lang"])
      else
        raise ArgumentError.new("Unexpected chunk #{chunk.class}.")
      end
    end.join("")
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

    @body = self.class.parse_body(html[num_header_chars..-1])
  end

  def id
    url.gsub("/", ":")
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
