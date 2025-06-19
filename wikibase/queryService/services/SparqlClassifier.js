var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.services = wikibase.queryService.services || {};

wikibase.queryService.services.SparqlClassifier = ( function ( $, wikibase ) {
	'use strict';

	/**
	 *
	 * @class wikibase.queryService.services.SparqlClassifier
	 * @license GNU GPL v2+
	 *
	 * @constructor
	 */
	function SELF() {
		this._queryParser = new wikibase.queryService.services.SparqlQuery();
		this._prefixes = wikibase.queryService.RdfNamespaces.ALL_PREFIXES;
		this._TriplesAnalyzer = new wikibase.queryService.services.TriplesAnalyzer();
	}

	/**
	 * Classifies the SPARQL query
	 *
	 * @param {string} query
	 * @return {string}
	 */
	SELF.prototype.classify = function ( query ) {
		try {
			this._queryParser.parse( query, this._prefixes );
		} catch ( e ) {
			return 'invalid_query';
		}

		var triples = this._queryParser.getTriples();
		var flags = this._TriplesAnalyzer.analyze( triples );

		if ( flags.predsAreTerms ) {
			return 'only_term_statements';
		}

		if ( flags.singleKnownRelation ) {
			return 'single_known_relation_statement';
		}

		if ( flags.predsIncludeInstanceOrSubclass ) {
			return 'includes_instance_or_subclass_statement';
		}

		if ( flags.singleUnKnownRelation ) {
			return 'single_unknown_relation_statement';
		}

		if ( flags.subjsAreWdEnts ) {
			return 'only_ent_subj_statements';
		}

		return 'unclassified';
	};

	/**
	 * @param {string} query
	 * @return {boolean}
	 */
	SELF.prototype.isSimpleQuery = function ( query ) {
		return [
			'only_term_statements',
			'single_known_relation_statement',
			'only_ent_subj_statements'
		].includes( this.classify( query ) );
	};

	return SELF;
}( jQuery, wikibase ) );
