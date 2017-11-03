$(document).ready(function() {
	$('.triggerMenu').on('click', function() {
		$(document.body).toggleClass('hide-menu');
		if ($('body').hasClass('hide-menu')) {
			$('.menu').find('.has-sub').removeClass('open');
		}
	});

	$('.table').on('click', '.order', function() {
		// 从1开始
		var index = $(this).index();
		var cls = $(this).attr('class');
		switch (cls) {
			case 'order':
				cls = '';
				break;
			case 'order order-asc':
				cls = 'asc';
				break;
			case 'order order-desc':
				cls = 'desc';
				break;
		}
		var $form = $('#screen-form');
		$form.find('[name="order"]').val(cls);
		$form.find('[name="order_column"]').val(index);
		$form.submit();
	});

	$('.menu').on('click', '.has-sub', function() {
		$(this).toggleClass('open').siblings('.has-sub').removeClass('open');
		$(document.body).removeClass('hide-menu');
	});
});

