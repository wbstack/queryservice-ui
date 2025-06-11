( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.services' );

	var PACKAGE = wb.queryService.services;

	fetch( 'queryService/services/SparqlClassifier.test.data.json' )
		.then( response => response.json() )
		.then( testData => {
			QUnit.test.each( 'When called with classified queries then', testData, function ( assert, fixture ) {
				var q = new PACKAGE.SparqlClassifier();

				assert.strictEqual(
					q.classify( fixture.query ),
					fixture.expectedClass,
					'classification should match expected value:\n' + fixture.query
				);
				assert.strictEqual(
					q.isSimpleQuery( fixture.query ),
					fixture.isSimpleQuery,
					'classifier should detect simple/complex query:\n' + fixture.query
				);
			} );
		} )
		.catch( error => {
			// eslint-disable-next-line no-console
			console.error( 'Failed to load test data:', error ); // jshint ignore:line
		} );

}( jQuery, QUnit, sinon, wikibase ) );
