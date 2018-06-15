$(function() {

	var isInline = setInterval(function() {
		ws.send('hello')
	}, 20000)
	
	let resDistance = 6000;

	let run = 0
	//浏览器宽度
	var screenWidth = $(window).width()
	console.log("screenWidth: " + screenWidth)

	//用于存储Socket
	var ws;

	//用于显示连接状态
	var $msgBord = $('#msgBord');

	//初始化Socket
	connectSocketServer($msgBord)

	

	var $boat = $('.dragonBoat').find('.container').find('ul')
	
	var arrTime = [0, 0, 0, 0, 0, 0, 0]
	
	function connectSocketServer($msgBord) {

		// 初始化一个 WebSocket 对象
		//		ws = new WebSocket("ws://192.168.1.111:10024/ws");
		ws = new WebSocket("ws://120.79.222.60:10024/ws");

		// 建立 web socket 连接成功触发事件

		ws.onopen = function() {

			// 使用 send() 方法发送数据
			ws.send('cmd:srceenAdd')

			$msgBord.text('*已连接')
		};

		// 接收服务端数据时触发事件
		ws.onmessage = function(evt) {
			var res = evt.data;
			if(res.indexOf('{"boats"') > -1) {
				//console.log(res)
				let Data = JSON.parse(res)
				console.log(Data)

				//初始化船
				initBoat(Data)

				//船的长度
				boatLength = $('.boat').width()

				//到终点的长度 
				var totalLength = screenWidth - (50 * screenWidth / 1438) - parseInt(boatLength);

				boatRun(Data)
				
				function boatRun(Data) {
					
					for(let i = 0; i < Data.boats.length; i++) {
						
						let runLength = []
						
						runLength[i] = Data.boats[i].distance * totalLength / resDistance

						$boat.find('li').eq(i).find('.boat').css('left', runLength[i])

						//到达终点
						if(runLength[i] >= totalLength) {
							
							$boat.find('li').eq(i).find('.boat').css('left', totalLength)
							console.log('arrNull：' + arrTime)
							if(parseInt(Data.boats[i].endTime) != 0) {
								
								console.log('进入')
								console.log(Data.boats[i].endTime)
								
								console.log('arrbef：' + arrTime)
//								alert(arrTime)
								var totalTime = parseInt(Data.boats[i].endTime) - parseInt(Data.boats[i].startTime) 
								var minute = 0,
									second = 0,
									ms = 0;
								second = parseInt(totalTime / 1000) % 60
								minute = parseInt(totalTime / 60000)
								ms= totalTime % 3600 % 1000

//								arrTime[i] = parseInt(Data.boats[i].endTime) - parseInt(Data.boats[i].startTime)
								arrTime[i] = totalTime
								
								console.log('arrEnd:' + arrTime)


								function dosome(list) {
									var result = [];
									for(let k = 0; k < list.length; k++) {

										var count = 1;
										for(let j = 0; j < list.length; j++) {
											if(k != j) {
												if(list[k] != 0 && list[j] != 0 && list[k] > list[j]) {
													count++;
												}
											}
										}
										if(list[k] == 0) {
											result[k] = 0;
										} else {
											result[k] = count;
										}
									}
									return result;
								}
								var resArr = dosome(arrTime);
								
								for (let res_i=0;res_i<resArr.length;res_i++) {
									if(resArr[res_i] != 0){
										
										$('.rank').eq(res_i).text('第'+ (resArr[res_i]) + '名')
									}
									
									
								}
								$('.suggest').eq(i).text('完成时间：' + minute + 'min' + second + 's' + ms + 'ms')

							}
						}
					}
				}
			}

		};

		// 断开 web socket 连接成功触发事件
		ws.onclose = function() {
			$msgBord.text('*连接已关闭')
		};
	}

	var audio = $("#audio")[0];

	//开始按钮
	$('#start').click(function() {
		audio.play();
		let _this = $(this)
		ws.send('cmd:srceenStartGame')
		console.log('开始')
		//获取船的总数
		let boatCount = $('.container').find('ul').find('li').length
		console.log('boatCount :' + boatCount)

		_this.attr("disabled", "disabled");
		_this.css('background-color', '#ccc')
		//		boatRun(Data)

		$('body,html').animate({
			scrollTop: 0
		}, 1000);

		return false;
	})

	//移除队伍
	$('#del').click(function() {
		var boatLengthDel = $boat.find('li').length
		if(boatLengthDel <= 1) {
			alert('水里最少1艘船！！！')
		} else {
			ws.send('cmd:srceenRemoveBoat')
			//$boat.find('li:last').remove()
		}
	})

	//增加队伍
	$('#add').click(function() {
		var boatLengthAdd = $boat.find('li').length
		if(boatLengthAdd >= 7) {
			alert('水里最多7艘船！！！')
		} else {
			ws.send('cmd:srceenAddBoat')
		}
	})

	//重置
	$('#reset').click(function() {
		arrTime = [0, 0, 0, 0, 0, 0, 0]
		audio.pause();
		ws.send('cmd:srceenResetGame')
		$('#start').removeAttr("disabled");
		$('#start').css('background-color', '#ca0c16')
		//		window.location.reload()
		$('body,html').animate({
			scrollTop: 0
		}, 1000);

		return false;
	})

	function initBoat(Data) {
		$boat.empty()

		for(let h in Data.boats) {
			let _difTime = ''
			if(Data.boats[h].difTime > 0) {
				_difTime = '慢了' + Data.boats[h].difTime + 'ms'
			} else if(Data.boats[h].difTime < 0) {
				_difTime = '快了' + -Data.boats[h].difTime + 'ms'
			} else if(Data.boats[h].difTime == 0) {
				_difTime = '参考时间'
			}
			$boat.append(`
				<li>
					<div class="boat">
						<img src="img/boat.png"/>
					</div>
					<div class="water">
						<img src="img/water.png"/>
						<div class="userImg">
							<span>第${parseInt(h)+1}组：</span>
							<span class="rank"></span>
							<span class="suggest">${_difTime}</span>
							
						</div>
					</div>
				</li>
			`)
			for(let m in Data.boats[h].players) {
				$('.userImg:last').append(
					`
						<img src="${Data.boats[h].players[m].url}"/>
					`
				)
			}
		}
	}

})