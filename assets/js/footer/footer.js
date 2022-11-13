$(document).ready(function () {
	$('table tr').click(function () {
		window.location = $(this).data('href');
		return false;
	});
});