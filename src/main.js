/*jslint browser: true, forin: true, onevar: true, undef: true, nomen: true,
         eqeqeq: true, bitwise: true, newcap: true, immed: true */
/*global safari: false */

( function() {
  var settings = {}, extension = {
    /**
     * attempt to reformat and/or highlight the current document
     *  TODO: examine the document's content-type (appears to be impossible)
     */
    init: function() {
      var type = this.getDocumentType();

      if( type && this.isTextDocument() ) {
        this.rpc( "getSettings", function( data ) {
          settings = data;

          extension.reformat( type );
        } );
      }
    },

    /**
     * determine the document type
     */
    getDocumentType: function() {
      var parts = document.location.pathname.split( '/' ),
          matches = parts[parts.length-1].match( /\.([^.]+)$/ ),
          file_ext = matches ? matches[1].toLowerCase() : null;

      switch( file_ext ) {
        case "actionscript3":
        case "applescript":
        case "bash":
        case "coldfusion":
        case "cpp":
        case "csharp":
        case "css":
        case "diff":
        case "erlang":
        case "groovy":
        case "java":
        case "javafx":
        case "javascript":
        case "pascal":
        case "perl":
        case "php":
        case "plain":
        case "powershell":
        case "python":
        case "ruby":
        case "sass":
        case "scala":
        case "sql":
        case "vb":
        case "xml":
          return file_ext;
        default:
          // map other file types to a supported type
          return {
            "as3": "actionscript3",
            "c": "cpp",
            "cf": "coldfusion",
            "cs": "csharp",
            "erl": "erlang",
            "fx": "javafx",
            "jfx": "javafx",
            "js": "javascript",
            "jscript": "javascript",
            "json": "javascript",
            "patch": "diff",
            "pas": "pascal",
            "php3": "php",
            "pl": "perl",
            "ps1": "powershell",
            "py": "python",
            "pyw": "python",
            "rb": "ruby",
            "rake": "ruby",
            "scss": "sass",
            "sh": "bash",
            "txt": "plain",
            "xslt": "xml"
          }[file_ext];
      }
    },

    /**
     * syntax highlight the document
     */
    highlight: function() {
      var src_el = document.body.getElementsByTagName( "pre" )[0];


      this.rpc( "highlight", src_el.innerHTML, function( response ) {
        if( response && response != src_el.innerHTML ) {
          this.injectCSS( "lib/google-code-prettify/prettify.css" );
          this.injectCSS( "main.css" );
          src_el.innerHTML = response;
        }
      } );
    },

    /**
     * include an external css file in the page
     */
    injectCSS: function( href ) {
      var link_el = document.createElement( "link" );
      link_el.href = safari.extension.baseURI + href;
      link_el.type = "text/css";
      link_el.rel = "stylesheet";
      document.body.appendChild( link_el );
    },

    /**
     * test whether this document is text/plain
     */
    isTextDocument: function() {
      // Safari doesn't give us access to the content-type header, so we'll
      // check to see if the DOM matches Safari's standard DOM for text presentation.
      return ! document.head &&
        document.body && document.body.getElementsByTagName( "*" ).length === 1 &&
        document.body.children[0].tagName.toLowerCase() === "pre";
    },

    /**
     * reformat (pretty-print) the document
     */
    reformat: function( type ) {
      var src_el = document.body.getElementsByTagName( "pre" )[0];

      this.rpc( "reformat", type, src_el.textContent, function( response ) {
        if( response ) {
          src_el.textContent = response;
        }
        extension.highlight();
      } );
    },

    /**
     * call one of the extension's "global page" methods
     * usage:
     *    rpc( "method", function(){} );
     *    rpc( "method", "param1", ..., "paramN", function(){} );
     */
    rpc: function( method, callback ) {
      var params = Array.prototype.slice.call( arguments, 1, arguments.length - 1 ),

      fn = function( e ) {
        if( e.name === method ) {
          callback.call( extension, e.message );
          safari.self.removeEventListener( "message", callback );
        }
      };

      callback = arguments[arguments.length - 1];

      // listen for the response
      safari.self.addEventListener( "message", fn, false );
      // call the method
      safari.self.tab.dispatchMessage( method, params );
    }
  };

  // initialize!
  extension.init();
}() );