var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.api = wikibase.queryService.api || {};

wikibase.queryService.api.NoOpTracking = ( function ( $ ) {
	'use strict';

	/**
	 * Tracking service that does nothing.
	 * To be used to satisfy the Tracking contract
	 * in contexts where tracking is meant to be skipped
	 *
	 * @class wikibase.queryService.api.NoOpTracking
	 * @license GNU GPL v2+
	 *
	 * @constructor
	 */
	function SELF() {
	}

	/**
	 * @param {string} metricName
	 * @param {number} value
	 * @param {string} valueType
	 *
	 * @return {jQuery.Promise}
	 */
	SELF.prototype.track = function ( metricName, value, valueType ) { // jshint ignore:line
		return $.when();
	};

	/**
	 * @param {string} metricName
	 * @param {number} value
	 * @param {string} valueType
	 * @param {object} labels
	 *
	 * @return {jQuery.Promise}
	 */
	SELF.prototype.trackStats = function ( metricName, value, valueType, labels ) { // jshint ignore:line
		return $.when();
	};

	return SELF; // jshint ignore:line

}( jQuery ) );
