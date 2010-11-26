var formatters = {
  javascript: function( src ) {
    return js_beautify( src, {
      braces_on_own_line: false,
      indent_char: " ",
      indent_level: 0,
      indent_size: 2,
      keep_array_indentation: false,
      preserve_newlines: true,
      space_after_anon_function: false
    } );
  }
};