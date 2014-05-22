var admin = false;
$( document ).ready(function() {
	
	get_drug_list();
	$('#submit').click(function (){
		save_drug();
	});
	$('#delete').click(function(){
		delete_drug();
	})
});
