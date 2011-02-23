task :jsdoc do
  jsdoc_path = File.expand_path(ENV['JSDOCDIR'] || "~/vendor/jsdoc-toolkit")
  jsrun_path = File.expand_path(File.join(jsdoc_path, "jsrun.sh"))

  template = File.expand_path("vendor/jsdoc-simple")
  config   = File.expand_path("config/jsdoc.conf")
  src_path = File.expand_path("public/javascripts")

  system "JSDOCDIR='#{jsdoc_path}' sh #{jsrun_path} -c='#{config}' -t='#{template}' #{src_path}"
end
