/*jslint browser: true, forin: true, onevar: true, undef: true, nomen: true,
         eqeqeq: true, bitwise: true, newcap: true, immed: true */
/*global safari: false */

( function() {
  var settings = {}, extension = {
    /**
     * attempt to reformat the current document as JSON
     *  TODO: examine the document's content-type (appears to be impossible)
     */
    init: function() {
      var type = this.getDocumentType();
window.name = "sadf";
      this.pendingScriptCount = 0;

      if( type && this.isTextDocument() ) {
        // receive settings from proxy.html
        safari.self.addEventListener( "message", function( e ) {
          if( e.name === "setSettings" ) {
            settings = e.message;

            extension.highlight( type );
          }
        }, false );

        // ask proxy.html for extension settings
        safari.self.tab.dispatchMessage( "getSettings" );
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
      var src_el = document.body.getElementsByTagName( "pre" )[0];
      src_el.className = "brush: " + type;

      this.injectCSS( "lib/SyntaxHighlighter/css/shCore.css" );
      this.injectCSS( "lib/SyntaxHighlighter/css/shThemeEclipse.css" );

      this.injectScript( "lib/SyntaxHighlighter/js/shCore.js", function() {
        this.injectScript( "lib/SyntaxHighlighter/js/brushes/" + type + ".js", function() {
          var opts = {
            gutter: false,
            toolbar: false
          };

          var script_el = document.createElement( "script" ),
              src_el = document.body.getElementsByTagName( "pre" )[0];
          script_el.type = "text/javascript";
          script_el.innerHTML = 'SyntaxHighlighter.highlight(' + JSON.stringify( opts ) + ');';
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
     * a mechanism for deferring until external scripts have loaded
     */
    onScriptsLoaded: (function() {
      var callbacks = [];

      return function( callback ) {
        // registering a callback?
        if( typeof callback === "function" ) {
          callbacks.push( callback );
        // handling a script load event?
        } else if( --extension.pendingScriptCount === 0 ) {
          for( var i = 0, ii = callbacks.length; i < ii; i++ ) {
            callbacks[0].apply( extension );
          }
          callbacks = [];
        }
      }
    }() )
  };

  // initialize!
  extension.init();
}() );