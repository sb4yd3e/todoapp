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
	});
	$(document).on('click','#formAddList .btn-default',function(){
		$('.createList').show();
		$('#formAddList').hide();
	});

	$(document).on('click','.createCard',function(event){
		if($('.formAddCard').is(':visible')){
			$('.formAddCard').hide();
		}
		$('.createCard').show();
		$(this).hide();
		$(this).parent().find('.formAddCard').show();
		$(this).parent().find('.formAddCard input').focus();
	});
	$(document).on('click','.formAddCard .btn-default',function(event){
		$('.formAddCard').hide();
		$('.createCard').show();
	});
	$(document).mouseup(function (e)
	{
		var container = $(".formAddCard");
		if (!container.is(e.target) 
			&& container.has(e.target).length === 0)
		{
			$('.formAddCard').hide();
			$('.createCard').show();
		}
	});
});
function getIndexOf(n,f,r){var t=0,c=!1;return n.forEach(function(n){n[f]&&n[f]===r?c=!0:0==c&&t++}),c===!0?t:-1}
