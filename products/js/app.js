

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

    // sensours
    var now_lat, now_long;

    // Constant
    var CON_DETECT_LEN = 3.00 ;//(M)
    var COIN_DISTANCE_MIN = CON_DETECT_LEN * 3;//(CM)
    var COIN_DISTANCE_MAX = CON_DETECT_LEN * 10;//(CM)

    // 一般的なフィルタリングの値。
    var ACC_FILTERING_VALUE = parseFloat(0.1);

    // Sound URLs
    var SOUND_URL_JUMP = 'sound/jump.wav';
    var SOUND_URL_COIN = 'sound/coin.wav';
    var SOUND_URL_FAIL = 'sound/fail.wav';
    var SOUND_URL_GET_COIN = 'sound/get_coin.wav';
    var SOUND_URL_ALREADY = 'sound/already.wav';
    var SOUND_URL_START = 'sound/start.wav';
    var SOUND_URL_GOAL = 'sound/goal.wav';

    // Load Sound
    var soundMaterialJump = new Audio(SOUND_URL_JUMP);
    soundMaterialJump.load();
    var soundMaterialCoin = new Audio(SOUND_URL_COIN);
    soundMaterialCoin.load();
    var soundMaterialCoin = new Audio(SOUND_URL_FAIL);
    soundMaterialCoin.load();
    var soundMaterialGetCoin = new Audio(SOUND_URL_GET_COIN);
    soundMaterialGetCoin.load();
    var soundMaterialAlready = new Audio(SOUND_URL_ALREADY);
    soundMaterialAlready.load();
    var soundMaterialStart = new Audio(SOUND_URL_START);
    soundMaterialStart.load();
    var soundMaterialGoal = new Audio(SOUND_URL_GOAL);
    soundMaterialGoal.load();

    // PazleCoins
    function PazleCoin(_position_length, _long, _lat) {
          this.position_length;
          this.long = _long;
          this.lat = _lat;
    }
    var PazzleCoins = [];

    // CourseLines
    function CourseLine(_startPoint, _endPoint, _start_len, _end_len, _len) {
          this.startPoint = _Point;
          this.endPoint = _Point;
          this.start_len = _start_len;
          this.end_len = _end_len;
          this.len = _len;
    }
    var CourseLines = [];
    var total_cource_length;


    var alpha = parseFloat(0);
    var beta = parseFloat(0);
    var gamma = parseFloat(0);


    //Low-pass Filter setting clear value.
    //ローパスフィルタの値を初期化
    var low_x = parseFloat(0);
    var low_y = parseFloat(0);
    var low_z = parseFloat(0);

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

        // event start
        window.addEventListener("deviceorientation", EventOrientation, true);
        window.addEventListener("devicemotion", EventMotion, true);
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

    // library

    // set pazzle coins
    function setPazzleCoins(){
      while(true){
        to_next_coin = Math.floor(Math.random() * (COIN_DISTANCE_MAX+1-COIN_DISTANCE_MIN)) +  COIN_DISTANCE_MIN;
        total_coin_length = total_coin_length + to_next_coin;
        if(total_coin_length > total_cource_length){
          break;
        }
        // TODO: Get Lat Long
        long = 0.0;
        lat = 0.0;

        PazzleCoins[i] = new PazzleCoin(total_coin_length,long,lat);
        i ++;
      }
    }


    /*
    function setPazzleCoins(){
      var total_coin_length = 0.0;
      var to_next_coin = 0;
      var i = 0;

      var long = 0.0;
      var lat = 0.0;

      while(true){
        to_next_coin = Math.floor(Math.random() * (COIN_DISTANCE_MAX+1-COIN_DISTANCE_MIN)) +  COIN_DISTANCE_MIN;
        total_coin_length = total_coin_length + to_next_coin;
        if(total_coin_length > total_cource_length){
          break;
        }
        // TODO: Get Lat Long
        long = 0.0;
        lat = 0.0;

        PazzleCoins[i] = new PazzleCoin(total_coin_length,long,lat);
        i ++;
      }
    }
    */


    // Sensor Events
    // GIRO
    function EventOrientation(event){
        alpha = event.alpha;
        beta = event.beta;
        gamma = event.gamma;
    }

    // MOTION
    function EventMotion(event){
        //HTML5 APIから加速度センサーの値を取ってくる。
        var x = parseFloat(event.accelerationIncludingGravity.x);
        var y = parseFloat(event.accelerationIncludingGravity.y);
        var z = parseFloat(event.accelerationIncludingGravity.z);

        //ローパスフィルター
        low_x = eval(x * ACC_FILTERING_VALUE + low_x * (1.0 - ACC_FILTERING_VALUE));
        low_y = eval(y * ACC_FILTERING_VALUE + low_y * (1.0 - ACC_FILTERING_VALUE));
        low_z = eval(z * ACC_FILTERING_VALUE + low_z * (1.0 - ACC_FILTERING_VALUE));

        //ハイパスフィルター
        var high_x = eval(x - low_x);
        var high_y = eval(y - low_y);
        var high_z = eval(z - low_z);
     
        // ジャンプ判定するための加速度閾値(入力値)
        var accThreshold =  eval(document.getElementById('accThreshold').value );

        // 加速度合計
        var accTotal = eval((high_y + high_x + high_z));
     

        //ジャンプ判定
        //if(high_y <= 3 && high_x > 1.8 && high_z <= 3){
        if( accTotal >= accThreshold){
            checkCoin();
            //removeEventListener("devicemotion", motion, true);
        }
    }

    // GPS
    window.addEventListener('load', function(){
        if(navigator.geolocation){
            navigator.geolocation.watchPosition(successFunc, geoError);
        }else{
            // rais error
        }
    }, false);

    function geoSucess(position){
        var crd = position.coords;

        // lat / log
        now_lat = crd.latitude;
        now_long = crd.longtude;
    }

    function geoError(error){
            // rais error
    }

    // MOTION
    function checkCoin(){
        // lat / log
        now_lat = crd.latitude;
        now_long = crd.longtude;
    }

});
