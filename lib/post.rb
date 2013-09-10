require "augusts_fancy_blog_post_parser"

class Post < AugustsFancyBlogPostParser

  def self.all
    Dir.chdir(File.join(File.dirname(__FILE__), "..", "posts")) do
      Dir["**/*.html"].map do |path|
        Post.new(Dir.pwd, path)
      end.sort_by(&:timestamp).reverse
    end
  end

  def self.all_listed
    all.find_all(&:listed?)
  end

  def listed?
    @headers["listed"].try(:strip) != "false"
  end
end
