<?php
	$template = '../template.html';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" debug="true">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<script type="text/javascript" src="../frameworks/<?php echo $_GET['include']; ?>"></script>

	<script type="text/javascript">



		var get_length = function(elements){
			return (typeof elements.length == 'function') ? elements.length() : elements.length;
		}

		var context = document;

<?php	if ($_GET['special'] == 'loose'): ?>
		window.onload = function() {
			context = document.createElement('div');
			context.innerHTML = document.body.innerHTML; // I feel dirty!
			document.body.innerHTML = '';
		};
<?php	elseif ($_GET['special'] == 'xml'):
				$template = '../template.xml.html';
?>
		// Copyright 2009 by Harald Kirschner <http://digitarald.de>
		function createXML(text, options) {
			options = options || {error: true};
			var doc, root;

			try {
				if (window.ActiveXObject){
					doc = new ActiveXObject('Microsoft.XMLDOM');
					doc.async = false;
					doc.preserveWhiteSpace = true;
					doc.validateOnParse = false;
					doc.loadXML(text);
					if (doc.parseError.errorCode) throw new Error(doc.parseError.reason);
					root = doc.documentElement;
				} else if (window.DOMParser) {
					doc = new DOMParser().parseFromString(text, (options.html) ? 'text/html' : 'text/xml');
					root = doc.documentElement;
					if (root.nodeName == 'parsererror') throw new Error(root.firstChild.nodeValue);
				}
			} catch (e) {
				if (options.error) throw e;
				return null;
			}

			return root;
		}

		window.onload = function() {
			context = createXML('<div>' + document.body.innerHTML + '</div>', {error: true, html: false}); // I feel dirty!
			document.body.innerHTML = '';
		};
<?php	endif; ?>


		function test(selector){
			try {
				var times = [];
				var start = new Date();
				var i = 0;

				times[i]={ start:new Date() };
				var elements = <?php echo $_GET['function']; ?>(selector, context);
				times[i].end = new Date();

				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();
				i++; times[i]={ start:new Date() }; <?php echo $_GET['function']; ?>(selector, context);times[i].end = new Date();

				var end = new Date();
				var data = { time:0, found:get_length(elements) };

				for (var N=0; N < times.length; N++) {
					if (!times[N]) continue;
					data.time += (times[N].end - times[N].start);
				}
				data.time && (data.time /= times.length);
				data.time || (data.time=0);

				data.time = (end - start) / i;
				return data;
			} catch(err){
				if (elements == undefined) elements = {length: -1};
				return ({'time': ((new Date().getTime() - start) / (i||1)) || 0, 'found': get_length(elements), 'error': (err.fileName || '?.js').replace(/^.*(\/[^\/]+)$/, '$1') + '#' + err.lineNumber + ': ' + err.message});
			}

		};

		test.name = "<?php echo $_GET['include']; ?>";

	</script>

</head>

<body>

	<?php include($template);?>

</body>
</html>
