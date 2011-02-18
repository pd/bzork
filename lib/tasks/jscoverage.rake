task 'jscoverage' do
  ignore_js = [
    "/public/javascripts/lib/",
    "/public/javascripts/lib/jdataview.js",
    "/__JASMINE_ROOT__/",
    "/__spec__/"
  ]
  cmd = "jscoverage-server --proxy --verbose"

  puts "Launching jscoverage proxy server:"
  puts "\t#{cmd} \\"
  ignore_js.each do |ignore|
    arg = " --no-instrument='http://localhost:8888#{ignore}'"
    puts "\t  #{arg}"
    cmd << arg
  end

  puts "\nBe sure jasmine is also running, set your browser proxy to localhost:8080,"
  puts "and then visit http://localhost:8888/jscoverage.html\n\n"
  puts "The URL to view from within JSCoverage is http://localhost:8888/?\n\n"

  system cmd
end
