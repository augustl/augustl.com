require "./lib/post"
require "sanitize"

Post.all.each do |post|
  proxy(post.url + ".html", "/post.html", :locals => {:post => post})
end

ignore "/post.html"

page "/" do
  @posts = Post.all_listed[0..9]
end

page "/archive.html" do
  @post_years = Post.all_listed.group_by {|p| p.timestamp.year }
end

page "/atom.xml", :layout => false do
  @posts = Post.all_listed[0..19]
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
