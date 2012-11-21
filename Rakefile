task "publish" do 
  system("git branch -D master")
  system("git checkout -b master")
  system("git filter-branch --subdirectory-filter _site/ -f")
end
