$(document).ready(function(){

	

	function renderNavTree(){
		var cityId = [
			{
				pname: "陕西",
				cityList: [
					{
						cname: '西安',
						cid: 316
					},
					{
						cname: '延安',
						cid: 317
					},
					{
						cname: '榆林',
						cid: 318
					},
					{
						cname: '铜川',
						cid: 319
					},
					{
						cname: '商洛',
						cid: 320
					}
				]
			},
			{
				pname: "新疆",
				cityList: [
					{
						cname: '乌鲁木齐',
						cid: 337
					},
					{
						cname: '石河子',
						cid: 338
					},
					{
						cname: '吐鲁番',
						cid: 340
					},
					{
						cname: '阿克苏',
						cid: 343
					}
				]
			},
			{
				pname: "江苏",
				cityList: [
					{
						cname: '南京',
						cid: 399
					},
					{
						cname: '镇江',
						cid: 400
					},
					{
						cname: '扬州',
						cid: 403
					},
					{
						cname: '连云港',
						cid: 407
					}
				]
			}
		];

		var tree = [
		];

		// initialize the tree object
		cityId.forEach(function(item){
			// step 1: push the province object
			var p = {};
			p.text = item.pname;
			// step 2: push the cities object
			p.nodes = item.cityList.map(function(city){
				return {text: city.cname};
			});
			p.state = {expanded: false};
			
			tree.push(p);
		});
		$(".country-list-tree").treeview({
			data: tree,
			onNodeSelected: function(event, data){

				// check whether user select a parent node
				if(data.nodes){
					// province nodes clicked
					var curCities = [];
					cityId.forEach(function(item){
						if(item.pname === data.text){
							curCities = item.cityList;
						}
					});
					var curPromise = [];
					curCities.forEach(function(item){
						curPromise.push(loadData(item.cid));
					});

					$.when.apply(null, curPromise).then(function(){
						var list = [];
						for(var i=0;i<arguments.length;i++){
							list.push(arguments[i]);
						}
						renderProvinceContent(list);

					});
				}else{
					// city nodes clicked
					// step1: get current date and calculate the previous 7 days
					var today = moment();
					var datesArr = [];
					var temp = '';
					var promiseArr = [];

					// get which city user select
					var id = '';
					cityId.forEach(function(item){
						item.cityList.forEach(function(city){
							if(city.cname === data.text){
								id = city.cid;
							}
						});
					});
					var startDate = '';
					for(var i=0;i<7;i++){
						temp = today.subtract(1, 'day').format('YYYYMMDD');
						promiseArr.push(loadPrevious7DaysData(id, temp));
						if(i == 6){
							startDate = moment(temp);
						}
					}
					
					$.when.apply(null, promiseArr).then(function(){
						var list = [];
						for(var i=0;i<arguments.length;i++){
							list.push(arguments[i]);
						}
						
						// handling the 7 days data
						var destArr = [];
						list.forEach(function(item){
							var current = 0;
							item.forEach(function(day){
								current += parseInt(day.aqi)
							});
							var average = current/item.length;
							destArr.push(Math.ceil(average));
						});

						renderHighCharts(data.text, destArr, startDate.year(), startDate.month(), startDate.date());

					});
					
					
					
				}
				

				
			}
		});
	}


	

	function bindEvent(){
		$(".help-btn").on("mouseenter", function(){
			$(".help-btn-tooltips").show();
		});

		$(".help-btn").on("mouseleave", function(){
			$(".help-btn-tooltips").hide();
		});

		$(".language-btn").on("click", function(){
			$(".language-list-container").toggle();
		});

		$(".admin-tools-btn").on("click", function(){
			$(".admin-tools-list-container").toggle();
		});
	}

	function renderProvinceContent(data){
		var cityList = data;
		var pagefn = doT.template(document.getElementById('cityItem').text);
		$(".content-page").html(pagefn(cityList));
	}

	function loadData(cityId){
		var defer = $.Deferred();
		var urlParameter = "http://api.k780.com/?app=weather.pm25&weaid="+cityId+"&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json";
		$.ajax({
		  url: urlParameter
		}).done(function(data) {
		  if(data.success === "1"){
		  	defer.resolve(data.result);
		  }
		});
		return defer.promise();
	}

	function loadPrevious7DaysData(cityId, date){
		var defer = $.Deferred();
		var urlParameter = "http://api.k780.com/?app=weather.history&weaid="+cityId+"&date="+date+"&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json";
		$.ajax({
		  url: urlParameter
		}).done(function(data) {
		  if(data.success === "1"){
		  	defer.resolve(data.result);
		  }
		});
		return defer.promise();
	}

	function renderHighCharts(cityName, data, year, month, date){
		Highcharts.chart('container', {

		    title: {
		        text: 'AQI of last 7 days'
		    },

		    yAxis: {
		        title: {
		            text: 'AQI value'
		        }
		    },
		    xAxis: {
		        type: 'datetime',
		        dateTimeLabelFormats: {
		            day: '%b %e'
		        }
		    },

		    series: [{
		        name: cityName,
		        data: data,
		        pointStart: Date.UTC(year, month, date),
		        pointInterval: 24 * 3600 * 1000 
		    }]

		});
	}

	function init(){
		bindEvent();
		renderNavTree();
	}

	init();

});