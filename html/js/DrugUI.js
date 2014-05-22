$( document ).ready(function() {
    console.log( "ready!" );
	//TODO:
    //setup drop down selection options
	//load drugs from JSON
});


function setup_tooltips(){
	var targets = $( '[rel~=tooltip]' ),
    target  = false,
    tooltip = false,
    title   = false;

	targets.bind( 'mouseenter', function()
	{
	    target  = $( this );
	    tip     = target.attr( 'title' );
	    tooltip = $( '<div id="tooltip"></div>' );
	
	    if( !tip || tip == '' )
	        return false;
	
	    target.removeAttr( 'title' );
	    tooltip.css( 'opacity', 0 )
	           .html( tip )
	           .appendTo( 'body' );
	
	    var init_tooltip = function()
	    {
	        if( $( window ).width() < tooltip.outerWidth() * 1.5 )
	            tooltip.css( 'max-width', $( window ).width() / 2 );
	        else
	            tooltip.css( 'max-width', 340 );
	
	        var pos_left = target.offset().left + ( target.outerWidth() / 2 ) - ( tooltip.outerWidth() / 2 ),
	            pos_top  = target.offset().top - tooltip.outerHeight() - 20;
	
	        if( pos_left < 0 )
	        {
	            pos_left = target.offset().left + target.outerWidth() / 2 - 20;
	            tooltip.addClass( 'left' );
	        }
	        else
	            tooltip.removeClass( 'left' );
	
	        if( pos_left + tooltip.outerWidth() > $( window ).width() )
	        {
	            pos_left = target.offset().left - tooltip.outerWidth() + target.outerWidth() / 2 + 20;
	            tooltip.addClass( 'right' );
	        }
	        else
	            tooltip.removeClass( 'right' );
	
	        if( pos_top < 0 )
	        {
	            var pos_top  = target.offset().top + target.outerHeight();
	            tooltip.addClass( 'top' );
	        }
	        else
	            tooltip.removeClass( 'top' );
	
	        tooltip.css( { left: pos_left, top: pos_top } )
	               .animate( { top: '+=10', opacity: 1 }, 50 );
	    };
	
	    init_tooltip();
	    $( window ).resize( init_tooltip );
	
	    var remove_tooltip = function()
	    {
	        tooltip.animate( { top: '-=10', opacity: 0 }, 50, function()
	        {
	            $( this ).remove();
	        });
	
	        target.attr( 'title', tip );
	    };
	
	    target.bind( 'mouseleave', remove_tooltip );
	    tooltip.bind( 'click', remove_tooltip );
	});
}
var tool_tips = {
		"IV":	"Intravenous",
		"SQ":	"Subcutaneous", 
		"IM": 	"Intramuscular",
		"IT": 	"Intrathecal",
		"NS": 	"0.9% Normal Saline",
		"LR": 	"Lactated Ringers",
		"D5W": 	"5% Dextrose in Water", 
		"SW": 	"Sterile Water",
		"BW": 	"Bacteriostatic Water",
		"MDV": 	"Multi-Dose Vial",
		"SDV": 	"Single-Dose Vial",
		"DEHP": "Di(2-ethylhexyl)Phthalate",
		"PVC": 	"PolyVinyl Chloride",
		"PPE": 	"Personal Protective Equipment",
		"CIVI": "Continuous intravenous infusion",
		"PF":	"Preservative Free",
		"µm":	"micrometer",
		"MUGA":	"Multi Gated Acquisition Scan"
}


