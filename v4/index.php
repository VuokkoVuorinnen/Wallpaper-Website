<?php

$seconds_to_cache = 86400;
$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
header("Expires: $ts");
header("Pragma: cache");
header("Cache-Control: max-age=$seconds_to_cache");

$visitors = file_get_contents("../visitors");
$visitorsArr = explode(",", $visitors);

if ( !in_array($_SERVER["REMOTE_ADDR"], $visitorsArr )) {
    $visitorsArr[] = $_SERVER["REMOTE_ADDR"];
    $fh = fopen("../visitors", 'w');
    fwrite($fh, implode(",", $visitorsArr));
    fclose($fh);

    $counter = (float)file_get_contents("../counter");
    $counter++;
    $fh = fopen("../counter", 'w');
    fwrite($fh, "" + $counter + "\n");
    fclose($fh);
}


?>

<!DOCTYPE html>
<html>
<head>
    <title>My Wallpaper Gallery</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="My Wallpaper Gallery">
    <meta property="og:title" content="My Wallpaper Gallery">
    <meta property="og:url" content="http://wallpapers.carroarmato0.be/">
    <meta property="og:description" content="Collection of wallpapers gathered from all around the internet which appeal to my interests.">
    <?php
    	$xml = simplexml_load_file('http://wallpapers.carroarmato0.be/gallery.xml');
        $counter = 0;
        foreach ($xml->children() as $node ) {
            $arr = $node->attributes();
	    echo '<meta property="og:image" content="http://wallpapers.carroarmato0.be/' . (string)$arr["thumbURL"] . '">', "\n";
            $counter++;
            if ($counter == 20) break;
        }
    ?>
    <link rel="stylesheet" href="fancybox/jquery.fancybox-1.3.4.css" type="text/css" media="screen" />
    <link rel="StyleSheet" href="wallpapers.css" type="text/css" media="screen" />
    <link rel="StyleSheet" href="spinner.css" type="text/css" media="screen" />
    <script src="jquery-1.7.1.min.js" language="javascript"></script>
    <script src="jquery.ba-resize.min.js" language="javascript"></script>
    <script src="sorter.js" language="javascript"></script>
    <script src="api.js" language="javascript"></script>
    <script type="text/javascript" src="fancybox/jquery.fancybox-1.3.4.pack.js"></script>
    <script src="viewBox.js" language="javascript"></script>
    <script src="wallpapers.js" language="javascript"></script>
</head>
<body>
    <div id="Loading">
        <div>
            <div>
                <div class="spinner">
                    <div class="bar1">
                    </div>
                    <div class="bar2">
                    </div>
                    <div class="bar3">
                    </div>
                    <div class="bar4">
                    </div>
                    <div class="bar5">
                    </div>
                    <div class="bar6">
                    </div>
                    <div class="bar7">
                    </div>
                    <div class="bar8">
                    </div>
                    <div class="bar9">
                    </div>
                    <div class="bar10">
                    </div>
                    <div class="bar11">
                    </div>
                    <div class="bar12">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="container">

        <div id="header">
           <h2>My Wallpaper Gallery</h2>
           <div id="fb-root"></div>
           <script>
               (function(d, s, id) {
                 var js, fjs = d.getElementsByTagName(s)[0];
                 if (d.getElementById(id)) return;
                 js = d.createElement(s); js.id = id;
                 js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
                 fjs.parentNode.insertBefore(js, fjs);
               }(document, 'script', 'facebook-jssdk'));
           </script>

           <div class="fb-like-box" data-href="https://www.facebook.com/pages/Wallpapers/208387139227021" data-width="292" data-show-faces="false" data-colorscheme="dark" data-stream="false" data-border-color="#2D2D2D" data-header="false"></div>

           <div id="info">
               <h3>&nbsp;</h3><h4>&nbsp;</h4>
           </div>
           <div class="clearFloats">&nbsp;</div>
        </div>

    </div>
</body>
</html>
