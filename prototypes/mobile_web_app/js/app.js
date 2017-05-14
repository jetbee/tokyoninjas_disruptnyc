// routing & map test
require([
		"esri/map",
		"dojo/domReady!",
		"esri/toolbars/draw",
		"dojox/mobile",
		"dojox/mobile/View",
],
function(
	Map, Button, parser, mobile, View) {
	var map = new Map("map", {
		center: [-118, 34.5],
		zoom: 8,
		basemap: "topo"
	});
	map.on("load", createToolbar);

	function activateTool() {
		var tool = this.label.toUpperCase().replace(/ /g, "_");
		toolbar.activate(Draw[tool]);
		map.hideZoomSlider();
	}
});
