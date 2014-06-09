<?php

class TagsController extends PlonkController {

    protected $maxFontSize = 20;
    protected $minFontSize = 16;
    
    protected $picLimit = 102;
    protected $pageLimit = 25;
    
    /**
     * The views allowed for this module
     * @var array
     */
    protected $views = array(
        'tags','tag'
    );
    /**
     * The actions allowed for this module
     * @var array
     */
    protected $actions = array(
    );
    
    public function __construct(array $urlParts) {        
        if (count($urlParts) > 1 && $urlParts[1] != "" ) {
            array_splice($urlParts, 1, 0, "tag");
            parent::__construct($urlParts);
        } else {
            parent::__construct($urlParts);
        }
    }

    protected function showTags() {
        // Main Layout
        // assign vars in our main layout tpl
        $this->mainTpl->assign('pageTitle', 'Tags');
        $this->mainTpl->assignOption('oTagsActive');
        $this->mainTpl->assign('pageMeta',  '
            <link rel="stylesheet" type="text/css" href="/modules/tags/css/tags.css" />
        ');

        if ( PlonkSession::exists("admin") ) {
            $this->mainTpl->assignOption('oAdminMode');
        }

        // Page Layout

        //Get the gallery file
        $db = new SQLite3(SQLite3_DB_NAME);

        if($db != null) {
            
            $tags = $db->query('select Tags.name, count (distinct TaggedImages.image) as total from TaggedImages join Tags on Tags.tagid = TaggedImages.tag group by TaggedImages.tag order by Tags.name;');
            $tagMinMax = $db->querySingle('select min(total) as min, max(total) as max from TaggedImages join ( select count(image) as total from TaggedImages group by tag);', true);
            
            if ( $tags->fetchArray() != false ) {
                $this->pageTpl->assignOption("oHasTags");
                
                $this->pageTpl->setIteration("iTags");
                
                while ($tag=$tags->fetchArray()) {
                    $this->pageTpl->assignIteration("tagName", $tag["name"]);
                    $this->pageTpl->assignIteration("tagURL", 'tags/' . urlencode($tag["name"]));
                    $this->pageTpl->assignIteration("tagSize", $this->calcTagCloudSize($tag["total"], $tagMinMax["min"], $tagMinMax["max"], $this->minFontSize, $this->maxFontSize) );
                    
                    
                    $this->pageTpl->refillIteration();
                }
                $this->pageTpl->parseIteration();
                
            } else {
                $this->pageTpl->assignOption("oNoTags");
            }
            
        } else {
            $this->pageTpl->assignOption("oNoTags");
        }
    }
    
    protected function showTag() {
        // Main Layout
        // assign vars in our main layout tpl
        $this->mainTpl->assignOption('oTagsActive');
        $this->mainTpl->assign('pageMeta',  '
            <link rel="stylesheet" type="text/css" href="/modules/tags/css/tags.css" />
            <link rel="stylesheet" type="text/css" href="/modules/tags/js/fancybox/jquery.fancybox.css" />
            <link rel="stylesheet" type="text/css" href="/modules/tags/js/tag-it/css/jquery.tagit.css" />
            <script type="text/javascript" src="/modules/tags/js/fancybox/jquery.fancybox.pack.js"></script>
            <script type="text/javascript" src="/modules/tags/js/tag-it/js/jquery-ui-1.8.17.custom.min.js"></script>
            <script type="text/javascript" src="/modules/tags/js/tag-it/js/tag-it.js"></script>
            <script type="text/javascript" src="/modules/tags/js/general.js"></script>
        ');

        if ( PlonkSession::exists("admin") ) $this->mainTpl->assignOption('oAdminMode');

        // Page Layout

        //Get the gallery file
        $db = new SQLite3(SQLite3_DB_NAME);
        
        $page   = ( isset($this->urlParts[3]) ) ? $this->urlParts[3] : 1;
        $page   = ( is_numeric($page) && $page > 0 ) ? $page : 1;
        $offset = $this->picLimit * ($page-1);

        if($db != null) {
            $tag = html_entity_decode(urldecode($this->urlParts[2]));
            $tagTmp = $db->escapeString($tag);
            
            $queryResult = $db->querySingle("select Tags.tagid as id, count (distinct TaggedImages.image) as total from TaggedImages join Tags on Tags.tagid = TaggedImages.tag where Tags.name = '$tagTmp' group by TaggedImages.tag", true);
            
            if ( $queryResult != false ) {
            
                $tagID = (int)$queryResult["id"];
                $numbImages = (int)$queryResult["total"];

                if ($numbImages > 0) {
                    $this->mainTpl->assign('pageTitle', "Tag: " . $tag);
                    $this->pageTpl->assignOption("oImagesFound");

                    $numbPages = 0;

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

                    $images = $db->query("select Images.* from TaggedImages join Images on TaggedImages.image = Images.imageid where TaggedImages.tag = '$tagID' order by Images.lastModified desc limit '$quantity' offset '$ending'");

                    $this->pageTpl->assign("tagName", $tag);

                    $this->pageTpl->setIteration("iPics");
                    while ($image=$images->fetchArray()) {
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
                    $this->mainTpl->assign('pageTitle', 'Tag Not Found');
                    $this->pageTpl->assignOption("oNotFound");
                }
                
            } else {
                $this->mainTpl->assign('pageTitle', 'Tag Not Found');
                $this->pageTpl->assignOption("oNotFound");
            }
            

        } else {
            $this->mainTpl->assign('pageTitle', 'Tag Not Found');
            $this->pageTpl->assignOption("oNotFound");
        }
    }
    
    /**
     * Calculate the Font for the given item given its weight compared to the minimal and maximal possible
     * weight, and the minimal and maximal allowed Font size.
     * @param int $weight
     * @param int $minWeight
     * @param int $maxWeight
     * @param int $minFont
     * @param int $maxFont
     * @return int
     */
    private function calcTagCloudSize($weight,$minWeight,$maxWeight,$minFont,$maxFont) {
        $size = $minFont;
        if ($weight > $minWeight) {
            $size +=  ( ($maxFont * ( $weight - $minWeight )) / ( $maxWeight - $minWeight ) );
        }
        return $size;
    }

}

// EOF