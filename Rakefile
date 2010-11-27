task :default do
  build_dir = "build/Syntax Highlighter.safariextension"

  FileUtils.rm_rf( build_dir )
  FileUtils.mkdir_p( build_dir )

  assets = [
    "etc/Info.plist",
    "etc/Settings.plist",
    "src/*",
    ["lib/js-beautify/beautify.js", "lib/js-beautify"],
    ["lib/js-beautify/unpackers/*", "lib/js-beautify/unpackers"],
    ["lib/google-code-prettify/src/prettify.*", "lib/google-code-prettify"],
    ["lib/google-code-prettify/src/lang-*", "lib/google-code-prettify"]
  ]

  assets.each do |glob|
    ( glob, dest_dir ) = glob if glob.is_a?( Array )
    dest_dir ||= "."

    Dir.glob( glob ).each do |src|
      puts "linking #{src}"
      dest = "#{build_dir}/#{dest_dir}/#{File.basename( src )}"
      FileUtils.mkdir_p( File.dirname( dest ) )
      FileUtils.link( src, dest )
    end
  end
end