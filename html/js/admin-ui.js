var mod_hash = false;
var username;
var email;
var main_content;
var admin_drugs;
var menu_content;
$( document ).ready(function() {
	checkCreds();
	main_content=$("#admin_content");
	menu_content=$("#menu");
	admin_drugs_content=$("#drug_content")
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
			} else {
				window.location.replace('/unauthorized.html');
			}
		}else if(data.group!='admin'){
			window.location.replace('/main.html');
		}else{
			$('#greating').html('logged in as '+data['username'])
			username = data['username'];
			email = data['email']
			setupLinks();
		}
		
	});
}

function setupLinks(){
	$("#drug_admin").on("click", function() {
		$('.main .menu_item').removeClass('menu_item_selected');
		$('.main .menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
		$('#sub_menu').empty();
		var edit_drugs = $("<div class='menu_item' id='drug_edit'>edit drugs</div>");
		var td = $('<td></td>');
		td.append(edit_drugs);
		$('#sub_menu').append(td);
		var edit_keys = $("<div class='menu_item' id='drug_keys'>edit drug keys</div>");
		var td = $('<td></td>');
		td.append(edit_keys);
		$('#sub_menu').append(td);

		edit_drugs.on("click",function(){
			$('.sub .menu_item').removeClass('menu_item_selected');
			$('.sub .menu_item').addClass('menu_item_unselected');
			$(this).removeClass('menu_item_unselected');
			$(this).addClass('menu_item_selected');
			main_content.load("DrugLineEdit.html",
	        		function() {
				nicEditors.allTextAreas();
	        	edit = true;
	        	admin = true;
	        	get_drug_list();
	        	$('button#submit').click(function (){
	        		save_drug();
	        	});
	        	$('#delete').click(function(){
	        		delete_drug();
	        	});
	        	$('#new_drug').click(function(){
	        		new_drug();
	        	});
			});
		});
		edit_keys.on('click',function(){
			$('.sub .menu_item').removeClass('menu_item_selected');
			$('.sub .menu_item').addClass('menu_item_unselected');
			$(this).removeClass('menu_item_unselected');
			$(this).addClass('menu_item_selected');
			
			//load edit keys
			main_content.load("DrugKey.html",
	        		function() {

	        });
		});
		edit_drugs.click();
    	
    
        
    });
	$("#user_admin").on("click", function() {
		$('#sub_menu').empty();
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
		
		main_content.load("users.html",
        		function() {
        	edit = true;
        	admin = true;
        	loadUsers();
        });
	});
	$('#logout').on('click',function(){
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
		logout();
	});
	$("#drug_view").on("click", function() {
		$('#sub_menu').empty();
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
		main_content.load("DrugLine.html",
        		function() {
        	edit = false;
        	admin = false;
        	//get_drug_list();
        });
	});
	$("#settings").on("click", function() {
		$('#sub_menu').empty();
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$(this).removeClass('menu_item_unselected');
		$(this).addClass('menu_item_selected');
		main_content.load("settings.html",
        		function() {
        	$('#username').html(username);
        	$('#email').html(email);
        });
	});
	$("#drug_view").click();
	/*
	main_content.load("DrugLine.html",
    		function() {
		$('.menu_item').removeClass('menu_item_selected');
		$('.menu_item').addClass('menu_item_unselected');
		$('#drug_view').removeClass('menu_item_unselected');
		$('#drug_view').addClass('menu_item_selected');
    	edit = false;
    	admin = false;
    });
    */
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