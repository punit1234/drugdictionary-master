var redirect = getRedirect();
$( document ).ready(function() {
	var username = $.cookie("username");
	var mod_hash = $.cookie("mod_hash");
	if(username&&
			username.length>0&&
			mod_hash&&
			mod_hash.length>0){
		login({'username':username});
	}
	$('#login').click(function(){
		var data = {
				username:$('#username').val(),
				password:$('#password').val()
		};
		login(data);
	});
	
});
function getArgs(){
	var args = window.location.search.substring(1);
	if(args){
		var arglist = args.split('&');
		var ret = {};
		for(var x = 0;x<arglist.length; x++){
			var a = arglist[x].split('=');
			if(a.length==2){
				ret[a[0]]=a[1];
			}
		}
		return ret;
	}
	return {};
}
function getRedirect(){
	var args = getArgs();
	if(args.redirect){
		return args.redirect;
	}
}
function login(data){
	var overlay = $('<div id="overlay"></div>');
	overlay.append($('<div class="overlay_text">loggin you in as '+data['username']+
			'<br><img src="spinningpill.gif" height="75px" width="75px">'+
			'</div>'));
	overlay.append($(''));
    $('body').append(overlay);
	data['type']='login';
	$.post('login.json',JSON.stringify(data),function(data){
		console.log(data);
		if(data.error){
			error(data.error);
			setCookie('mod_hash','');
		}else{
			setCookie('mod_hash',data.mod_hash,30);
			setCookie('username',data.username,30);
			$('#overlay').remove();
			if(!redirect){
				//redirect to main page
				window.location.replace('main.html');
			}else{
				window.location.replace(redirect);
			}
			
			
		}
		
	});
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function error(msg){
	$('#error_msg').html(msg);
}