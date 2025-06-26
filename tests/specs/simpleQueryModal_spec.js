'use strict';
const assert = require( 'assert' );

describe( 'simple query modal', () => {
	const queries = {
		simpleQuery: 'select * where{ wd:Q117494 wdt:P734 ?x}',
		complexQuery: `
			SELECT ?item ?itemLabel ?other WHERE {
			 VALUES (?item ?itemLabel ?other) {
			     (wd:Q42 "Douglas Adams"@en "1952-03-11T00:00:00Z"^^xsd:dateTime)
			     (wd:Q80 "Tim Berners-Lee"@de <http://commons.wikimedia.org/wiki/Special:FilePath/Sir%20Tim%20Berners-Lee%20%28cropped%29.jpg>)
			} }`
	};

	afterEach( async () => {
		await browser.execute( () => {
			localStorage.removeItem( 'simpleQueryModalShown' );
		} );
	} );

	async function openFreshSessionWithQuery( query ) {
		const url = browser.options.baseUrl + '/#' + encodeURI( query );
		await browser.url( url );
		// Refreshing to ensure that there are no results from the previous query.
		// The .url() call above only changes the URI fragment
		await browser.refresh();
	}

	it( 'should run query after dismissing modal by clicking "Run query anyway"', async () => {
		await openFreshSessionWithQuery( queries.simpleQuery );

		await $( '#execute-button' ).click();
		const modal = $( '#simple-query-modal' );
		await modal.waitForDisplayed();
		await $( '#continue-running-query' ).click();
		await modal.waitForDisplayed( { reverse: true } );

		assert.strictEqual( await modal.isDisplayed(), false, 'the modal should be hidden after confirmation' );

		const results = $( '#query-result' );
		await results.waitForDisplayed();
		const resultHeaders = await results.$( 'tr' ).getText();

		assert( resultHeaders.includes( 'x' ), 'expected results to include variable ?x' );
	} );

	it( 'should open "learn alternatives" link, hide the modal, and not execute of the query', async () => {
		await openFreshSessionWithQuery( queries.simpleQuery );

		await $( '#execute-button' ).click();
		const modal = $( '#simple-query-modal' );
		await modal.waitForDisplayed();

		await $( '#learn-alternatives' ).click();
		await browser.waitUntil(
			async () => ( await browser.getUrl() ) === 'https://www.wikidata.org/wiki/Wikidata:Data_access',
			{ timeout: 10000, timeoutMsg: 'New tab did not finish loading in time' }
		);

		const handles = await browser.getWindowHandles();
		assert.strictEqual( handles.length, 2, 'New tab should open' );

		await browser.closeWindow();
		await browser.switchToWindow( handles[ 0 ] );

		assert.strictEqual( await $( '#simple-query-modal' ).isDisplayed(), false, 'the modal should not reappear' );
		assert.strictEqual( await $( '#query-result' ).isDisplayed(), false, 'the result should not be showing' );
	} );

	it( 'should not display simple query modal for complex query', async () => {
		await openFreshSessionWithQuery( queries.complexQuery );

		await $( '#execute-button' ).click();

		assert.strictEqual( await $( '#simple-query-modal' ).isDisplayed(), false, 'simple query modal should not appear for complex queries' );

		const results = $( '#query-result' );
		await results.waitForDisplayed();
		const resultHeaders = await results.$( 'tr' ).getText();

		assert( resultHeaders.includes( 'itemLabel' ), 'expected results to include variable ?itemLabel' );
	} );

	it( 'should not display modal for simple query if the session key is already set', async () => {
		await openFreshSessionWithQuery( queries.simpleQuery );

		await browser.execute( () => {
			if ( !localStorage.getItem( 'simpleQueryModalShown' ) ) {
				localStorage.setItem( 'simpleQueryModalShown', 'true' );
			}
		} );

		await $( '#execute-button' ).click();

		assert.strictEqual( await $( '#simple-query-modal' ).isDisplayed(), false, 'the modal should be skipped after displaying first time' );

		const results = $( '#query-result' );
		await results.waitForDisplayed();
		const resultHeaders = await results.$( 'tr' ).getText();

		assert( resultHeaders.includes( 'x' ), 'expected results to include variable ?x' );
	} );
} );
