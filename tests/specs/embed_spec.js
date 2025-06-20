'use strict';
const assert = require( 'assert' );

describe( 'embed.html', () => {
	it( 'loads results for query', async () => {
		const query = `
			SELECT ?item ?itemLabel ?other WHERE {
			 VALUES (?item ?itemLabel ?other) {
			     (wd:Q42 "Douglas Adams"@en "1952-03-11T00:00:00Z"^^xsd:dateTime)
			     (wd:Q80 "Tim Berners-Lee"@de <http://commons.wikimedia.org/wiki/Special:FilePath/Sir%20Tim%20Berners-Lee%20%28cropped%29.jpg>)
			} }`;

		const url = browser.options.baseUrl + '/embed.html#' + encodeURI( query );
		browser.url( url );

		const results = $( '#query-result' );
		await results.waitForDisplayed();

		const resultHeaders = await results.$( 'tr' ).getText();
		assert( resultHeaders.includes( 'item' ) );
		assert( resultHeaders.includes( 'other' ) );
		assert( resultHeaders.includes( 'itemLabel' ) );
	} );
} );
