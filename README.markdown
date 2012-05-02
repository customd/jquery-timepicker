jQuery Timepicker Plugin
===========================
### By Sam Sehnert, [Digital Fusion](http://teamdf.com/) 2012

This is a [jQuery](http://jquery.com/) plugin which aims to create a standard, easy 
to use control which allows end users to enter times in a consistant and intuitive way.

Documentation
-------------

### Basic list setup

The basic setup will work with any standard input element with no extra config options.
When submitting the form, the selected time will be set in the target input element.

	$('input[type="time"]').timepicker();

It can also work with a container element, and will build the required form elements.

	$('div.timepicker').timepicker();

### Time Formatting

The timepicker plugin includes its own time formatting methods (using [PHP style masking](http://php.net/manual/en/function.date.php)). 
This plugin only includes formatting for times, not dates. See the [jQuery Calendar](http://github.com/teamdf/jquery-calendar/) plugin 
for date formatting as well.

	$.timepicker.format( new Date(), 'H:i:s' );

### Full plugin documentation

The Documentation for this plugin lives under the docs/ directory. Open it directly 
in your web browser, or see the [online documentation](http://teamdf.com/jquery-plugins/timepicker/).