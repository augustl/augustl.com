require "./lib/post"

Post.all.each do |post|
  proxy post.url + ".html", "/post.html" do
    post.reload!
    @post = post
  end
end

ignore "/post.html"

page "/" do
  @posts = Post.all[0..9]
end

page "/archive.html" do
  @post_years = Post.all.group_by {|p| p.timestamp.year }
end

page "/favicon.ico" do
end


# helpers do
#   def some_helper
#     "Helping"
#   end
# end

set :css_dir, 'stylesheets'

set :js_dir, 'javascripts'

set :images_dir, 'images'

activate :directory_indexes
