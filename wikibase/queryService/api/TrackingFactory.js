var wikibase = window.wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.api = wikibase.queryService.api || {};

wikibase.queryService.api.getTrackingServiceBasedOnGlobalContext = function () {
	'use strict';

	if (
		location.hostname !== 'query.wikidata.org' ||
		/^1|yes/.test( navigator.doNotTrack || window.doNotTrack )
	) {
		return new wikibase.queryService.api.NoOpTracking();
	}

	return wikibase.queryService.api.Tracking();
};
