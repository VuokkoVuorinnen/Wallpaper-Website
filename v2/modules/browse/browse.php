<?php

class BrowseController extends PlonkController {

    protected $picLimit = 102;
    protected $pageLimit = 25;

    /**
     * The views allowed for this module
     * @var array
     */
    protected $views = array(
        'browse', 'page'
    );
    /**
     * The actions allowed for this module
     * @var array
     */
    protected $actions = array(
    );

    public function showPage() {
        $this->displayPage();
    }

    public function showBrowse() {
        $this->displayPage();
    }

    private function displayPage() {
        // Main Layout
        // assign vars in our main layout tpl
        $this->mainTpl->assign('pageTitle', 'Browse');
        $this->mainTpl->assignOption('oBrowseActive');

        if ( PlonkSession::exists("admin") ) {
            $this->mainTpl->assignOption('oAdminMode');
            $this->mainTpl->assign('pageMeta',  '
                <link rel="stylesheet" type="text/css" href="/modules/browse/css/browse.css" />
                <link rel="stylesheet" type="text/css" href="/modules/browse/js/fancybox/jquery.fancybox.css" />
                <link rel="stylesheet" type="text/css" href="/modules/browse/js/tag-it/css/jquery.tagit.css" />
                <script type="text/javascript" src="/modules/browse/js/fancybox/jquery.fancybox.pack.js"></script>
                <script type="text/javascript" src="/modules/browse/js/tag-it/js/jquery-ui-1.8.17.custom.min.js"></script>
                <script type="text/javascript" src="/modules/browse/js/tag-it/js/tag-it.js"></script>
                <script type="text/javascript" src="/modules/browse/js/general.js"></script>
            ');
        } else {
            $this->mainTpl->assign('pageMeta',  '
                <link rel="stylesheet" type="text/css" href="/modules/browse/css/browse.css" />
            ');
        }

        // Page Layout

        //Get the gallery file
        $db = new SQLite3(SQLite3_DB_NAME);

        $page   = ( isset($this->urlParts[2]) ) ? $this->urlParts[2] : 1;
        $page   = ( is_numeric($page) && $page > 0 ) ? $page : 1;
        $offset = $this->picLimit * ($page-1);


        if ( $db != null ) {
            $numbImages = (int)$db->querySingle("select count(imageid) from Images;");
            $previousDate = null;

            //PAGER
            if ( $numbImages > $this->picLimit ) {
                $numbPages = ceil( $numbImages/$this->picLimit );
                $this->pageTpl->assignOption("oPagination");

                if ($page > $numbPages) PlonkWebsite::redirect ("/browse");

                //Previous Butn
                if ($page != 1 && $numbPages > 1) {
                    $this->pageTpl->assignOption("oPrevious");
                    $this->pageTpl->assign('previousLink', $page-1);
                }

                //Next Butn
                if ($page != $numbPages && $numbPages > 1) {
                    $this->pageTpl->assignOption("oNext");
                    $this->pageTpl->assign('nextLink', $page+1);
                }

                // TOP Pagination
                $this->pageTpl->setIteration("iPages");

                $leftLimit  = false;
                $rightLimit = false;

                $supRight = 0;
                $supLeft  = 0;

                if ($page - ceil($this->pageLimit/2) < 0) {
                    $supRight = $page - ceil($this->pageLimit/2);
                }

                if ($page + ceil($this->pageLimit/2) > $numbPages) {
                    $supLeft = $numbPages - ($page + ceil($this->pageLimit/2) -1);
                }

                for ($index = 0; $index < $numbPages; $index++) {
                    $numb = $index + 1;

                    if ( $numb <= ($page - ceil($this->pageLimit/2) + $supLeft + 1) ) {
                        if ($leftLimit == false) {
                            $leftLimit = true;
                            $this->pageTpl->assignIterationOption("oSkip");
                        }
                    } else {

                        if ( $numb == $page ) {
                            $this->pageTpl->assignIterationOption("oLink");
                            $this->pageTpl->assignIterationOption("oCurrent");
                            $this->pageTpl->assignIteration('pageLink', $numb);
                            $this->pageTpl->assignIteration('pageNumber', ($numb < 10) ? '&nbsp;'.$numb : $numb );
                        } else if ( $numb < ($page + ceil($this->pageLimit/2) - $supRight -1) ) {
                            $this->pageTpl->assignIterationOption("oLink");
                            $this->pageTpl->assignIteration('pageLink', $numb);
                            $this->pageTpl->assignIteration('pageNumber', ($numb < 10) ? '&nbsp;'.$numb : $numb );
                        } else {
                            if ($rightLimit == false) {
                                $rightLimit = true;
                                $this->pageTpl->assignIterationOption("oSkip");
                            } else {
                                break;
                            }
                        }
                    }

                    $this->pageTpl->refillIteration("iPages");
                }

                $this->pageTpl->parseIteration("iPages");

                // BOTTOM Pagination
                $this->pageTpl->setIteration("iPages2");

                $leftLimit  = false;
                $rightLimit = false;


                for ($index = 0; $index < $numbPages; $index++) {
                    $numb = $index + 1;

                    if ( $numb <= ($page - ceil($this->pageLimit/2) + $supLeft + 1) ) {
                        if ($leftLimit == false) {
                            $leftLimit = true;
                            $this->pageTpl->assignIterationOption("oSkip");
                        }
                    } else {

                        if ( $numb == $page ) {
                            $this->pageTpl->assignIterationOption("oLink");
                            $this->pageTpl->assignIterationOption("oCurrent");
                            $this->pageTpl->assignIteration('pageLink', $numb);
                            $this->pageTpl->assignIteration('pageNumber', ($numb < 10) ? '&nbsp;'.$numb : $numb );
                        } else if ( $numb < ($page + ceil($this->pageLimit/2) - $supRight -1) ) {
                            $this->pageTpl->assignIterationOption("oLink");
                            $this->pageTpl->assignIteration('pageLink', $numb);
                            $this->pageTpl->assignIteration('pageNumber', ($numb < 10) ? '&nbsp;'.$numb : $numb );
                        } else {
                            if ($rightLimit == false) {
                                $rightLimit = true;
                                $this->pageTpl->assignIterationOption("oSkip");
                            } else {
                                break;
                            }
                        }
                    }

                    $this->pageTpl->refillIteration("iPages2");
                }

                $this->pageTpl->parseIteration("iPages2");

            }

            //PICS

            $lastPic = 0;

            if ( $page != $numbPages ) {
                $lastPic = $offset + $this->picLimit;
            } else {
                $lastPic = ($offset-1) + ($this->picLimit - (($numbPages * $this->picLimit) - $numbImages));
            }

            $quantity = $this->picLimit;
            $ending = $lastPic - $this->picLimit;

            $images = $db->query("select * from Images order by lastModified desc limit '$quantity' offset '$ending'");


            $this->pageTpl->setIteration("iPics");
            while ($image=$images->fetchArray()) {

                $date = (int)$image["lastModified"];

                if (empty($previousDate)) {
                    $previousDate = date('l jS \of F Y', $date);
                    $this->pageTpl->assignIterationOption("oFirstDate");
                    $this->pageTpl->assignIteration("date", $previousDate);
                } else {
                    $tmp_date = date('l jS \of F Y', $date);

                    if ($tmp_date != $previousDate) {
                        $previousDate = $tmp_date;
                        $this->pageTpl->assignIterationOption("oNewDate");
                        $this->pageTpl->assignIteration("date", $tmp_date);
                    }
                }

                $this->pageTpl->assignIteration("imgURL", DOMAIN . $image["imageURL"]);
                $this->pageTpl->assignIteration("imgTHUMB", DOMAIN . $image["thumb2URL"]);
                $this->pageTpl->assignIteration("imgFILENAME", "&nbsp;");
                $this->pageTpl->assignIteration("imgRESOLUTION", $image['width']."x".$image['height']);
                //$this->pageTpl->assignIteration("imgSIZE", round(((int)$image['size']/1048576), 2)."MB");

                if ( PlonkSession::exists("admin") ) {
                    $this->pageTpl->assignIterationOption('oAdminEdit');
                    $this->pageTpl->assignIteration("imgID", $image["imageid"]);
                }

                $this->pageTpl->refillIteration();
            }

            $this->pageTpl->parseIteration();

        } else {
            $this->pageTpl->assignOption("oNoWallpapers");
        }

    }

}

// EOF