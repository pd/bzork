task :jsdoc do
  jsdoc_path = File.expand_path(ENV['JSDOCDIR'] || "~/vendor/jsdoc-toolkit")
  jsrun_path = File.expand_path(File.join(jsdoc_path, "jsrun.sh"))

  template = File.expand_path("vendor/jsdoc-simple")
  config   = File.expand_path("config/jsdoc.conf")
  bzork_js = File.expand_path("public/javascripts/bzork.js")
  src_path = File.expand_path("public/javascripts/bzork/")

  command = "JSDOCDIR='#{jsdoc_path}' sh #{jsrun_path}"
  options = "-c='#{config}' -t='#{template}'"
  files   = "#{bzork_js} #{src_path}"

  system "#{command} #{options} #{files}"
end
