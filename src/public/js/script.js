jQuery( document ).ready(function( $ ) {
	$(document).on('click','#boardname',function(){
		$(this).hide();
		$('#formBoard').show();
		return false;
	});
	$(document).on('click','#formBoard button',function(){
		$('#formBoard').hide();
		$('#boardname').show();

	});

	$(document).on('click','.createList',function(){
		$(this).hide();
		$('#formAddList').show();
		$('#formAddList input').focus();
	});
	$(document).on('click','#formAddList .btn-default',function(){
		$('.createList').show();
		$('#formAddList').hide();
	});
});

