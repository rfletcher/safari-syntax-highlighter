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
          // extension.highlight( type );
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
    highlight: function( type ) {
      var sh_opts = {
        "auto-links":  true,
        "class-name":  "",
        collapse:      false,
        "first-line":  1,
        gutter:        true,
        highlight:     null, // array of lines to highlight
        "html-script": false, // tag soup?
        "smart-tabs":  true,
        "tab-size":    4,
        toolbar:       false
      },

      src_el = document.body.getElementsByTagName( "pre" )[0];
      src_el.className = "brush: " + type;

      this.injectCSS( "lib/SyntaxHighlighter/css/shCore.css" );
      this.injectCSS( "lib/SyntaxHighlighter/css/shThemeEclipse.css" );

      this.injectScript( "lib/SyntaxHighlighter/js/shCore.js", function() {
        this.injectScript( "lib/SyntaxHighlighter/js/brushes/" + type + ".js", function() {
          // ideally we'd just call SyntaxHighlighter.highlight(...) here, but
          // Safari has let our window object go stale.  Use this hack to call
          // it on the fresh window object instead.
          var script_el = document.createElement( "script" );
          script_el.type = "text/javascript";
          script_el.innerHTML = 'SyntaxHighlighter.highlight(' + JSON.stringify( sh_opts ) + ');';
          document.body.insertBefore( script_el, src_el );
        } );
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
     * include an external javascript file in the page
     */
    injectScript: function( src, onload ) {
      var script_el = document.createElement( "script" ),
          src_el = document.body.getElementsByTagName( "pre" )[0];

      if( onload ) {
        script_el.onload = ( function( context ) {
          return function() {
            onload.call( context );
          };
        }( this ) );
      }

      script_el.src = safari.extension.baseURI + src;
      script_el.type = "text/javascript";

      document.body.insertBefore( script_el, src_el );
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