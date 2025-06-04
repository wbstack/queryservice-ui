var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.services = wikibase.queryService.services || {};

wikibase.queryService.services.SparqlClassifier = ( function ( $, wikibase, sparqljs ) {
	'use strict';

	/**
	 *
	 * @class wikibase.queryService.services.SparqlClassifier
	 * @license GNU GPL v2+
	 *
	 * @constructor
	 * @param {string} query
	 */
	function SELF( query ) {
		this._query = query || '';
		this._queryParser = new wikibase.queryService.services.SparqlQuery();
		this._prefixes = wikibase.queryService.RdfNamespaces.ALL_PREFIXES;
		this._TriplesAnalyzer = new wikibase.queryService.services.TriplesAnalyzer();
	}

	/**
	 * Classifies the SPARQL query
	 *
	 * @return {array<string>}
	 */
	SELF.prototype.classify = function () {
		try {
			this._queryParser.parse( this._query, this._prefixes );
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

	return SELF;
}( jQuery, wikibase, sparqljs ) );
