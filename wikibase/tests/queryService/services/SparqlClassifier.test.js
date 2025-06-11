( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.services' );

	var PACKAGE = wb.queryService.services;

	fetch( 'queryService/services/SparqlClassifier.test.data.json' )
		.then( response => response.json() )
		.then( testData => {
			QUnit.test.each( 'When instantiated with classified queries then', testData, function ( assert, fixture ) {
				var q = new PACKAGE.SparqlClassifier();
				var classifications = q.classify( fixture.query );
				assert.deepEqual(
					classifications,
					fixture.expected,
					'classifications should match expected values:\n' + fixture.query
				);
			} );
		} )
		.catch( error => {
			// eslint-disable-next-line no-console
			console.error( 'Failed to load test data:', error ); // jshint ignore:line
		} );

}( jQuery, QUnit, sinon, wikibase ) );
