var mod_hash = false;
var username;
var email;
$( document ).ready(function() {
	checkCreds();
});


function checkCreds(){
	data = {};
	data['type']='get_info';
	$.post('login.json',JSON.stringify(data),function(data){
		console.log(data);
		if(data.type=='error'){
			if(data.error=='must login first'||
					data.error=='username/password invalid'){
				setCookie('mod_hash','');
				setCookie('username','');
				//redirect to login page
				var path = window.location.pathname;
				window.location.replace('/?redirect='+path);
			} 
		}else if(data.group=='admin'){
			window.location.replace('/admin.html');
		}else{
			$('#greating').html('logged in as '+data['username'])
			username = data['username'];
			email = data['email']
			setupLinks();
		}
		
	});
}

function setupLinks(){
	$('#logout').on('click',function(){
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
		logout();
	});
	$("#drug_view").on("click", function() {
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
        $("#content").load("DrugLine.html",
        		function() {
        	edit = false;
        	admin = false;
        	//get_drug_list();
        });
	});
	$("#settings").on("click", function() {
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
        $("#content").load("settings.html",
        		function() {
        	$('#username').html(username);
        	$('#email').html(email);
        });
	});
	$("#content").load("DrugLine.html",
    		function() {
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$('#drug_view').removeClass('menu_item_unselected');
		$('#drug_view').addClass('menu_item_selected');
    	edit = false;
    	admin = false;
    });
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function logout(){
	setCookie('mod_hash','');
	setCookie('username','');
	//redirect to login page
	var path = window.location.pathname;
	window.location.replace('/?redirect='+path);
}