var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.services = wikibase.queryService.services || {};

wikibase.queryService.services.TriplesAnalyzer = ( function ( $, wikibase ) {
	'use strict';

	/**
	 *
	 * @class wikibase.queryService.services.TriplesAnalyzer
	 * @license GNU GPL v2+
	 *
	 * @constructor
	 */
	function SELF() {
		this._prefixes = wikibase.queryService.RdfNamespaces.ALL_PREFIXES;
	}

	/**
	 * A function that accepts a triples array and analyzes it for specific flags.
	 * Return the array of triples and a flags object.
	 *
	 * @param {array<object>} tripleEntries
	 * @return {object}
	 */
	SELF.prototype.analyze = function ( tripleEntries ) {
		var hasTriples = tripleEntries.length > 0;

		// Walk through the triples and check for specific tripleFlags (this means we can collect all the
		// tripleFlags in one go, instead of iterating through the triples multiple times)
		return tripleEntries.reduce( this._extractFlags.bind( this ), {
			hasHintsOrForward: false,
			isSingleStatement: tripleEntries.length === 1,
			isTwoStatement: tripleEntries.length === 2,
			subjsAreWdEnts: hasTriples,
			subjsContainWdEnts: false,
			predsAreTerms: hasTriples,
			predsIncludeInstanceOrSubclass: false,
			predsAreWdPropsOrWildcards: hasTriples,
			objsContainWdEnts: false,
			singleKnownRelation: false,
			singleUnKnownRelation: false
		} );
	};

	/**
	 * Extract flags from a given entry
	 *
	 * @param {object} tripleFlags
	 * @param {object} entry
	 *
	 * @return {object} tripleFlags
	 */
	SELF.prototype._extractFlags = function ( tripleFlags, entry ) {
		var triple = entry.triple;

		// The following conditions utilize JS Short-circuiting in order to avoid calling
		// the check function on the right hand of the operator unnecessarily.
		//
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence#short-circuiting

		// All predicates are terms:
		// Once it evaluates to **false** no more checks will be done.
		tripleFlags.predsAreTerms = tripleFlags.predsAreTerms
			&& this._isTermLabel( triple.predicate );

		// All subjects are WD entities:
		// Once it evaluates to **false** no more checks will be done.
		tripleFlags.subjsAreWdEnts = tripleFlags.subjsAreWdEnts
			&& this._isWikidataEntity( triple.subject );

		// Some predicates are instance of or subclass:
		// We use a reducer to analyze complex RDF terms such as wildcards.
		// Once it evaluates to **true** no more checks will be done but the reducer will continue.
		tripleFlags.predsIncludeInstanceOrSubclass = this._reduceRdfTerm(
			triple.predicate,
			function ( result, term ) {
				return result || this._isInstanceOrSubclass( term );
			}.bind( this ),
			tripleFlags.predsIncludeInstanceOrSubclass
		);

		// Some predicates are WD properties:
		// We use a reducer to analyze complex RDF terms such as wildcards.
		// Once it evaluates to **false** no more checks will be done but the reducer will continue.
		tripleFlags.predsAreWdPropsOrWildcards = this._reduceRdfTerm(
			triple.predicate,
			function ( result, term ) {
				return result && this._isWikidataProperty( term );
			}.bind( this ),
			tripleFlags.predsAreWdPropsOrWildcards
		);

		// Some triples are hints or forward:
		// Once it evaluates to true no more checks will be done.
		tripleFlags.hasHintsOrForward = tripleFlags.hasHintsOrForward
			|| this._hasHintsOrForward( triple );

		// Some objects are WD entities:
		// Once it evaluates to true no more checks will be done.
		tripleFlags.objsContainWdEnts = tripleFlags.objsContainWdEnts
			|| this._isWikidataEntity( triple.object );

		// Some subjects are WD entities:
		// Once it evaluates to true no more checks will be done.
		tripleFlags.subjsContainWdEnts = tripleFlags.subjsContainWdEnts
			|| this._isWikidataEntity( triple.subject );

		// The following section analyzes composed flags, therefore we check the flags themselves

		// Has either one or two triples where subject, object, and predicates are WD properties or items
		// or are hints and forwards
		tripleFlags.singleKnownRelation = tripleFlags.singleKnownRelation
			|| this._isSingleKnownRelation( tripleFlags );

		// Has one triples where both subject and object are WD items
		// and predicates are not WD properties or wildcards
		tripleFlags.singleUnKnownRelation = tripleFlags.singleUnKnownRelation
			|| this._isSingleUnKnownRelation( tripleFlags );

		return tripleFlags;
	};

	/**
	 * Recursively reduces an RDF term structure (string, array, or object) using the provided
	 * callback function.
	 *
	 * @param {(string|Object)} rdfTerm - The RDF term to reduce. Can be a string, or an object.
	 * @param {function} callback - The reducer function, called as callback(accumulator, value,
	 *                              [key]).
	 * @param {*} initial - The initial accumulator value.
	 * @returns {*} The accumulated result after reducing all terms.
	 * @private
	 */
	SELF.prototype._reduceRdfTerm = function ( rdfTerm, callback, initial ) {
		var self = this;

		if ( typeof rdfTerm === 'string' ) {
			return callback( initial, rdfTerm );
		}

		if ( typeof rdfTerm === 'object' ) {
			return rdfTerm.items.reduce( function ( acc, item ) {
				return self._reduceRdfTerm( item, callback, acc );
			}, initial );
		}

		return initial;
	};

	/**
	 * Check if the predicate is a term label
	 *
	 * @param {string} predicate
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._isTermLabel = function ( predicate ) {
		var termPredicates = [
			this._prefixes.rdfs + 'label',
			this._prefixes.wikibase + 'label',
			this._prefixes.skos + 'altLabel',
			this._prefixes.schema + 'description',
			this._prefixes.wikibase + 'lemma'
		];

		return termPredicates.includes( predicate );
	};

	/**
	 * Check if the RDF term is a Wikidata entity
	 *
	 * @param {string} rdfTerm
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._isWikidataEntity = function ( rdfTerm ) {
		var patterns = [
			/^http:\/\/www\.wikidata\.org\/entity\/[QPL][0-9]+$/, // Items, Properties, Lexemes
			/^http:\/\/www\.wikidata\.org\/entity\/L[0-9]+-[FS][0-9]+$/ // Senses, Forms
		];
		return patterns.some( function ( pattern ) {
			return pattern.test( rdfTerm );
		} );
	};

	/**
	 * Check if the predicate is an instance or subclass
	 *
	 * @param {string} predicate
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._isInstanceOrSubclass = function ( predicate ) {
		var patterns = [
			/^http:\/\/www\.wikidata\.org\/prop\/P31$/, // instance of
			/^http:\/\/www\.wikidata\.org\/prop\/direct\/P31$/, // Truthy instance of
			/^http:\/\/www\.wikidata\.org\/prop\/P279$/, // subclass of
			/^http:\/\/www\.wikidata\.org\/prop\/direct\/P279$/ // Truthy subclass of
		];

		return patterns.some( function ( pattern ) {
			return pattern.test( predicate );
		} );
	};

	/**
	 * Check if the RDF term is a Wikidata property
	 *
	 * @param {string} rdfTerm
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._isWikidataProperty = function ( rdfTerm ) {
		var patterns = [
			/^http:\/\/www\.wikidata\.org\/prop\/P[0-9]+$/, // Properties
			/^http:\/\/www\.wikidata\.org\/prop\/direct\/P[0-9]+$/ // Truthy Properties
		];

		return patterns.some( function ( pattern ) {
			return pattern.test( rdfTerm );
		} );
	};

	/**
	 * Check if the triple has hints or forward
	 *
	 * @param {object} triple
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._hasHintsOrForward = function ( triple ) {
		return triple.subject === this._prefixes.hint + 'Prior'
			&& triple.predicate === this._prefixes.hint + 'gearing'
			&& ( triple.object === '\"forward\"' || triple.object === '\"forwards\"' );
	};

	/**
	 * Check if the flags are single known relation
	 *
	 * @param {object} flags
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._isSingleKnownRelation = function ( flags ) {
		var subjsAndObjsContainWdEnts = flags.subjsContainWdEnts && flags.objsContainWdEnts,
			singleWdProp = flags.predsAreWdPropsOrWildcards && flags.isSingleStatement,
			twoWithHints = flags.isTwoStatement && flags.hasHintsOrForward;

		return subjsAndObjsContainWdEnts && ( singleWdProp || twoWithHints );
	};

	/**
	 * Check if the flags are single unknown relation
	 *
	 * @param {object} flags
	 * @return {boolean}
	 * @private
	 */
	SELF.prototype._isSingleUnKnownRelation = function ( flags ) {
		var subjsAndObjsContainWdEnts = flags.subjsContainWdEnts && flags.objsContainWdEnts;

		return flags.isSingleStatement && subjsAndObjsContainWdEnts && !flags.predsAreWdPropsOrWildcards;
	};

	return SELF;
}( jQuery, wikibase ) );