var drug_list = [];
function get_drug_list(){
	data = {'type':'drug_list'};
	$.post('ajax.json',JSON.stringify(data),function(data){
		console.log(data);
		drug_list = data['data'];
		if(drug_list.length==0){
			return;
		}
		if(admin){
			$('#drug_list').empty();
			for(var x = 0; x<drug_list.length; x=x+1){
				var name = drug_list[x].generic_name+"("+drug_list[x].brand_name+")";
				var div = $('<div></div>')
					.attr('value',x)
					.attr('class','drug_selector')
					.attr('id',x)
					.html(name);
				div.click(function(){
					if(edit){
						load_drug_edit(this.id)
					} else {
						load_drug_view(this.id);
					}
				});
				$('#drug_list')
					.append($('<tr class="drug_row"></tr>')
							.append($('<td style="vertical-align:top"></td>')
									.css('align','top')
									.append(div)));
									
					
			}
		}
		$('#select_drug').empty();
		for(var x = 0; x<drug_list.length; x=x+1){
			$('#select_drug')
				.append($("<option></option>")
						.attr('value',x)
						.text(drug_list[x].generic_name+"("+drug_list[x].brand_name+")"));
		}

		
		if(edit){
			load_drug_edit($('#select_drug').val());
			$('#select_drug').change(function(e){
				load_drug_edit($('#select_drug').val())
			});
		} else {
			load_drug_view($('#select_drug').val());
			$('#select_drug').change(function(e){
				load_drug_view($('#select_drug').val())
			});
		}
	
	});
}
function load_drug_edit(x){
	var data =  drug_list[x];
	if(admin){
		$('.drug_selector').removeClass('selected');
		$('.drug_selector').addClass('unselected');
		$('#'+x+'.drug_selector').removeClass('unselected');
		$('#'+x+'.drug_selector').addClass('selected');
	}
	$('#generic_name').val(data.generic_name),
	$('#brand_name').val(data.brand_name),
	(new nicEditors.findEditor('how_supplied_storage_prior')).setContent(data.how_supplied_storage_prior);
	(new nicEditors.findEditor('reconstitution_concentration')).setContent(data.reconstitution_concentration);
	(new nicEditors.findEditor('stability_post_reconstruction')).setContent(data.stability_post_reconstruction);
	(new nicEditors.findEditor('vehicle_dilution')).setContent(data.vehicle_dilution);
	(new nicEditors.findEditor('administration')).setContent(data.administration);
	(new nicEditors.findEditor('misc_notes')).setContent(data.misc_notes);
	(new nicEditors.findEditor('references')).setContent(data.references);
	(new nicEditors.findEditor('black_box')).setContent(data.black_box);
}
function load_tool_tips(data){
	if(data==null){
		return " ";
	}
	for(var tip in tool_tips){
		if(data.indexOf(tip)!=-1){
			
			var re = new RegExp('([^A-Za-z]|^)'+tip+'([^A-Za-z]|$)', 'g');
			data = data.replace(re,'$1<abbr title="'+tool_tips[tip]+'" rel="tooltip">'+tip+'</abbr>$2');
		}
		//console.log("tip: "+tip+": "+data.indexOf(tip));
	}
	return data;
}
function load_drug_view(x){
	var data =  drug_list[x];
	$('#generic_name').html(data.generic_name);
	$('#brand_name').html(data.brand_name);
	var how_supplied_storage_prior = load_tool_tips(data.how_supplied_storage_prior);
	$('#how_supplied_storage_prior').html(how_supplied_storage_prior);
	
	var reconstitution_concentration = load_tool_tips(data.reconstitution_concentration);
	$('#reconstitution_concentration').html(reconstitution_concentration);
	
	var stability_post_reconstruction = load_tool_tips(data.stability_post_reconstruction);
	$('#stability_post_reconstruction').html(stability_post_reconstruction);
	
	var vehicle_dilution = load_tool_tips(data.vehicle_dilution);
	$('#vehicle_dilution').html(vehicle_dilution);
	
	var administration = load_tool_tips(data.administration);
	$('#administration').html(administration);
	
	var misc_notes = load_tool_tips(data.misc_notes);
	$('#misc_notes').html(misc_notes);
	
	var references = load_tool_tips(data.references);
	$('#references').html(references);
	
	var black_box = load_tool_tips(data.black_box);
	$('#black_box').html(black_box);
	setup_tooltips();
}
function addToolTips(dom){
    var isFound = dom.text().search(/string/i);
    //do something based on isFound...
}
function save_drug(){
	data = {'type':'save_drug',
			'generic_name':$('#generic_name').val(),
			'brand_name':$('#brand_name').val(),
			'how_supplied_storage_prior':(new nicEditors.findEditor('how_supplied_storage_prior')).getContent(),
			'reconstitution_concentration':(new nicEditors.findEditor('reconstitution_concentration')).getContent(),
			'stability_post_reconstruction':(new nicEditors.findEditor('stability_post_reconstruction')).getContent(),
			'vehicle_dilution':(new nicEditors.findEditor('vehicle_dilution')).getContent(),
			'administration':(new nicEditors.findEditor('administration')).getContent(),
			'misc_notes':(new nicEditors.findEditor('misc_notes')).getContent(),
			'references':(new nicEditors.findEditor('references')).getContent(),
			'black_box':(new nicEditors.findEditor('black_box')).getContent()};
	console.log("saving...");
	$.post('ajax.json',JSON.stringify(data),function(data){
		console.log(data);
		if(data.status=='saved'){
			alert(data.generic_name+" saved!");
		}
			
		setTimeout(function(){
			get_drug_list();
	    }, 2000);
		
	});
	
}
function delete_drug(){
	data = {'type':'delete_drug',
			'brand_name':$('#brand_name').val()};
	$.post('ajax.json',JSON.stringify(data),function(data){
		console.log(data);
	});
	
}
function new_drug(){
	$('#generic_name').val(''),
	$('#brand_name').val(''),
	(new nicEditors.findEditor('how_supplied_storage_prior')).setContent('');
	(new nicEditors.findEditor('reconstitution_concentration')).setContent('');
	(new nicEditors.findEditor('stability_post_reconstruction')).setContent('');
	(new nicEditors.findEditor('vehicle_dilution')).setContent('');
	(new nicEditors.findEditor('administration')).setContent('');
	(new nicEditors.findEditor('misc_notes')).setContent('');
	(new nicEditors.findEditor('references')).setContent('');
}