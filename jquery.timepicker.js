/**
 * jQuery timepicker plug-in 1.0.0
 * Copyright 2012, Digital Fusion
 * Licensed under the MIT license.
 * http://teamdf.com/jquery-plugins/license/
 *
 * @author Sam Sehnert
 */

(function($){
	"use strict";
	
	// The name of your plugin. This is used to namespace your
	// plugin methods, object data, and registerd events.
	var plugin_name = 'timepicker';
	var plugin_version = '1.0.0';
	
	// Set up the plugin defaults.
	// These will be stored in $this.data(plugin_name).settings,
	// and can be overwritten by having 'options' passed through
	// as the parameter to the init method.
	var defaults = {
		'onchange'		: $.noop,
		'onsubmit'		: $.noop,
		'dateformat'	: 'H:i:s',
		'value'			: null
	};
	
	var methods = {
		init : function( options ){
			
			// Loop through each passed element.
			return $(this).each(function(){
				
				// Settings to the defaults.
				var settings = $.extend({},defaults);
				
				// If options exist, lets merge them
				// with our default settings.
				if( options ) $.extend( settings, options );
				
				// Create shortcuts, and get any existing data.
				var $this = $(this),data = $this.data(plugin_name);
				
				// If the plugin hasn't been initialized yet
				if ( ! data ) {
					
					// Create the data object.
					data = {
						target		: $this,				// This element.
						wrapper		: $this,				
						output		: null,					// This hidden input element used to submit and retrieve the date.
						hour		: null,					// The input element used to input the hour.
						minute		: null,					// The input element used to input the minutes.
						meridiem	: null,					// The input element used to input am or pm.
						settings	: settings				// The settings for this plugin.
					}
										
					// If we're dealing with an input element or not.
					if( data.target.is('input') ){
						
						// Set the type to hidden.
						$this.css('display','none');
						$this.wrap('<div class="ui-'+plugin_name+'" />');
						
						// Store this into the output element.
						// then set the new target as the containter element.
						data.output = $this;
						data.wrapper = $this.parent();
						
						// Get the value of data.output as the current value.
						if( data.settings.value === null ) data.settings.value = data.output.val();
						
					} else {
						
						// Add the container class, and the base HTML structure
						data.wrapper.addClass('ui-'+plugin_name+' ')
					}
					
					data.hour		= $('<input type="text" class="ui-'+plugin_name+'-hour" size="2"/>');
					data.minute		= $('<input type="text" class="ui-'+plugin_name+'-minute" size="2"/>');
					data.meridiem	= $('<input type="text" class="ui-'+plugin_name+'-meridiem" size="2"/>');
					
					data.wrapper // Add the rest of the classes to the UI widget.
						.addClass('ui-widget ui-widget-content')
						.css('whitespace','pre')
						.append( data.hour, '<span>:</span>', data.minute, '<span>&nbsp;</span>', data.meridiem, data.output );
					
					// Try to get the date as an actual date.
					if( !( data.settings.value instanceof Date ) ){
						var time = data.settings.value.split(':');
						data.settings.value = new Date(0);
						data.settings.value.setHours(time[0]);
						data.settings.value.setMinutes(time[1]);
						data.settings.value.setSeconds(time[2]);
					}
					
					if( data.settings.value instanceof Date ){
						data.hour.val( $[plugin_name].format( data.settings.value, 'g' ) );
						data.minute.val( $[plugin_name].format( data.settings.value, 'i' ) );
						data.meridiem.val( $[plugin_name].format( data.settings.value, 'a' ) );
					} else {
						data.hour.val('12');
						data.minute.val('00');
						data.meridiem.val('am');
					}
					
					data.hour.bind('keydown',function(evt){

						var current = Number( $(this).val() ),
							newHour = null,
							newMin = null,
							newMer = null;
							
						if( // Allow all numbers, and 
							( evt.which >= 48 && evt.which <= 57 ) ||
							( evt.which >= 96 && evt.which <= 105 ) ||
							( evt.which == 9 )
						) return true;
						
						switch( evt.which ){
			
							case 13 : // Return
								data.settings.onsubmit.call(data.target,data.output.val());
								return true;
							break;
						
							case 38 : // Up Arrow
								// Increase hour by 1
								newHour = current+1;
							break;
							
							case 40 : // Down Arrow
								// Decrease hour by 1
								newHour = current-1;
							break;
						}
						
						if( newHour !== null ){
							
							// If hour is greater than 12, flip it back around.
							// If hour is less than 1, flip it back around, either way.
							if( newHour > 12 )	newHour -= 12;
							if( newHour < 1 )	newHour += 12;
							
							// CHECK if we're crossing from 11 to 12 or from 12 to 11.
							// NOTE: this will need to change if we implement skipping. i.e., 1 keypress resulting in a larger than 1 hour change.
							if( current == 12 && data.meridiem.val() == 'am' && evt.which == 40 ){
								newMer = 'pm';
							} else if( current == 11 && data.meridiem.val() == 'pm' && evt.which == 38 ){
								newMer = 'am';
							} else if( current == 12 && data.meridiem.val() == 'pm' && evt.which == 40 ){
								newMer = 'am';
							} else if( current == 11 && data.meridiem.val() == 'am' && evt.which == 38 ){
								newMer = 'pm';
							}
						}
						
						// Set the new time.
						if( newHour !== null ) $(this).val( newHour ).trigger('update');
						if( newMer !== null ) data.meridiem.val( newMer ).trigger('update');
						
						// Select the full text again.
						$(this).select();
						
						evt.preventDefault();
						return false;
						
					}).bind('keyup blur',function(evt){
						/* Now we validate the input, and try to make sense of it */
						
						// Get the current values.
						var current = $(this).val(),
							newHour = null,
							newMer = null;
							
						// Make current the last two characters entered.
						current = current.substring( current.length-2, current.length );
						newHour = Number( current );
						
						// If new hour is greater than 24, grab the last number.
						if( newHour > 24 ) newHour = Number( current.substring(1,2) );
						
						// Set to AM if the user entered a preceeding 0.
						if( current.substring(0,1) == '0' && current.length > 1 ) newMer = 'am';
						
						// Set 12 am
						if( current == '00' || ( newHour == 0 && evt.type == 'blur' ) ){
							newHour = 12;
							newMer = 'am';
						} else if( newHour > 12 ){
							newHour -= 12;
							newMer = 'pm';
						}
									
						// Set the new time.
						if( newHour !== null ) $(this).val( newHour ).trigger('update');
						if( newMer !== null ) data.meridiem.val( newMer ).trigger('update');
						
						// Select the textbox for the next value.
						// Also, select when the user has just tabbed or reverse tabbed to this input.
						if( ( newHour > 2 || newMer !== null || Number( current ) > 12 || evt.which == 9 || evt.which == 16 ) && evt.type !== 'blur' ) $(this).select();

						// Call the update method.
						methods.update.call(data.target);
												
					}).bind('focus mouseup mousedown',function(evt){
						
						$(this).select();
						
						// prevent default if mouseup
						if( evt.type == 'mouseup' ) evt.preventDefault();
					});
					
					/* Add the event handlers onto the minute input element. */
					
					data.minute.bind('keydown',function(evt){
						
						var current = Number( $(this).val() ),
							currentHr = Number( data.hour.val() ),
							newHour = null,
							newMin = null,
							newMer = null;
							
						if( // Allow all numbers, and tab key to be pressed.
							( evt.which >= 48 && evt.which <= 57 ) ||
							( evt.which >= 96 && evt.which <= 105 ) ||
							( evt.which == 9 )
						) return true;
						
						switch( evt.which ){
			
							case 13 : // Return
								data.settings.onsubmit.call(data.target,data.output.val());
								return true;
							break;
							
							case 38: // Up Arrow
								// increase minutes
								newMin = current+1;
							break;
							
							case 40 : // Down Arrow.
								// decrease minutes
								newMin = current-1;
							break;
						}
						
						// 
						if( newMin !== null ){
							if( newMin > 59 ){
								newHour = Number(data.hour.val());
								newHour += 1;
								newMin -= 60;
							}
							if( newMin < 0 ){
								newHour = Number(data.hour.val());
								newHour -= 1;
								newMin += 60;
							}
						}
						
						if( newHour !== null ){
							
							// If hour is greater than 12, flip it back around.
							// If hour is less than 1, flip it back around, either way.
							if( newHour > 12 )	newHour -= 12;
							if( newHour < 1 )	newHour += 12;
							
							// CHECK if we're crossing from 11 to 12 or from 12 to 11.
							// NOTE: this will need to change if we implement skipping. i.e., 1 keypress resulting in a larger than 1 hour change.
							if( currentHr == 12 && data.meridiem.val() == 'am' && evt.which == 40 ){
								newMer = 'pm';
							} else if( currentHr == 11 && data.meridiem.val() == 'pm' && evt.which == 38 ){
								newMer = 'am';
							} else if( currentHr == 12 && data.meridiem.val() == 'pm' && evt.which == 40 ){
								newMer = 'am';
							} else if( currentHr == 11 && data.meridiem.val() == 'am' && evt.which == 38 ){
								newMer = 'pm';
							}
						}
						
						// Set the new values into their appropriate fields.
						if( newHour !== null ) data.hour.val( newHour ).trigger('update');
						if( newMin !== null ) $(this).val( newMin < 10 ? '0'+newMin : newMin ).trigger('update');
						if( newMer !== null ) data.meridiem.val( newMer ).trigger('update');
			
						$(this).select();
						
						evt.preventDefault();
						return false;
						
					}).bind('keyup blur',function(evt){
						// Get the current values.
						var current = $(this).val(),
							newMin = null;
						
						// Select current the last two characters entered. Also, remove the 0 from the beginning.
						newMin = Number( current.replace(/$0/).substring( current.length-2, current.length ) );
						
						// If new hour is greater than 24, grab the last number.
						if( newMin > 59 ) newMin = Number( String( newMin ).substring(1,2) );
						
						// Set the new value, making sure to pad with zero.
						if( newMin !== null ) $(this).val( newMin < 10 ? '0'+newMin : newMin ).trigger('update');
						
						// Select the whole lot again if the value is greater than 5.
						// Also, select when the user has just tabbed or reverse tabbed to this input.
						if( ( newMin > 5 || evt.which == 9 || evt.which == 16 ) && evt.type !== 'blur' ) $(this).select();

						// Call the update method.
						methods.update.call(data.target);
						
					}).bind('focus mouseup mousedown',function(evt){
						$(this).select();
						
						// prevent default if mouseup
						if( evt.type == 'mouseup' ) evt.preventDefault();
					});
					
					// Store the data.
					$this.data(plugin_name,data);
				}
				
				/* Add the event handlers for the meridiem */
				
				data.meridiem.bind('keydown',function(evt){
					
					switch( evt.which ){
		
						case 13 : // Return
							data.settings.onsubmit.call(data.target,data.output.val());
							return true;
						break;
						
						case 38 : // Up arrow
						case 40 : // Down arrow
							
							if( $(this).val() == 'am' ){
								$(this).val('pm');
							} else {
								$(this).val('am');
							}
							
						break;
						
						case 80 : // p
							$(this).val('pm');
						break;
						
						case 65 : // a
							$(this).val('am');
						break;
					}
					
					// Re-select the contents.
					$(this).select();
					
					// Call the update method.
					methods.update.call(data.target);
					
					if( evt.which !== 9 ){
						evt.preventDefault();
						return false;
					}
					
				}).bind('focus mouseup mousedown',function(evt){
					$(this).select();
					
					// prevent default if mouseup
					if( evt.type == 'mouseup' ) evt.preventDefault();
				});
			});
		},
		update : function(){
			// Create shortcuts, and get any existing data.
			var $this = $(this),data = $this.data(plugin_name);
						
			//  Only do the work if we've already set this up.
			if( data ){
				
				// Work out the time values that we've set in the data object.
				var time = new Date(0),
					hour = Number( data.hour.val() ),
					mins = Number( data.minute.val() ),
					curr = data.output && typeof data.output == 'object' ? data.output.val() : data.output;
				
				// Set the hours and minutes on the time.
				time.setHours( data.meridiem.val() == 'am' ? hour - ( hour == 12 ? 12 : 0 ) : hour + ( hour != 12 ? 12 : 0 ) );
				time.setMinutes( mins );
				
				// Get the formatted text.
				var formatted = $[plugin_name].format( time, data.settings.dateformat );
				
				// Check if its different to what we had previously.
				if( curr !== formatted ){				
					// Assign the output value, and trigger the change event.
					
					if( data.output && typeof data.output == 'object' ){
						data.output.val( formatted );
						data.output.trigger('change');
					} else {
						data.output = formatted;
					}
					
					// Call the users onchange method.
					data.settings.onchange.call($this,formatted,time);
				}
			}
			
			return $this;
		},
		option : function( key, value ){
			var $this = $(this),
				data = $this.data(plugin_name);
			
			// Only bother if we've set this up before.
			if( data ){

				// Return settings array if no key is provided.
				if( typeof key == 'undefined' ) return data.settings;
			
				// The key has to exist, otherwise its invalid.
				if( !key in data.settings ) return false;
				
				// Check if we're adding or updating.
				if( typeof value == 'undefined' ){
					return data.settings[key];
				} else {
					data.settings[key] = value;
					return $this;
				}
			}			
		},
		version : function(){
			// Returns the version string for this plugin.
			return plugin_name+' v'+plugin_version;
		},
		destroy: function(){
			/* Remove the ui plugin from these elements that have it */
			
			return this.each(function(){
			
				var $this = $(this),
					data = $this.data(plugin_name);
				
				// Only bother if we've set this up before.
				if( data ){
					// Now, remove all data.
					$this.removeData(plugin_name);
				}
			});
		}
	};
	
	// You must call these methods in the context of a date object.
	var _replace = {
		// Time
		a: function(l) { return this.getHours() < 12 ? 'am' : 'pm'; },
		A: function(l) { return this.getHours() < 12 ? 'AM' : 'PM'; },
		B: function(l) { return 'B'; }, // Not yet supported...
		g: function(l) { return this.getHours() == 0 ? 12 : (this.getHours() > 12 ? this.getHours() - 12 : this.getHours()); },
		G: function(l) { return this.getHours(); },
		h: function(l) { return (this.getHours() < 10 || (12 < this.getHours() < 22) ? '0' : '') + (this.getHours() < 10 ? this.getHours() + 1 : this.getHours() - 12); },
		H: function(l) { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
		i: function(l) { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
		s: function(l) { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
		// Timezone
		e: function(l) { return 'e'; }, // Not yet supported...
		I: function(l) { return 'I'; }, // Not yet supported...
		O: function(l) { return (this.getTimezoneOffset() < 0 ? '-' : '+') + (this.getTimezoneOffset() / 60 < 10 ? '0' : '') + (this.getTimezoneOffset() / 60) + '00'; },
		T: function(l) { return 'T'; }, // Not yet supported...
		Z: function(l) { return this.getTimezoneOffset() * 60; }
	};
	
	$[plugin_name] = {};
	$[plugin_name].format = function(date,format){
		/* Format a string based on a date mask. */
		
		// Init variables.
		var formatted = '', charat = '';
		
		// Loop through the array, and format the string.
		for( var i=0; i<format.length; i++ ){
			charat = format.charAt(i);
			if( charat == '\\' && _replace[format.charAt(i+1)] ){
				formatted += format.charAt(i+1);
				i++;
			} else if (_replace[charat]){
				formatted += _replace[charat].call(date);
			} else {
				formatted += charat;
			}
		}
		// Return the formatted string.
		return formatted;
	};
	
	$.fn[plugin_name] = function( method ){
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.' + plugin_name );
		}	
	}
	
})(jQuery);