function load_tool_tips(callback){
	data = {'type':'drug_key_list'};
	$.post('ajax.json',JSON.stringify(data),function(data){
		console.log(data);
		var key_list = data['data'];
		var tool_tips = {};
		for(key in key_list){
			var key_value = key_list[key];
			var key = key_value['keyname'];
			var value = key_value['value'];
			tool_tips[key]=value;
		}
		callback(tool_tips);
		
	}
}
function display_tool_tips(){
	load_tool_tips(function(tool_tips){
		for(key in tool_tips){
			line = "<tr class='tool_tip'><td class='key'>"+key+"</td><td class='value'>"+tool_tips[key]+"/td></tr>";
			
			
		}
		
	})
}