$(function() {
	// 初始化员工信息
	var staffs = [],
		staffList,
		prizeType;
		

	var body = $('body');
	var storage = $.localStorage;
	var winnerListKey = 'winner-list-storage';
	var winnerWrap = $('#J_winnerList');
	var oDiv = $('#div1');
	var preview = $('#J_preview');

	// 只中五等奖人员
	var stu = [];
	// 不中奖人员
	var del = [];


	var winnerList = storage.get(winnerListKey) != null ? storage.get(winnerListKey) : {0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

	var M, w, step, girth, radius;

	//初始化员工信息
	initStaffInfo();

	var num = 0;	// 旋转度数
	var start = 0;	// 旋转控制开关
	setInterval(function() {
		if (start) {
			num += step*1;
			oDiv[0].style.WebkitTransform = 'rotateX(-2deg) rotateY(' + num + 'deg)'
		}
	}, 10);

	// 开始 暂停
	$('#prize-btn').click(function() {
		var $this = $(this);
		prizeType = $('input:checked').val();
		if (prizeType == null){
			alert('请选择一个奖项!');
			return;
		}
		if (start) {
			start = 0;
			$this.html('开始');
			setTimeout(function() {
				getWinner();
			}, 100);
		} else {
			start = 1;
			$this.html('停止');
		}
	})

	// 切换奖项类型
	$('input[name="prizeType"]').change(function() {
		randomPrize(prizeType = $(this).val());
	})

	body.on('mouseenter', '#J_winnerList li', function(e) {
		var $this = $(this);
		$this.find('.icon-close').css({'visibility': 'visible'});
		var orignSrc = $this.find('img').attr('src').replace(/min/, 'orign');
		preview.find('img')[0].src = orignSrc;
		preview.show();
	}) 

	body.on('mouseleave', '#J_winnerList li', function(e) {
		var $this = $(this);
		$this.find('.icon-close').css({'visibility': 'hidden'});
		preview.hide();
	})

	body.on('click', '.icon-close', function(e) {
		var $this = $(this);
		var parent = $this.parent('li');
		var winName = parent.attr('data-name');
		preview.hide();
		winnerList = storage.get(winnerListKey);
		winnerList[prizeType] = _.without(winnerList[prizeType], winName);
		storage.set(winnerListKey, winnerList);
		randomPrize(prizeType);
		parent.remove();
	})


	// 初始化员工信息
	function initStaffInfo() {
		$.ajax({
			type: 'POST',
			url: '/staff',
			async: false,
			success: function(result) {
				if (!result) return;
				_.each(result, function(k) {
					var key = k.split('.')[0];
					staffs.push({
						name: key,
						avatar: '/assets/pic/min/' + k,
						orign: '/assets/pic/orign/' + k
					})
				})
				staffList = _.clone(staffs);
				// 页面显示photo
				initPrize(staffList);
			}
		})
	}

	// 获得获奖者
	function getWinner() {
		var els = oDiv.find('.hid');
		var deg = oDiv[0].style.WebkitTransform.match(/rotateY\((\d.*)deg\)/)[1];
		var idx = Math.abs((Math.round(deg % 360 / step)) - M);
		var winEl = $(els[idx]);

		addToWinnerList(prizeType, winEl.attr('data-name'));
		
		appendToWinList(winEl);

	}
	// 加入到中奖列表
	function appendToWinList (el) {
		var name,
			arr,
			orignPic,
			img,
			wrap = $('#J_winnerList'),
			target;

		name = el.attr('data-name');
		arr = _.filter(staffList, function(o) {
			return o.name == name;
		});

		orignPic = arr[0].orign;
		
		img = $('<img src="' + orignPic + '">').css({
			'position': 'absolute',
			'width': '38px',
			'height': '50px'
		}).offset({
			left: el.offset().left + 50,
			top: el.offset().top + 50
		}).appendTo(body).animate({
			'width': '250px',
			'height': '350px',
			'left': el.offset().left - 50,
			'top': el.offset().top - 50
		}, 1500);

		setTimeout(function() {

			target = $('<li data-name="' + name + '"><i class="icon-close"></i><div class="name">' + name + '</div></li>').appendTo(wrap);

			img.animate({
				"left": target.offset().left + "px",
				"top": target.offset().top + "px",
				"width": target.width() + 'px',
				"height": target.height() + 'px'
			}, 1000, function () {
				target.append(img);
				img.css({
					position: 'static'
				}).attr('src', arr[0].avatar);

				randomPrize(prizeType);
				
			});
		}, 2000);

	}

	// 加入到中奖者名单
	function addToWinnerList(prizeType, name) {
		if (prizeType == null || !name) return;
		winnerList[prizeType].push(name);
		winnerList[prizeType] = _.uniq(winnerList[prizeType]);
		// 把中奖列表缓存
		storage.set(winnerListKey, winnerList);
	}

	// 去掉已经获奖人员，避免再次获奖
	function randomPrize(prizeType) {
		var cancelList = [],
			list;

		if (prizeType == null) {
			alert('请选择一个奖项');
		}

		cancelList = cancelList.concat(del);

		if (prizeType != 1) {
			cancelList = cancelList.concat(stu);
		}
		
		// 去掉所有已中奖人员，防止重复中奖
		_.each(winnerList, function(o) {
			cancelList = cancelList.concat(o);
		})
		// 去重复
		cancelList = _.union(cancelList);
		list = _.clone(staffList);

		_.each(cancelList, function(o) {
			list = _.filter(list, function(k) {
				return k.name != o;
			})
		})

		showWinnerList(prizeType);

		initPrize(list);
	}

	// 初始化头像显示
	function initPrize(list) {
		
		oDiv.empty();

		var fragment = document.createDocumentFragment();
		
		M = list.length;
		w = 115;
		step = 360 / M;
		girth = M * w;
		radius = girth / (Math.PI * 2);
		i = 0;

		for(;i<M;i++) {
			var oNewDiv = $([
				'<div class="hid" data-name="'+ list[i].name +'">',
					'<div class="img" style="background: url('+ list[i].avatar +'); background-size: 100% 100%"></div>',
				'</div>'
			].join(''));

			(function (oNewDiv,i){
				setTimeout(function (){
					oNewDiv[0].style.WebkitTransform='rotateY('+(360*i/M)+'deg) translateZ(' + radius + 'px)';
				}, 50);
			})(oNewDiv,i);

			fragment.appendChild(oNewDiv[0]);
		}
		oDiv.append(fragment);
	}

	// 显示中奖者名单列表
	function showWinnerList (prizeType) {
		var storeList;

		if (prizeType == null || prizeType == '') { return };

		if (storeList = storage.get(winnerListKey)) {
			winnerList = storeList;
			var list = [];
			_.each(winnerList[prizeType], function(name) {
				var arr = _.filter(staffList, function(o) {
					return name == o.name
				})
				var html = [
					'<li data-name="' + name + '">',
						'<i class="icon-close"></i>',
						'<div class="name">' + name + '</div>',
						'<img src="' + arr[0].avatar + '"></li>',
					'</li>'
				].join('')
				list.push(html);
			})
			
			winnerWrap.empty().html(list.join(''));
		}
	}

	function getAbsOffset(element) {
		if(element == null) return null;
		var offsetTop = element.offsetTop;
		var offsetLeft = element.offsetLeft;
		while(element = element.offsetParent) {
			offsetTop += element.offsetTop;
			offsetLeft += element.offsetLeft;
		}
		var o = {};
		o.left = offsetLeft;
		o.top = offsetTop;
		return o;
	}
})	