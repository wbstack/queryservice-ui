( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.services' );

	var PACKAGE = wb.queryService.services;

	QUnit.test( 'When instantiating new SparqlClassifier then', function ( assert ) {
		assert.expect( 2 );
		var q = new PACKAGE.SparqlClassifier();

		assert.ok( true, 'must not throw an error' );
		assert.ok( ( q instanceof PACKAGE.SparqlClassifier ), 'object must be type of SparqlClassifier' );
	} );

	fetch( 'queryService/services/SparqlClassifier.test.data.json' )
		.then( response => response.json() )
		.then( testData => {
			QUnit.test.each( 'When instantiated with classified queries then', testData, function ( assert, fixture ) {
				var q = new PACKAGE.SparqlClassifier( fixture.query );
				var classifications = q.classify();
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
