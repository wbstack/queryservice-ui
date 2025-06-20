( function ( $, QUnit, sinon, wb ) {
	'use strict';

	let Tracking = wb.queryService.api.Tracking;

	QUnit.module( 'wikibase.queryService.api.Tracking', ( hooks ) => {
		hooks.afterEach( () => {
			sinon.restore();
		} );

		QUnit.test( 'prepends metric name with mediawiki prefix to comply with Stats service requirements', function ( assert ) {
			const ajaxSpy = sinon.spy( $, 'ajax' );
			const trackingApi = new Tracking();

			try {
				trackingApi.trackStats( 'wikibase_queryService_ui_app_init_total', 1, 'c', {} );
			} finally {} // eslint-disable-line no-empty

			assert.ok( ajaxSpy.called );
			assert.ok( ajaxSpy.calledWith( { url: 'https://www.wikidata.org/beacon/stats?mediawiki_wikibase_queryService_ui_app_init_total:1|c' } ) );
		} );

		QUnit.test( 'given a metric name already has mediawiki prefix, does not add it double', function ( assert ) {
			const ajaxSpy = sinon.spy( $, 'ajax' );
			const trackingApi = new Tracking();

			try {
				trackingApi.trackStats( 'mediawiki_wikibase_queryService_ui_app_init_total', 1, 'c', {} );
			} finally {} // eslint-disable-line no-empty

			assert.ok( ajaxSpy.called );
			assert.ok( ajaxSpy.calledWith( { url: 'https://www.wikidata.org/beacon/stats?mediawiki_wikibase_queryService_ui_app_init_total:1|c' } ) );
		} );
	} );
}( jQuery, QUnit, sinon, wikibase ) );
