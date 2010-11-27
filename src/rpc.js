var RPC = {
  /**
   * get the extension's settings
   */
  getSettings: function() {
    return {
      sort_keys: safari.extension.settings.getItem( "sort_keys" )
    };
  },

  /**
   * syntax highlight a string
   */
  highlight: function( src ) {
    return prettyPrintOne( src, null, true );
  },

  /**
   * reformat (pretty-print) a string
   */
  reformat: function( type, src ) {
    if( formatters[type] ) {
      return formatters[type].call( formatters, src );
    }
  }
};