> ℹ️ Issues for this repository are tracked on [Phabricator](https://phabricator.wikimedia.org/project/board/5563/) - ([Click here to open a new one](https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?tags=wikibase_cloud
))

# Wikibase Query Service GUI

This repository contains the GUI for the [Wikidata Query Service](https://query.wikidata.org/).

Please see more details about the service in the [User Manual](https://www.mediawiki.org/wiki/Special:MyLanguage/Wikidata_Query_Service/User_Manual).

## Download & setup

Clone git repo, go into created folder and then pull all dependencies via npm package manager.

```bash
$ git clone https://gerrit.wikimedia.org/r/wikidata/query/gui
$ cd gui
$ npm install
```

Alternatively, use `npm install`.

```bash
npm install wikidata-query-gui
```

## Configuration
Per default the Wikibase Query Service GUI is configured to be used as a local development test instance. It can be customized by creating a `custom-config.json` in the repository's root dir. This file can be used to override any of the default settings obtained from `default-config.json`.

### Banner Message

The banner message may be configured per site deployment. In order display a banner, add its banner key to the configuration:

```js
{
// ...
  "bannerName": "query-builder",
// ...
}
```

Empty values, falsy values and undefined banner keys will result in the banner not showing.

## Run tests

Run JSHint, JSCS and QUnit tests.

```bash
$ npm test
```

## Debug
Start a test server for local debugging. Do not use it in production.

```bash
$ npm start
```

## Build
Create a build with bundled and minified files.

```bash
$ npm run build
```

## Local development

Build image locally:
```
DOCKER_BUILDKIT=1 docker build --target production -f .pipeline/blubber.yaml .
```

Run image:
```
docker run -p 8080:8080 <image name>
```

Visit `http://127.0.0.1:8080/`


## Publish new image version

To create a new image version merge your change into the main branch.

This triggers the publish-image pipeline. Image is available at `docker-registry.wikimedia.org/repos/wmde/wikidata-query-gui:<timestamp>`


## Deploy in WMF environment (query.wikidata.org)

After the code changes have been merged and new container image version has been published to [Wikimedia registry](https://docker-registry.wikimedia.org/repos/wmde/wikidata-query-gui/tags/), change the version tag in the Helm chart used for deployments by making and approving the change in `helmfile.d/services/wikidata-query-gui/values.yaml` in WMF's [deployment-charts](https://gerrit.wikimedia.org/g/operations/deployment-charts).

Once the new deployment chart has been created, change the deployment chart version in use on the deployment server following instructions on https://wikitech.wikimedia.org/wiki/Kubernetes/Deployments. A bit more detailed deployment instructions for another service, that could be used for reference, can be found at https://wikitech.wikimedia.org/wiki/Miscweb#Deploy\_to\_Kubernetes/wikikube.

## Components
### Editor
A [CodeMirror](https://codemirror.net/) based SPARQL editor with code completion (ctrl+space) and tooltips (hover).
```
var editor = new wikibase.queryService.ui.editor.Editor();
editor.fromTextArea( $( '.editor' )[0] );
```
See `examples/editor.html`.

### Example dialog

A dialog that allows browsing of SPARQL examples.
```
new wikibase.queryService.ui.dialog.QueryExampleDialog(  $element, querySamplesApi, callback, previewUrl );
```
See `examples/dialog.html`.

### SPARQL

```
var api = new wikibase.queryService.api.Sparql();
api.query( query ).done( function() {
	var json = JSON.parse( api.getResultAsJson() );

} );
```
See `examples/sparql.html`.
[JSFiddle.net](https://jsfiddle.net/jonaskress/qpuynfz8/)


### Result Views
Views that allow rendering SPARQL results ([see documentation](https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:SPARQL_query_service/Wikidata_Query_Help/Result_Views)).

```
var api = new wikibase.queryService.api.Sparql();
api.query( query ).done(function() {
	var result = new wikibase.queryService.ui.resultBrowser.CoordinateResultBrowser();
	result.setResult( api.getResultRawData() );
	result.draw( element );
} );
```
See `examples/result.html`.
[JSFiddle.net](https://jsfiddle.net/jonaskress/9dhv0yLp/)

### Release Notes and npm package

Unfortunately there are no releases and the provided code and interfaces are not considered to be stable.
Also the dist/ folder contains a build that may not reflect the current code on master branch.
