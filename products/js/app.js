

dojoConfig = {
    async: true,
    parseOnLoad: false
};
require([
    "dojox/mobile/parser",
    "dojox/mobile/compat",
    "dojox/mobile/View",
    "dojox/mobile/ScrollableView",
    "dojox/mobile/Heading",
    "dojox/mobile/RoundRectList",
    "dojox/mobile/ListItem",
    "dojox/mobile/Switch",
    "dojox/mobile/RoundRectCategory",
    "dojox/mobile/TabBar",
    "dojox/mobile/Button",
    "dojo/dom",
    "dojo/dom-construct",

    "esri/map",
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/symbols/SimpleLineSymbol",
    "dijit/registry",

    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "dijit/WidgetSet",
    "dojo/domReady!",
], function (
    parser,
    compat,
    View,
    ScrollableView,
    Heading,
    RoundRectList,
    ListItem,
    Switch,
    RoundRectCategory,
    TabBar,
    Button,
    dom,
    domConstruct,

    Map,
    Draw,
    Graphic,
    SimpleLineSymbol,
    registry
){
    var map, toolbar, symbol, geomTask;
    var view_body;
    var set_cource_btn, prepare_to_run_btn;

    parser.parse();

    view_body = registry.byId("view_body");

	map = new Map("contentview_map", {
		basemap: "streets",
        center: [-73.985605,40.709934],
		zoom: 16
	});

    map.on("load", createToolbar);


	// set cource btn
    set_cource_btn = registry.byId("contentview_setcource_start_btn");
    set_cource_btn.on("click", activateTool);

	// prepare to run btn
    prepare_to_run_btn = registry.byId("prepare_to_run_btn");
    prepare_to_run_btn.set("disabled", true);
    prepare_to_run_btn.on("click", toReadyToRun);

    // back to set course btn
    back_to_set_course_btn = registry.byId("back_to_set_course_btn");
    back_to_set_course_btn.on("click", backToSetCourse);

    // run button
    run_btn = registry.byId("run_btn");
    run_btn.on("click", toRunning);

    // pause button
    pause_btn = registry.byId("pause_btn");
    pause_btn.on("click", backToReadyToRun);

    // goal button
    goal_btn = registry.byId("goal_btn");
    goal_btn.on("click", toGoal);

    // goal button
    home_btn = registry.byId("home_btn");
    home_btn.on("click", resetToHome);

	function activateTool() {
        set_cource_btn.set("disabled", true);
		toolbar.activate("polyline"); // polyline
		map.hideZoomSlider();
	}

	function createToolbar(themap) {
		toolbar = new Draw(map);
		toolbar.on("draw-end", addToMap);
	}

	function addToMap(evt) {
        set_cource_btn.set("disabled", false);
		var symbol;
		toolbar.deactivate();
		map.showZoomSlider();
		symbol = new SimpleLineSymbol();
		var graphic = new Graphic(evt.geometry, symbol);
		map.graphics.add(graphic);
        if(true){
            prepare_to_run_btn.set("disabled", false);
        }
	}

    function toReadyToRun(){
        // map move
        contentview_map = dom.byId("contentview_map");
        contentview_mappoint = dom.byId("contentview_readytorun_mappoint");
        domConstruct.place(contentview_map, contentview_mappoint, "after");
        // to readyToRun
        dijit.byId("view_setcourse")
        .performTransition("view_readytorun", 1, "slide", null);
    }

    function backToSetCourse(){
        // map move
        contentview_map = dom.byId("contentview_map");
        contentview_mappoint = dom.byId("contentview_setcource_mappoint");
        domConstruct.place(contentview_map, contentview_mappoint, "after");
        // to readyToRun
        dijit.byId("view_readytorun")
        .performTransition("view_setcourse", -1, "slide", null);
    }


    function backToReadyToRun(){
        // back to readyToRun
        dijit.byId("view_running")
        .performTransition("view_readytorun", -1, "slide", null);
    }

    function toRunning(){
        // to Running
        dijit.byId("view_readytorun")
        .performTransition("view_running", 1, "slide", null);
    }

    function toGoal(){
        // to Goal
        dijit.byId("view_running")
        .performTransition("view_goal", 1, "slide", null);
    }

    function resetToHome(){
        // reset to Home
        dijit.byId("view_goal")
        .performTransition("view_home", -1, "slide", null);
    }
});
