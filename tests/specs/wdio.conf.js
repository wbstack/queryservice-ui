'use strict';
const { startVideo, stopVideo } = require( 'wdio-mediawiki' );

let ffmpeg;
exports.config = {
	//
	// ====================
	// Runner Configuration
	// ====================
	//
	// WebdriverIO allows it to run your test in arbitrary locations (e.g. locally or
	// on a remote machine).
	runner: 'local',

	//
	// ==================
	// Specify Test Files
	// ==================
	// Define which test specs should run. The pattern is relative to the directory
	// from which `wdio` was called. Notice that, if you are calling `wdio` from an
	// NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
	// directory is where your package.json resides, so `wdio` will be called from there.
	//
	specs: [
		'./tests/specs/**/*.js'
	],
	// Patterns to exclude.
	exclude: [
	],

	maxInstances: 10,

	capabilities: [ {
		maxInstances: 5,
		browserName: 'chrome',
		'goog:chromeOptions': {
			args: [
				...( process.env.DISPLAY ? [] : [ '--headless' ] )
			]
		},
		'mw:screenshotPath': __dirname + '/log'
	} ],

	logLevel: 'error',

	bail: 0,

	baseUrl: 'http://localhost:8082',

	waitforTimeout: 10000,

	connectionRetryTimeout: 90000,

	connectionRetryCount: 3,

	services: [],

	framework: 'mocha',

	reporters: [ 'spec' ],

	mochaOpts: {
		ui: 'bdd',
		timeout: 60000
	},

	beforeTest: async function ( test ) {
		ffmpeg = await startVideo( ffmpeg, `${test.parent}-${test.title}` );
	},

	afterTest: async function () {
		stopVideo( ffmpeg );
	}
};
