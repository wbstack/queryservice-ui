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

		this._queryParser.parse( this._query, this._prefixes );
	}

	/**
	 * Classifies the SPARQL query
	 *
	 * @return {array<string>}
	 */
	SELF.prototype.classify = function () {
		var triples = this._collectTriples();
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
	 * Collect triples from query and subqueries
	 *
	 * @return {object[]}
	 */
	SELF.prototype._collectTriples = function () {
		var triples = this._queryParser.getTriples();
		var subTriples = this._queryParser.getSubTriples();

		return triples.concat( subTriples );
	};

	return SELF;
}( jQuery, wikibase, sparqljs ) );
