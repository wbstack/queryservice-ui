var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.api = wikibase.queryService.api || {};

wikibase.queryService.api.Tracking = ( function ( $ ) {
	'use strict';

	var STATSD_API_ENDPOINT = 'https://www.wikidata.org/beacon/statsv';
	var STATS_API_ENDPOINT = 'https://www.wikidata.org/beacon/stats';

	/**
	 * API for the Tracking API
	 *
	 * @class wikibase.queryService.api.Tracking
	 * @license GNU GPL v2+
	 *
	 * @author Addshore
	 * @constructor
	 */
	function SELF() {
		this._statsdEndpoint = STATSD_API_ENDPOINT;
		this._statsEndpoint = STATS_API_ENDPOINT;
	}

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._statsdEndpoint = null;

	/**
	 * @property {string}
	 * @private
	 */
	SELF.prototype._statsEndpoint = null;

	/**
	 * @param {string} metricName
	 * @param {number} value
	 * @param {string} valueType
	 *
	 * @return {jQuery.Promise}
	 */
	SELF.prototype.track = function ( metricName, value, valueType ) {
		if ( !value ) {
			value = 1;
		}
		if ( !valueType ) {
			valueType = 'c';
		}

		if (
			location.hostname !== 'query.wikidata.org' ||
			/^1|yes/.test( navigator.doNotTrack || window.doNotTrack )
		) {
			// skip tracking
			return $.when();
		}

		// https://www.wikidata.org/beacon/statsv?test.statsv.foo2=5c
		return this._track( metricName + '=' + value + valueType );
	};

	/**
	 * @param {string} metricName
	 * @param {number} value
	 * @param {string} valueType
	 * @param {object} labels
	 *
	 * @return {jQuery.Promise}
	 */
	SELF.prototype.trackStats = function ( metricName, value, valueType, labels ) {
		if ( !value ) {
			value = 1;
		}
		if ( !valueType ) {
			valueType = 'c';
		}
		if ( !labels ) {
			labels = {};
		}

		if (
			location.hostname !== 'query.wikidata.org' ||
			/^1|yes/.test( navigator.doNotTrack || window.doNotTrack )
		) {
			// skip tracking
			return $.when();
		}
		var statsdExample = this._formatDogstatsd( metricName, value + '|' + valueType, labels );

		return $.ajax( {
			url: this._statsEndpoint + '?' + statsdExample
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._track = function ( query ) {
		// This may cause a warning due to lack of CORS header.
		// We do not need to read the result, so that is ok.
		return $.ajax( {
			url: this._statsdEndpoint + '?' + query
		} );
	};

	/**
	 * @private
	 */
	SELF.prototype._formatDogstatsd = function ( name, value, labels ) {
		// Example of produced output:
		//
		//   mediawiki_example_thing_total:42|c|#key1:value1,key2:value2
		//
		// See also:
		// * Other producer: Wikimedia\Stats\Formatters\DogStatsdFormatter in MediaWiki core
		// * Consumer: https://github.com/prometheus/statsd_exporter/blob/v0.28.0/pkg/mapper/escape.go#L21
		// * Spec: https://docs.datadoghq.com/developers/dogstatsd/datagram_shell?tab=metrics
		var rLegal = /^[A-Za-z0-9_]+$/;
		var labelStr = '';
		for ( var labelKey in labels ) {
			if ( !rLegal.test( labelKey ) ) {
				throw new TypeError( 'Invalid stat label "' + labelKey + '"' );
			}
			var val = labels[ labelKey ];
			if ( !rLegal.test( val ) ) {
				val = '_invalid_value';
			}
			var labelStart = !labelStr ? encodeURIComponent( '|#' ) : ',';
			labelStr += labelStart + labelKey + ':' + val;
		}

		return name + ':' + value + labelStr;
	};

	return SELF;

}( jQuery ) );
