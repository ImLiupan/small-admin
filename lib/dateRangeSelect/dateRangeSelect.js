function DateRangeSelect(input_id, options) {
	var defaults = {
		start_date: '', // 开始日期
		end_date: '', // 结束日期
		calendar_num: 3, // 展示的日历，最大是3 
		disable_gray_css: 'date_gray',
		date_today_css: "date_today",

		min_valid_date: '1997-01-01 00:00:00', //最小可用时间，控制日期选择器的可选力度
		max_valid_date: '', // 最大可用时间,优先于 stop_today_after
		stop_today_after: false, // 禁止选择今天之后的时间
    	stop_today: false, // 禁止选择今天
		disable_weekend: false, //周末不可选
		disable_weekend_day: [], //不可用的周日期设置数组，如：[1,3]是要周一， 周三 两天不可选，每个周的周一，周三都不可选择。
		disable_month_day: [], //不可用的日期设置数组，如:[1,3]是要1号，3号 两天不可选，特别的，[true,1,3]则反之，只有1，3可选，其余不可选。
		//回调函数，选择日期之后执行何种操作
		success: function(result) {
			// console.log(result)
		} 
	};

	var _this = this;

	this.input_id = input_id;
	// 配置参数
	this.opts = $.extend({}, defaults, options);
	// 默认日历数量参数最大是3
	this.opts.calendar_num = Math.min(this.opts.calendar_num, 3);

	// 随机ID后缀
	var suffix = new Date().getTime();

	// 主容器
	this.calendar_id = 'calendar_' + suffix;
	// 日期列表容器
	this.list_id = 'list_' + suffix;
	// 确认按钮
	this.submit_id = 'submit_' + suffix;
	// 关闭按钮
	this.close_id = 'close_' + suffix;
	// 选择上个月
	this.pre_month_id = 'pre_month_' + suffix;
	// 选择下个月
	this.next_month_id = 'next_month_' + suffix;
	// 选择上一年
	this.pre_year_id = 'pre_year_' + suffix;
	// 选择下一年
	this.next_year_id = 'next_year_' + suffix;
	// 错误提示
	this.error_msg_id = 'error_msg_' + suffix;
	// 当前日期数组
	this.cur_date_arr = [];

	// 组件中的开始、结束表单id
	this.start_date_id = 'start_date_' + suffix;
	this.end_date_id = 'end_date_' + suffix;

	this.valid = {
		start: true,
		end: true
	};

// 处理 初始日期值
	var val = $('#' + input_id).val();
	if (!this.opts.start_date && !this.opts.end_date && val) {
		var arr = val.split(' 至 ');
		if (this.isNotDate(arr[0]) && this.isNotDate(arr[1])) {
			arr.sort(function(i, j) {
				return (new Date(i) - new Date(j))
			});
			this.opts.start_date = arr[0];
			this.opts.end_date = arr[1];
			$('#' + input_id).val(this.opts.start_date + ' 至 ' + this.opts.end_date);
		}
	}else if(this.opts.start_date || this.opts.end_date){
		if (this.isNotDate(this.opts.start_date) && !this.isNotDate(this.opts.end_date)) {
			this.opts.end_date = this.opts.start_date;
			$('#' + input_id).val(this.opts.start_date + ' 至 ' + this.opts.start_date);
		}else if(!this.isNotDate(this.opts.start_date) && this.isNotDate(this.opts.end_date)){
			this.opts.start_date = this.opts.end_date;
			$('#' + input_id).val(this.opts.end_date + ' 至 ' + this.opts.end_date);
		}else if(this.isNotDate(this.opts.start_date) && this.isNotDate(this.opts.end_date)){
			$('#' + input_id).val(this.opts.start_date + ' 至 ' + this.opts.end_date);
		}
	}else if(this.opts.is_compare_date){
		this.opts.start_date = '2017-10-27'
		this.opts.end_date = '2017-10-30'
		$('#' + input_id).val(this.opts.start_date + ' 至 ' + this.opts.end_date);
	}


	// 开始。结束时间
	this.start_date = this.opts.start_date;
	this.end_date = this.opts.end_date;

	// 初始化日期选择器面板的HTML代码串
	var warpper = [
		'<div id="' + this.calendar_id + '" class="drs_calendar">',
		'<div class="drs_calendar_header clearfix">',
		'<div class="drs_left_calendar_cont" id="' + this.pre_year_id + '"></div>',
		'<div class="drs_right_calendar_cont" id="' + this.next_year_id + '"></div>',
		'<div class="drs_calendar_cont" id="' + this.list_id + '"></div>',
		'</div>',
		'<div class="drs_calendar_footer clearfix">',
		'<div class="drs_date_range">',
		'<input type="text" value="" id="' + this.start_date_id + '" placeholder="开始日期" class="drs_date_start" maxlength="10">',
		'<span> - </span>',
		'<input type="text" value="" id="' + this.end_date_id + '" placeholder="结束日期" class="drs_date_end" maxlength="10">',
		'</div>',
		'<div class="drs_select_tip" id="' + this.error_msg_id + '"></div>',
		'<div class="drs_date_change">',
		'<input type="button" value="确定" id="' + this.submit_id + '" class="drs_btn drs_btn_xa">',
		'&nbsp;&nbsp;&nbsp;',
		'<input type="button" value="取消" id="' + this.close_id + '" class="drs_btn">',
		'</div>',
		'</div>',
		'</div>'
	];
	$('body').append(warpper.join(''));
	this.init();
}
DateRangeSelect.prototype.init = function() {
	var _this = this;
	$('#' + this.input_id)
		// .focus(function() {
		// 	this.blur();
		// })
		.off('click.drs').on('click.drs', function(event) {
			event.stopPropagation();
			_this.show(false);
		});
	$('#' + this.calendar_id).off('click.drs').on('click.drs', function(event) {
		event.stopPropagation();
	});
	$(document).off('click.drs').on('click.drs', function() {
		_this.hide();
	});
	// 确定
	$('#' + this.submit_id).off('click.drs').on('click.drs', function() {
		_this.start_date = _this.opts.start_date;
		_this.end_date = _this.opts.end_date;
		_this.changeInput(1);
		_this.hide();
		var obj = {
			start_date: _this.start_date,
			end_date: _this.end_date
		}
		$('#' + _this.input_id).val(obj.start_date + ' 至 ' + obj.end_date);
		_this.opts.success && _this.opts.success(obj);
	});
	// 取消
	$('#' + this.close_id).off('click.drs').on('click.drs', function() {
		_this.hide();
	});
	// 上年
	$('#' + this.pre_year_id).off('click.drs').on('click.drs', function() {
		_this.createDate('prevYear');
	});
	// 下年
	$('#' + this.next_year_id).off('click.drs').on('click.drs', function() {
		_this.createDate('nextYear');
	});
	// 开始时间 输入框时间监听
	$('#' + this.start_date_id).off('change.drs').on('input.drs', function() {
		var val = $(this).val();
		if (val.length >= 10) {
			_this.validValue();
		}else if(!$('#' + this.end_date_id).val()){
			_this.validValue();
		}
	});
	$('#' + this.start_date_id).off('blur.drs').on('blur.drs', function() {

		_this.validValue();
	});
	// 结束时间 输入框时间监听
	$('#' + this.end_date_id).off('change.drs').on('input.drs', function() {
		var val = $(this).val();
		if (val.length >= 10) {
			_this.validValue();
		}else if(!$('#' + this.start_date_id).val()){
			_this.validValue();

		}
	});
	$('#' + this.end_date_id).off('blur.drs').on('blur.drs', function() {

		_this.validValue();
	});
};
// 验证输入框
DateRangeSelect.prototype.validValue = function() {
	var $start_date = $('#' + this.start_date_id),
		$end_date = $('#' + this.end_date_id);

	var start_val = $start_date.val(),
		end_val = $end_date.val();

	if (!this.isNotDate(start_val) && end_val) {
		this.valid.start = false;
		this.showError($start_date, '开始日期输入有误，日期格式yyyy-MM-dd。');
		return false;
	}
	if (!this.isNotDate(end_val) && start_val) {
		this.valid.end = false;
		this.showError($end_date, '结束日期输入有误，日期格式yyyy-MM-dd。');
		return false;
	}
	if (new Date(end_val + ' 00:00:00') < new Date(start_val + ' 00:00:00')) {
		this.valid.end = false;
		this.showError($end_date, '结束日期不能小于开始日期！');
		return false;
	}
	// 限制。最小可用时间
	if (this.opts.min_valid_date) {
		if (new Date(start_val + ' 00:00:00') < new Date(this.opts.min_valid_date)) {
			this.valid.start = false;
			this.showError($start_date, '选择的开始日期不在可选范围内！');
			return false;
		}
	}
	// 限制。禁止选择今天
	if (this.opts.stop_today) {
		var now = new Date();
		var format_now = this.format(now);
		if (this.format(start_val) == format_now ) {
			this.valid.end = false;
			this.showError($end_date, '开始日期输入有误，不可选择今天！');
			return false;
		}
		if (this.format(end_val) == format_now ) {
			this.valid.end = false;
			this.showError($end_date, '结束日期输入有误，不可选择今天！');
			return false;
		}
	}
	// 限制。禁止选择今天之后的时间
	if (!this.opts.max_valid_date && this.opts.stop_today_after) {
		var now = new Date();
		if (new Date(end_val + ' 00:00:00') > new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
			this.valid.end = false;
			this.showError($end_date, '选择的结束日期不在可选范围内！');
			return false;
		}
	}
	// 限制。最大可用时间
	if (this.opts.max_valid_date) {

		if (new Date(end_val + ' 00:00:00') > new Date(this.opts.max_valid_date)) {
			this.valid.end = false;
			this.showError($end_date, '选择的结束日期不在可选范围内！');
			return false;
		}
	}

	var new_start_date = new Date(start_val + ' 00:00:00'),
		new_end_date = new Date(end_val + ' 00:00:00');

	var start_week = new_start_date.getDay(),
		end_week = new_end_date.getDay();


	// 限制。周末不可选
	if (this.opts.disable_weekend) {


		if (start_week === 6 || start_week === 0) {
			this.valid.start = false;
			this.showError($start_date, '开始日期输入有误，周末不可选。');
			return false;
		}
		if (end_week === 6 || end_week === 0) {
			this.valid.end = false;
			this.showError($end_date, '结束日期输入有误，周末不可选。');
			return false;
		}
	}

	var start_day = new_start_date.getDate(),
		end_day = new_end_date.getDate();


	// 限制。日期不可选
	if (this.opts.disable_month_day && this.opts.disable_month_day.length !== 0) {
		for (var p in this.opts.disable_month_day) {
			if (start_day === this.opts.disable_month_day[p]) {
				this.valid.start = false;
				this.showError($start_date, '开始日期输入有误，每月' + start_day + '号不可选');
				return false;
			}
			if (end_day === this.opts.disable_month_day[p]) {
				this.valid.end = false;
				this.showError($end_date, '结束日期输入有误，每月' + end_day + '号不可选');
				return false;
			}
		}
	}

	var start_week_day = new_start_date.getDay(),
		end_week_day = new_end_date.getDay();

	// 限制。周日期不可选
	if (this.opts.disable_weekend_day && this.opts.disable_weekend_day.length !== 0) {
		var week = ['日', '一', '二', '三', '四', '五', '六'];
		for (var p in this.opts.disable_weekend_day) {
			if (start_week_day === this.opts.disable_weekend_day[p]) {
				this.valid.start = false;
				this.showError($start_date, '开始日期输入有误，周' + week[start_week_day] + '不可选');
				return false;
			}
			if (end_week_day === this.opts.disable_weekend_day[p]) {
				this.valid.end = false;
				this.showError($end_date, '结束日期输入有误，周' + week[end_week_day] + '不可选');
				return false;
			}
		}
	}

	this.hideError('reset');
	this.opts.start_date = start_val;
	this.opts.end_date = end_val;
	this.changeInput(0);
};
// 控制显示
DateRangeSelect.prototype.show = function() {
	var _this = this;
	$('.drs_calendar').hide();
	// 计算位置
	var pos = $('#' + this.input_id).offset();
	var offsetHeight = $('#' + this.input_id).height();
	var clientWidth = parseInt($(document.body)[0].clientWidth);
	var left = pos.left;
	$("#" + this.calendar_id).css('display', 'block');
	// 如果和输入框左对齐时超出了宽度范围，则右对齐
	if (clientWidth > 0 && $("#" + this.calendar_id).width() + pos.left > clientWidth) {
		left = pos.left + $('#' + this.input_id).width() - $("#" + this.calendar_id).width() + ((/msie/i.test(navigator.userAgent) && !(/opera/i.test(navigator.userAgent))) ? 5 : 0);
		left += 16;
	}
	if (left < 0) left = 0;
	$("#" + this.calendar_id)
		.css('left', left + 'px')
		.css('top', pos.top + 35 + 'px');
	// 生成日期
	this.createDate();
	// 改变值
	this.changeInput(1);
};
// 控制隐藏
DateRangeSelect.prototype.hide = function() {

	$("#" + this.calendar_id).css('display', 'none');
};
// 显示错误提示
DateRangeSelect.prototype.showError = function(event, text) {
	$(event).addClass('border-error');
	$('#' + this.error_msg_id).html(text).show();
	$('#' + this.submit_id).prop('disabled', true).addClass('disabled');
};
// 隐藏错误提示
DateRangeSelect.prototype.hideError = function(event) {
	var $start_date_id = $('#' + this.start_date_id),
		$end_date_id = $('#' + this.end_date_id);

	if (event === 'reset') {
		this.valid.start = this.valid.end = true;
		$('#' + this.error_msg_id).hide();
		$start_date_id.removeClass('border-error');
		$end_date_id.removeClass('border-error');
		$('#' + this.submit_id).prop('disabled', false).removeClass('disabled');
	} else {
		$(event).removeClass('border-error');
		if (this.valid.start && this.valid.end) {
			$('#' + this.error_msg_id).hide();
			$('#' + this.submit_id).prop('disabled', false).removeClass('disabled');
			this.opts.start_date = $start_date_id.val();
			this.opts.end_date = $end_date_id.val();
			this.changeInput(0);
		}
	}
};
// 根据不同指令 生成日期
DateRangeSelect.prototype.createDate = function(type) {
	var _this = this;
	$('#' + this.list_id).empty();
	switch (type) {
		case 'prev':
			$.each(_this.cur_date_arr, function(index, item) {
				item.month = item.month - 1;
				if (item.month < 0) {
					item.month = 11;
					item.year--;
				}
				_this.drawDate(item.year, item.month, index + 1)
			});
			break;
		case 'next':
			$.each(_this.cur_date_arr, function(index, item) {
				item.month = item.month + 1;
				if (item.month > 11) {
					item.month = 0;
					item.year++;
				}
				_this.drawDate(item.year, item.month, index + 1)
			});
			break;
		case 'prevYear':
			$.each(_this.cur_date_arr, function(index, item) {
				item.year = item.year - 1;
				_this.drawDate(item.year, item.month, index + 1)
			});
			break;
		case 'nextYear':
			$.each(_this.cur_date_arr, function(index, item) {
				item.year = item.year + 1;
				_this.drawDate(item.year, item.month, index + 1)
			});
			break;
		default:
			var start_date = this.start_date ? this.start_date : this.format(new Date());


			var index = new Date(start_date).getMonth() + 1;
			if (index > 3) {
				index = index % 3;
				if (index === 0) index = 3;
			}
			if (this.opts.calendar_num === 3) {
				_this.cur_date_arr = [];
				switch (index) {
					case 1:
						// 加上后面两个月的
						var now = new Date(start_date);
						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})

						now.setMonth(now.getMonth() + 1);

						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})

						now.setMonth(now.getMonth() + 1);

						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})
						break;
					case 2:
						// 前面一个月 后面一个月
						var now = new Date(start_date);
						now.setMonth(now.getMonth() - 1);
						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})

						now.setMonth(now.getMonth() + 1);

						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})

						now.setMonth(now.getMonth() + 1);

						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})
						break;
					case 3:
						// 前面两个月
						var now = new Date(start_date);
						now.setMonth(now.getMonth() - 2);
						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})

						now.setMonth(now.getMonth() + 1);

						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})

						now.setMonth(now.getMonth() + 1);

						_this.cur_date_arr.push({
							year: now.getFullYear(),
							month: now.getMonth()
						})
				}
			}
			$.each(_this.cur_date_arr, function(index, item) {
				_this.drawDate(item.year, item.month, index + 1)
			});
	}
};
// 添加class
DateRangeSelect.prototype.addClass = function() {
	var _this = this;
	var start_date = this.opts.start_date;
	var end_date = this.opts.end_date;
	var res = this.getAllDate(start_date, end_date);
	$('#' + _this.list_id).find('td.selected').removeClass('start end selected');
	$.each(res, function(index, val) {
		if (index === 0) {
			$('#' + _this.calendar_id + '_' + val).addClass('start');
		} else if (index === res.length - 1) {
			$('#' + _this.calendar_id + '_' + val).addClass('end');
		}
		$('#' + _this.calendar_id + '_' + val).addClass('selected');
	});
};
// 日期绘制
DateRangeSelect.prototype.drawDate = function(year, month, index) {
	var _this = this;
	var dateStart = new Date(year, month, 1);
	// 计算应该开始的日期
	dateStart.setDate(1 - dateStart.getDay());

	// 当月最后一天
	var dateEnd = new Date(year, month + 1, 0);
	// 计算应该结束的日期
	dateEnd.setDate(dateEnd.getDate() + 6 - dateEnd.getDay());

	var today = new Date();
	var dToday = today.getDate(),
		mToday = today.getMonth(),
		yToday = today.getFullYear();
	table = document.createElement('table'),
		cap = document.createElement('caption'),
		thead = document.createElement('thead'),
		tr = document.createElement('tr'),
		td = '';

	$(cap).append((year) + '年' + (month + 1) + '月');
	$(table).append(cap);
	var days = ['日', '一', '二', '三', '四', '五', '六'];
	for (var i = 0, th = ''; i < 7; i++) {
		th = document.createElement('th');
		$(th).append(days[i]);
		$(tr).append(th);
	}
	$(thead).append(tr);
	$(table).append(thead);

	tr = document.createElement('tr');
	td = document.createElement('td');

	// 如果是第一个月的日期，则加上上一个月的链接
	if (index === 1) {
		$(td).append('<a href="javascript:void(0);" id="' + this.pre_month_id + '"><i class="i_pre"></i></a>');
	}
	// 如果是最后一个月的日期，则加上下一个月的链接
	if (index === this.opts.calendar_num) {
		$(td).append('<a href="javascript:void(0);" id="' + this.next_month_id + '"><i class="i_next"></i></a>');
	}
	$(td).attr('col-span', 7)
		.css('text-align', 'center');
	$(tr).append(td);
	$(table).append(tr);

	var tdClass = '',
		deviation = 0,
		firstDay = new Date(year, month, 1),
		endDay = new Date(year, month + 1, 0),
		ymd = '';
	for (; dateStart.getTime() <= dateEnd.getTime(); dateStart.setDate(dateStart.getDate() + 1)) {

		// 禁止选择今日之后的日期
		if (!this.opts.max_valid_date && this.opts.stop_today_after && dateStart > today) {
			tdClass = this.opts.disable_gray_css;
			deviation = '-2';
		} else if (dateStart.getTime() < firstDay.getTime()) {
			// 当前月之前的日期
			tdClass = this.opts.disable_gray_css;
			deviation = '-1';
		} else if (dateStart.getTime() > endDay.getTime()) {
			// 当前月之后的日期
			tdClass = this.opts.disable_gray_css;
			deviation = '1';
		} else {
			deviation = '0';
			if (dateStart.getDate() == dToday && dateStart.getMonth() == mToday && dateStart.getFullYear() == yToday) {
				tdClass = this.opts.date_today_css;
			} else {
				tdClass = '';
			}
      //让今天不可选
			if (this.opts.stop_today) {
				if(this.format(dateStart) === this.format(new Date())){
					tdClass = this.opts.disable_gray_css;
					deviation = '2';
				}
			}
			//让周末不可选
			if (this.opts.disable_weekend && (dateStart.getDay() == 6 || dateStart.getDay() == 0)) {
				tdClass = this.opts.disable_gray_css;
				deviation = '3';
			}
			//让周几不可选
			if (this.opts.disable_weekend_day && this.opts.disable_weekend_day.length > 0) {
				for (var p in this.opts.disable_weekend_day) {
					if (!isNaN(this.opts.disable_weekend_day[p]) && dateStart.getDay() === this.opts.disable_weekend_day[p]) {
						tdClass = this.opts.disable_gray_css;
						deviation = '4';
					}
				}
			}
			//让几号不可选
			if (this.opts.disable_month_day && this.opts.disable_month_day.length > 0) {
				var is_disabled = false;
				for (var p in this.opts.disable_month_day) {
					if (!isNaN(this.opts.disable_month_day[p]) || isNaN(parseInt(this.opts.disable_month_day[p]))) {
						if (this.opts.disable_month_day[0] === true) {
							is_disabled = !!(dateStart.getDate() !== this.opts.disable_month_day[p]);
							if (!is_disabled) {
								break;
							}
						} else {
							is_disabled = !!(dateStart.getDate() === this.opts.disable_month_day[p]);
							if (is_disabled) {
								break;
							}
						}
					}
				}
				if (is_disabled) {
					tdClass = this.opts.disable_gray_css;
					deviation = '4';
				}
			}


			// 限制 最大 最小选择范围
			if (this.opts.min_valid_date) {

				if (new Date(this.opts.min_valid_date) > dateStart) {
					tdClass = this.opts.disable_gray_css;
					deviation = '5';
				}
			}
			if (this.opts.max_valid_date) {
				if (new Date(this.opts.max_valid_date) < dateStart) {
					tdClass = this.opts.disable_gray_css;
					deviation = '6';
				}
			}
		}

		// 如果是周日
		if (dateStart.getDay() == 0) {
			tr = document.createElement('tr');
		}

		td = document.createElement('td');
		td.innerHTML = '<div class="drs_content">' + dateStart.getDate() + '</div>';
		if (tdClass) $(td).attr('class', tdClass);
		// 只有当前月可以点击
		if (deviation == 0) {
			ymd = dateStart.getFullYear() + '-' + (dateStart.getMonth() + 1) + '-' + dateStart.getDate();
			ymd = _this.format(ymd);
			$(td).attr('id', _this.calendar_id + '_' + ymd);
		}

		$(tr).append(td);

		// 如果是周六
		if (dateStart.getDay() == 6) {
			$(table).append(tr);
		}
	}
	$('#' + this.list_id).append(table);

	this.drawDateCallback();
};
// 日期重绘后的回调
DateRangeSelect.prototype.drawDateCallback = function() {
	var _this = this;
	// 上个月
	$('#' + this.pre_month_id).off('click.drs').on('click.drs', function() {
		_this.createDate('prev');
	});
	// 下个月
	$('#' + this.next_month_id).off('click.drs').on('click.drs', function() {
		_this.createDate('next');
	});

	$('#' + this.list_id).off('click.drs').on('click.drs', '[id^=' + this.calendar_id + ']', function() {
		var now_date = $(this).attr('id').slice(-10);
		var start_date = _this.opts.start_date;
		var end_date = _this.opts.end_date;
		if (start_date && end_date && start_date !== end_date) {
			_this.opts.start_date = now_date;
			_this.opts.end_date = now_date;
		} else if (!start_date || !end_date) {
			_this.opts.start_date = now_date;
			_this.opts.end_date = now_date;
		} else if (now_date > start_date) {
			_this.opts.end_date = now_date;
		} else if (now_date < start_date) {
			_this.opts.end_date = _this.opts.start_date;
			_this.opts.start_date = now_date;
		}
		_this.hideError('reset');
		_this.changeInput(0);
	});
	this.addClass();
}
// 改变选择的日期
DateRangeSelect.prototype.changeInput = function(type) {
	if (type) {
		$('#' + this.start_date_id).val(this.start_date);
		$('#' + this.end_date_id).val(this.end_date);
		this.opts.start_date = this.start_date;
		this.opts.end_date = this.end_date;
		this.hideError('reset');
	} else {
		$('#' + this.start_date_id).val(this.opts.start_date);
		$('#' + this.end_date_id).val(this.opts.end_date);
	}
	this.addClass();
};
// 获取日期范围内的 所有日期
DateRangeSelect.prototype.getAllDate = function(begin, end) {
	var ab = begin.split("-");
	var ae = end.split("-");
	var db = new Date();
	db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
	var de = new Date();
	de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
	var unixDb = db.getTime();
	var unixDe = de.getTime();
	var res = [];
	for (var k = unixDb; k <= unixDe;) {
		var date = new Date(parseInt(k));
		date = this.format(date);
		res.push(date)
		k = k + 24 * 60 * 60 * 1000;
	}
	return res;
};
// 日期格式化
DateRangeSelect.prototype.format = function(ymd) {
	var now = new Date(ymd);
	var s = '';
	var mouth = (now.getMonth() + 1) >= 10 ? (now.getMonth() + 1) : ('0' + (now.getMonth() + 1));
	var day = now.getDate() >= 10 ? now.getDate() : ('0' + now.getDate());
	s += now.getFullYear() + '-'; // 获取年份。  
	s += mouth + "-"; // 获取月份。  
	s += day; // 获取日。  
	return (s); // 返回日期。  
};
// 验证日期 yyyy-mm-dd
DateRangeSelect.prototype.isNotDate = function(date) {
	var reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-])(10|12|0[13578])([-])(3[01]|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-])(11|0[469])([-])(30|[12][0-9]|0[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-])(02)([-])(2[0-8]|1[0-9]|0[1-9])$)|(^([2468][048]00)([-])(02)([-])(29)$)|(^([3579][26]00)([-])(02)([-])(29)$)|(^([1][89][0][48])([-])(02)([-])(29)$)|(^([2-9][0-9][0][48])([-])(02)([-])(29)$)|(^([1][89][2468][048])([-])(02)([-])(29)$)|(^([2-9][0-9][2468][048])([-])(02)([-])(29)$)|(^([1][89][13579][26])([-])(02)([-])(29)$)|(^([2-9][0-9][13579][26])([-])(02)([-])(29)$))/ig;
	if (!reg.test(date)) {
		return false;
	}
	return true;
};