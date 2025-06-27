( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.services' );

	var PACKAGE = wb.queryService.services;
	var PREFIXES = wikibase.queryService.RdfNamespaces.ALL_PREFIXES;

	var QUERY = {
		TERM_PREDICATES_QUERY: [
			{ triple: { subject: '?item', predicate: PREFIXES.skos + 'altLabel', object: '?itemLabel' } },
			{ triple: { subject: '?item', predicate: PREFIXES.rdfs + 'label', object: '?itemLabel' } }
		],
		PREDS_INCLUDE_INSTANCE_OR_SUBCLASS: [
			{ triple: {
				subject: PREFIXES.wd + 'Q1',
				predicate: { items: [ PREFIXES.wdt + 'P31', { items: [ PREFIXES.wdt + 'P279' ] } ] },
				object: PREFIXES.wd + 'Q5' }
			}
		],
		HINT_AND_FORWARD: [
			{ triple: {
				subject: PREFIXES.wd + 'Q1',
				predicate: PREFIXES.wdt + 'P1',
				object: '?item'
			} },
			{ triple: { subject: PREFIXES.hint + 'Prior', predicate: PREFIXES.hint + 'gearing', object: '"forward"' } }
		],
		HINT_AND_FORWARDS: [
			{ triple: {
				subject: PREFIXES.wd + 'Q1',
				predicate: PREFIXES.wdt + 'P1',
				object: '?item'
			} },
			{ triple: { subject: PREFIXES.hint + 'Prior', predicate: PREFIXES.hint + 'gearing', object: '"forwards"' } }
		],
		SOME_SUBJ_ENTITIES: [
			{ triple: { subject: PREFIXES.wd + 'Q42', predicate: PREFIXES.wdt + 'P1', object: '?item' } },
			{ triple: { subject: '?item', predicate: PREFIXES.rdfs + 'label', object: 'test' } }
		],
		SINGLE_KNOWN_RELATION: [
			{ triple: { subject: PREFIXES.wd + 'Q42', predicate: PREFIXES.wdt + 'P31', object: PREFIXES.wd + 'Q5' } }
		],
		SINGLE_KNOWN_RELATION_WITH_HINT: [
			{ triple: { subject: PREFIXES.wd + 'Q42', predicate: PREFIXES.wdt + 'P31', object: PREFIXES.wd + 'Q5' } },
			{ triple: { subject: PREFIXES.hint + 'Prior', predicate: PREFIXES.hint + 'gearing', object: '"forward"' } }
		],
		SINGLE_UNKNOWN_RELATION: [
			{ triple: { subject: PREFIXES.wd + 'Q42', predicate: '?p', object: PREFIXES.wd + 'Q5' } }
		]
	};

	QUnit.test( 'When instantiating new TriplesAnalyzer then', function ( assert ) {
		assert.expect( 2 );
		var q = new PACKAGE.TriplesAnalyzer();

		assert.ok( true, 'must not throw an error' );
		assert.ok( ( q instanceof PACKAGE.TriplesAnalyzer ), 'object must be type of SparqlClassifier' );
	} );

	[
		{
			name: 'only term predicates',
			query: QUERY.TERM_PREDICATES_QUERY,
			triplesFlags: {
				hasHintsOrForward: false,
				isSingleStatement: false,
				isTwoStatement: true,
				subjsAreWdEnts: false,
				subjsContainWdEnts: false,
				predsAreTerms: true,
				predsIncludeInstanceOrSubclass: false,
				predsAreWdPropsOrWildcards: false,
				objsContainWdEnts: false,
				singleKnownRelation: false,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'instance/subclass predicate, WD props, and object entity',
			query: QUERY.PREDS_INCLUDE_INSTANCE_OR_SUBCLASS,
			triplesFlags: {
				hasHintsOrForward: false,
				isSingleStatement: true,
				isTwoStatement: false,
				subjsAreWdEnts: true,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: true,
				predsAreWdPropsOrWildcards: true,
				objsContainWdEnts: true,
				singleKnownRelation: true,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'hints and forward',
			query: QUERY.HINT_AND_FORWARD,
			triplesFlags: {
				hasHintsOrForward: true,
				isSingleStatement: false,
				isTwoStatement: true,
				subjsAreWdEnts: false,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: false,
				predsAreWdPropsOrWildcards: false,
				objsContainWdEnts: false,
				singleKnownRelation: false,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'hints and forwards',
			query: QUERY.HINT_AND_FORWARDS,
			triplesFlags: {
				hasHintsOrForward: true,
				isSingleStatement: false,
				isTwoStatement: true,
				subjsAreWdEnts: false,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: false,
				predsAreWdPropsOrWildcards: false,
				objsContainWdEnts: false,
				singleKnownRelation: false,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'some subject entities',
			query: QUERY.SOME_SUBJ_ENTITIES,
			triplesFlags: {
				hasHintsOrForward: false,
				isSingleStatement: false,
				isTwoStatement: true,
				subjsAreWdEnts: false,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: false,
				predsAreWdPropsOrWildcards: false,
				objsContainWdEnts: false,
				singleKnownRelation: false,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'single known relation',
			query: QUERY.SINGLE_KNOWN_RELATION,
			triplesFlags: {
				hasHintsOrForward: false,
				isSingleStatement: true,
				isTwoStatement: false,
				subjsAreWdEnts: true,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: true,
				predsAreWdPropsOrWildcards: true,
				objsContainWdEnts: true,
				singleKnownRelation: true,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'single known relation with hint',
			query: QUERY.SINGLE_KNOWN_RELATION_WITH_HINT,
			triplesFlags: {
				hasHintsOrForward: true,
				isSingleStatement: false,
				isTwoStatement: true,
				subjsAreWdEnts: false,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: true,
				predsAreWdPropsOrWildcards: false,
				objsContainWdEnts: true,
				singleKnownRelation: true,
				singleUnKnownRelation: false
			}
		},
		{
			name: 'single unknown relation',
			query: QUERY.SINGLE_UNKNOWN_RELATION,
			triplesFlags: {
				hasHintsOrForward: false,
				isSingleStatement: true,
				isTwoStatement: false,
				subjsAreWdEnts: true,
				subjsContainWdEnts: true,
				predsAreTerms: false,
				predsIncludeInstanceOrSubclass: false,
				predsAreWdPropsOrWildcards: false,
				objsContainWdEnts: true,
				singleKnownRelation: false,
				singleUnKnownRelation: true
			}
		}
	].forEach( function ( testCase ) {
		QUnit.test( 'When analyzing query with ' + testCase.name + ' then', function ( assert ) {
			var q = new PACKAGE.TriplesAnalyzer();
			var result = q.analyze( testCase.query );

			assert.deepEqual(
				result,
				testCase.triplesFlags,
				'flags for ' + testCase.name + ' match expected' );
		} );
	} );

	QUnit.test( 'Analyze calls helper methods correct number of times', function ( assert ) {
		var triplesAnalyzer = new PACKAGE.TriplesAnalyzer();

		var spyTerm = sinon.spy( triplesAnalyzer, '_isTermLabel' );
		var spyEnt = sinon.spy( triplesAnalyzer, '_isWikidataEntity' );
		var spyInst = sinon.spy( triplesAnalyzer, '_isInstanceOrSubclass' );
		var spyProp = sinon.spy( triplesAnalyzer, '_isWikidataProperty' );
		var spyHints = sinon.spy( triplesAnalyzer, '_hasHintsOrForward' );

		triplesAnalyzer.analyze( QUERY.TERM_PREDICATES_QUERY );

		assert.equal( spyTerm.callCount, 2, '_isTermLabel called once' );
		assert.equal( spyEnt.callCount, 5, '_isWikidataEntity called for subject and object' );
		assert.ok( spyInst.callCount, 1, '_isInstanceOrSubclass called at least once' );
		assert.ok( spyProp.callCount, 1, '_isWikidataProperty called at least once' );
		assert.ok( spyHints.callCount, 1, '_hasHintsOrForward called at least once' );
	} );

}( jQuery, QUnit, sinon, wikibase ) );
