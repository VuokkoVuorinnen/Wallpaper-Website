<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>

    <title>{$pageTitle}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
    <link rel="stylesheet" type="text/css" media="screen" href="/core/css/style.css" />
    <script type="text/javascript" src="/core/js/jquery-1.7.1.min.js"></script>

    {$pageMeta}

</head>
<body>

    <div id="siteWrapper">

        <div id="header">
            <h1>My Wallpaper Gallery</h1>
        </div>

        <ul id="navigation">
            <li><a {option:oBrowseActive}class="active"{/option:oBrowseActive} href="/browse">Browse</a></li>
            <li><a {option:oTagsActive}class="active"{/option:oTagsActive} href="/tags">Tags</a></li>
            <li><a {option:oNewsActive}class="active"{/option:oNewsActive} href="/news">News</a></li>
            {option:oAdminMode}<li><a {option:oAdminActive}class="active"{/option:oAdminActive} href="/admin">Admin Panel</a></li>{/option:oAdminMode}

            <li id="search">
                <form>
                    <input id="searchFld" type="text" name=="search" placeholder="Search" />
                </form>
            </li>
        </ul>

        <!-- content -->
        <div id="content" class="clearfix">

            {$pageContent}

        </div>

    </div>

    <script type="text/javascript">
          var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-263141-7']);
          _gaq.push(['_trackPageview']);

          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();
    </script>

</body>
</html>