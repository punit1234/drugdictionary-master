$( document ).ready(function() {
	
	$('#update_password').click(function(){
		error('');
		//validate input
		if($('#password').val().length<4){
			error('password must be > 4 symbols');
			return;
		}else if($('#password').val() != $('#password_confirmed').val()){
			error('passwords do not match');
			return;
		}else{
			var data = {
					username:username,
					password:$('#current_password').val(),
					new_password:$('#password').val(),
			};
			changePassword(data);
		}
	});
	
});

function error(msg){
	$('#error_msg').html(msg);
}

function changePassword(data){
	data['type']='change_password';
	$.post('login.json',JSON.stringify(data),function(data){
		console.log(data);
		if(data.type=='error'){
			error(data.error);
		}else{
			
			setCookie('username',data.username,30);
			setCookie('mod_hash',data.mod_hash,30);
			alert('password updated');
			
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