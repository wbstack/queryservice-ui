var wikibase = wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.editor = wikibase.queryService.ui.editor || {};

wikibase.queryService.ui.editor.Editor = ( function( $, CodeMirror, WikibaseRDFTooltip, localStorage ) {
	"use strict";

	var CODEMIRROR_DEFAULTS = {
			"lineNumbers": true,
			"matchBrackets": true,
			"mode": 'sparql',
			"extraKeys": { 'Ctrl-Space': 'autocomplete' },
			"viewportMargin": Infinity,
			"hintOptions": { closeCharacters: /[]/, completeSingle: false}
		},
		ERROR_LINE_MARKER = null,
		ERROR_CHARACTER_MARKER = null;

	var LOCAL_STORAGE_KEY = 'wikibase.queryService.ui.Editor';

	/**
	 * An ui this._editor for the Wikibase query service
	 *
	 * @class wikibase.queryService.ui.this._editor
	 * @license GNU GPL v2+
	 *
	 * @author Stanislav Malyshev
	 * @author Jonas Kress
	 * @constructor
	 */
	function SELF() {
	}

	/**
	 * @property {CodeMirror}
	 * @type CodeMirror
	 * @private
	 **/
	SELF.prototype._editor = null;

	/**
	 * @property {wikibase.queryService.ui.editor.hint.Sparql}
	 * @private
	 **/
	SELF.prototype._sparqlHint = null;

	/**
	 * @property {wikibase.queryService.ui.editor.hint.Rdf}
	 * @private
	 **/
	SELF.prototype._rdfHint = null;

	/**
	 * Construct an this._editor on the given textarea DOM element
	 *
	 * @param {Element} element
	 **/
	SELF.prototype.fromTextArea = function( element ) {
		var self = this;

		this._editor = CodeMirror.fromTextArea( element, CODEMIRROR_DEFAULTS );
		this._editor.on( 'change', function ( editor, changeObj ) {
			self.storeValue( self.getValue() );
			self.clearError();
			if( changeObj.text[0] === '?' ){
				editor.showHint({closeCharacters: /[\s]/});
			}
		} );
		this._editor.focus();

		new WikibaseRDFTooltip(this._editor);

		this._registerHints();
	};

	SELF.prototype._registerHints = function() {
		var self = this;

		CodeMirror.registerHelper( 'hint', 'sparql', function ( editor, callback, options ) {
			if( editor !== self._editor ){
				return;
			}
			var lineContent = editor.getLine( editor.getCursor().line ),
				editorContent = editor.doc.getValue(),
				cursorPos = editor.getCursor().ch,
				lineNum = editor.getCursor().line;

			self._getHints( editorContent, lineContent, lineNum, cursorPos ).done( function( hint ){
				callback( hint );
			} );
		} );

		CodeMirror.hint.sparql.async = true;
	};

	SELF.prototype._getHints = function( editorContent, lineContent, lineNum, cursorPos ) {
		var deferred = new $.Deferred(),
			self = this;
		if( !this._sparqlHint ){
			this._sparqlHint = new wikibase.queryService.ui.editor.hint.Sparql();
		}
		if( !this._rdfHint ){
			this._rdfHint = new wikibase.queryService.ui.editor.hint.Rdf();
		}

		this._rdfHint.getHint( editorContent, lineContent, lineNum, cursorPos ).done( function( hint ){
		hint.from = CodeMirror.Pos( hint.from.line, hint.from.char );
		hint.to = CodeMirror.Pos( hint.to.line, hint.to.char );

		deferred.resolve( hint );

		} ).fail( function(){//if rdf hint is rejected try sparql hint
			self._sparqlHint.getHint( editorContent, lineContent, lineNum, cursorPos ).done( function( hint ){
				hint.from = CodeMirror.Pos( hint.from.line, hint.from.char );
				hint.to = CodeMirror.Pos( hint.to.line, hint.to.char );

				deferred.resolve( hint );
			} );
		} );

		return deferred.promise();
	};

	/**
	 * Construct an this._editor on the given textarea DOM element
	 *
	 * @param {string} keyMap
	 * @throws {function} callback
	 **/
	SELF.prototype.addKeyMap = function( keyMap, callback ) {
		this._editor.addKeyMap( { keyMap : callback } );
	};

	/**
	 * @param {string} value
	 **/
	SELF.prototype.setValue = function( value ) {
		this._editor.setValue( value );
	};

	/**
	 * @return {string}
	 **/
	SELF.prototype.getValue = function() {
		return this._editor.getValue();
	};

	SELF.prototype.save = function() {
		this._editor.save();
	};

	/**
	 * @param {string} value
	 **/
	SELF.prototype.prepandValue = function( value ) {
		this._editor.setValue( value + this._editor.getValue() );
	};

	SELF.prototype.refresh = function() {
		this._editor.refresh();
	};

	/**
	 * Highlight SPARQL error in editor window.
	 *
	 * @param {string} description
	 */
	SELF.prototype.highlightError = function( description ) {
		var line, character,
			match = description.match( /line (\d+), column (\d+)/ );
		if ( match ) {
			// highlight character at error position
			line = match[1] - 1;
			character = match[2] - 1;
			if( character >= this._editor.doc.getLine( line ).length -1 ){
				character =  this._editor.doc.getLine( line ).length -1 ;
			}

			ERROR_LINE_MARKER = this._editor.doc.markText(
				{ 'line': line, 'ch': 0 },
				{ 'line': line },
				{ 'className': 'error-line' }
			);
			ERROR_CHARACTER_MARKER = this._editor.doc.markText(
				{ 'line': line, 'ch': character },
				{ 'line': line, 'ch': character + 1 },
				{ 'className': 'error-character' }
			);
		}
	};

	/**
	 * Clear SPARQL error in editor window.
	 *
	 * @param {string} description
	 */
	SELF.prototype.clearError = function() {
		if ( ERROR_LINE_MARKER ) {
			ERROR_LINE_MARKER.clear();
			ERROR_CHARACTER_MARKER.clear();
		}
	};

	/**
	 * Stores the given value in the local storage
	 * @param {string} value
	 */
	SELF.prototype.storeValue = function( value ) {
		if( localStorage ){
			localStorage.setItem( LOCAL_STORAGE_KEY, value );
		}

	};

	/**
	 * Restores the value from the local storage
	 */
	SELF.prototype.restoreValue = function() {
		if( localStorage ){
			var value = localStorage.getItem( LOCAL_STORAGE_KEY );
			if( value ){
				this.setValue( value );
				this.refresh();
			}
		}
	};

	return SELF;

}( jQuery, CodeMirror, WikibaseRDFTooltip, window.localStorage ) );