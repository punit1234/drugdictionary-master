$( document ).ready(function() {
    console.log( "ready!" );
	//TODO:
    //setup drop down selection options
	//load drugs from JSON
});

function loadUsers(){
	data = {'type':'user_list'};
	$.post('ajax.json',JSON.stringify(data),function(data){
		console.log(data);
		if(data.type=='error'){
			if(data.error=='must login first'){
				//redirect to login screen
			}else if(data.error=='not authorized'){
				//redirect somewhere safe
			}
		}else{
			user_list = data['data'];
			if(user_list.length==0){
				return;
			}else{
				$('#user_list').empty();
				for(var x = 0; x<user_list.length;x++){
					
					var u = user_list[x];
					var user = $('<td></td>').html(u.username);
					var email = $('<td></td>').html(u.email);
					var group = $('<select></select>');
					group.append($("<option></option>")
							.attr('value','view_all')
							.text('view_all'));
					group.append($("<option></option>")
							.attr('value','admin')
							.text('admin'));
					group.attr('user',u.username);
					group.val(u.group);
					group.change(function(e){
						var data ={
								'type':'change_group',
								'user':$(this).attr('user'),
								'group':$(this).val()};
						$.post('login.json',JSON.stringify(data),function(data){
							if(data.type=='error'){
								alert(data.error);
							}else if(data.type=='group changed'){
								alert(data.user+" new group is "+data.group);
							}

						});
					});
					var resetpassword = $('<button></button>');
					resetpassword.text('reset password');
					resetpassword.attr('user',u.username);
					resetpassword.on('click',function(){
						var data ={
								'type':'reset_password',
								'user':$(this).attr('user')};
						$.post('login.json',JSON.stringify(data),function(data){
							if(data.type=='error'){
								alert(data.error);
							}else if(data.type=='password reset'){
								alert(data.user+" new password is "+data.password);
							}

						});
					});
					var del = $('<button></button>');
					del.text('delete');
					del.attr('user',u.username);
					del.on('click',function(){
						var data ={
								'type':'delete_user',
								'user':$(this).attr('user')};
						$.post('login.json',JSON.stringify(data),function(data){
							if(data.type=='error'){
								alert(data.error);
							}else if(data.type=='user deleted'){
								setTimeout(function(){
									loadUsers();
							    }, 1000);
								alert(data.user+" deleted ");
							}
						
						});
					});
					var newRow = $('<tr></tr>');
					newRow.append(user);
					newRow.append(email);
					newRow.append(group);
					newRow.append($('<td></td>').append(resetpassword));
					newRow.append($('<td></td>').append(del));
					
					$('#user_list').append(newRow);
				}
			}
		}
	});
}