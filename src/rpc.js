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
   * reformat (pretty-print) the content
   */
  reformat: function( type, src ) {
    if( formatters[type] ) {
      return formatters[type].call( formatters, src );
    }
  }
};