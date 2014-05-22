$( document ).ready(function() {
	$('#register').click(function(){
		error('');
		//validate input
		if($('#username').val().length<4){
			error('username must be > 4 symbols');
			return;
		}else if(!IsEmail($('#email').val())){
			error('invalid email address');
			return;
		}else if($('#password').val().length<4){
			error('password must be > 4 symbols');
			return;
		}else if($('#password').val() != $('#password_confirmed').val()){
			error('passwords do not match');
			return;
		}else{
			var data = {
					username:$('#username').val(),
					password:$('#password').val(),
					email:$('#email').val()
			};
			register(data);
		}
	});
	
});

function IsEmail(email) {
	  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	  return regex.test(email);
}
function error(msg){
	$('#error_msg').html(msg);
}

function register(data){
	data['type']='register';
	$.post('login.json',JSON.stringify(data),function(data){
		if(data['type']=='error'){
			error(data['error']);
		}else{
			setCookie('mod_hash',data.mod_hash,30);
			setCookie('username',data.username,30);
			window.location.replace('/');	
		}
		
	});
}

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}