<?php

include_once "./ImageAnalyser.php";

/** SIMPLEVIEWER gallery.xml Generator **/
/**                V3.8                **/
/**          by Carroarmato0           **/      /**    Requires PHP >= 5.0    **/
/**                                    **/      /**       and gd library      **/
/**     carroarmato0 A T gmail.com     **/      /**  Supports older versions  **/
/** ********************************** **/      /**  of SimpleViewer from 1.8 **/
/**  This script will scan your image  **/      /**        up to 2.0.3        **/
/**   path and generate the xml and    **/
/**         thumbs accordingly         **/
/** ********************************** **/
//Max amount of memory that PHP can use, checked when creating the thumbnails
$maxMemInBytes = ((int)(ini_get('memory_limit'))) * 1024 * 128;
define("MAXMEM", /*$maxMemInBytes*/ 97108864);
class WallGenerator {
    //SimpleViewer Properties
    public $galleryStyle = "MODERN";
    public $title = "My Wallpapers";
    public $textColor = "FFFFFF";
    public $frameColor = "FFFFFF";
    public $frameWidth = "20";
    public $thumbPosition = "LEFT";
    public $thumbColumns = "5";
    public $thumbRows = "6";
    public $showOpenButton = "TRUE";
    public $showFullscreenButton = "TRUE";
    public $maxImageWidth = "640";
    public $maxImageHeight = "640";
    public $useFlickr = "false";
    public $flickrUserName = "";
    public $flickrTags = "";
    public $languageCode = "AUTO";
    public $languageList = "";
    public $imagePath = "images/";
    public $thumbPath = "thumbs/";
    public $thumb2Path = "thumbs293/";
    public $woepsPath = "errors/";
    public $dbName    = "gallery.db";
    public $xmlFile   = "gallery.xml";
    public $googleSwatches = array(0xCC0000, 0xFB940B, 0xFFFF00, 0x00cc00, 0x03c0c6, 0x0000ff, 0x762ca7, 0x7798bf, 0xffffff, 0x999999, 0x000000, 0x885418);
    /** DO NOT MODIFY BEYOND THIS POINT **/
    /**( unless you know what you are  )**/
    /**(  doing, or don't care about   )**/
    /**(            warnings           )**/
    private $xml;
    private $images;
    public function start() {
        $this->checkEnvironment();
        //No Gallery
        if (!$this->isGalleryPresent()) $this->createGalleryFile();
        if ($this->isDatabasePresent()) $this->tryCreateDBTables();
        $imageArray = $this->scanPictures();
        $galleryArray = $this->scanGalleryImages();
        $removedPictures = $this->getDeletedImages($galleryArray, $imageArray);
        $newPictures = $this->getNewImages($galleryArray, $imageArray);
        echo "Deleted ", (count($removedPictures) == 1) ? count($removedPictures) . " image\n" : count($removedPictures) . " images\n";
        $this->deleteImageAssets($removedPictures);
        $successfulAdds = $this->addNewImages($newPictures);
        echo "Added   ", ($successfulAdds == 1) ? $successfulAdds . " image\n" : $successfulAdds . " images", " out of ", count($newPictures), "\n";
        $this->sort();
        $this->saveGallery();
    }
    /**
     * Checks some variables
     */
    private function checkEnvironment() {
        if (!file_exists($this->imagePath) && !file_exists($this->thumbPath)) die('$imagePath and $thumbPath are pointing to non existing or unaccessible folders' . "\n");
        if (!file_exists($this->imagePath)) die('$imagePath points to a non existing or unaccessible folder' . "\n");
        if (!file_exists($this->thumbPath)) die('$thumbPath points to a non existing or unaccessible folder' . "\n");
        if (!file_exists($this->woepsPath)) die('$woepsPath points to a non existing or unaccessible folder' . "\n");
    }
    /**
     * Check if there's a gallery file present and if it's writeable
     * @return <boolean>
     */
    private function isGalleryPresent() {
        return is_writable($this->xmlFile);
    }
    /**
     * Check to see if there's a database file present and if it's writeable
     * @return <boolean>
     */
    private function isDatabasePresent() {
        //Attempt to open the database
        try {
            //create or open the database
            $db = new SQLite3($this->dbName);
            if (is_writable($this->dbName)) return true;
            else return false;
        } catch (Exception $ex) {
            return false;
        }
    }
    /**
     * Scan the image folder for pictures
     * @param <boolean> hide the full path of the pictures
     * @return <array> picture locations
     */
    private function scanPictures($noPath = false) {
        /* Setting up Recursive lookup  */
        $Directory = new RecursiveDirectoryIterator($this->imagePath); //Folder that we are going to scan
        $Iterator = new RecursiveIteratorIterator($Directory); //Our iteration object
        $regex = new RegexIterator($Iterator, '/^.+\.(gif|jpg|jpeg|png|bmp)$/i', RecursiveRegexIterator::GET_MATCH); //the regex which will tell the iterator what to grab
        $picArray = array();
        //Loop through all images
        foreach ($regex as $file => $cur) {
            if ($noPath) $picArray[] = substr($cur[0], strpos($cur[0], '/') + 1);
            else $picArray[] = $cur[0];
        }
        return $picArray;
    }
    /**
     * Scan the thumb folder for pictures
     * @return RegexIterator
     */
    private function scanThumbs() {
        /* Setting up Recursive lookup  */
        $Directory = new RecursiveDirectoryIterator($this->thumbPath); //Folder that we are going to scan
        $Iterator = new RecursiveIteratorIterator($Directory); //Our iteration object
        $regex = new RegexIterator($Iterator, '/^.+\.(gif|jpg|jpeg|png|bmp)$/i', RecursiveRegexIterator::GET_MATCH); //the regex which will tell the iterator what to grab
        $thumbArray = array();
        //Loop through all images
        foreach ($regex as $file => $cur) $thumbArray[] = $cur[0];
        return $thumbArray;
    }
    /**
     * Function to calculate if we have enough memory
     * @param <type> $x
     * @param <type> $y
     * @param <type> $rgb
     * @return <type>
     */
    private function enoughmem($x, $y, $rgb = 3) {
        return ($x * $y * $rgb * 1.7 < MAXMEM - memory_get_usage());
    }
    /**
     * Create a basic Gallery File and save it
     */
    private function createGalleryFile() {
        $fileHandler = @fopen($this->xmlFile, 'w') or die("Unable to create the gallery file, make sure that the directory is writable and executable to the webbrowser.");
        /* Make the Main SimpleViewer XML Node */
        $sxe = "<simpleviewergallery/>";
        $xml = new SimpleXMLElement($sxe);
        /* Fill the Simpleviewer Node with the attributes */
        $xml->addAttribute('galleryStyle', $this->galleryStyle);
        $xml->addAttribute('title', $this->title);
        $xml->addAttribute('textColor', $this->textColor);
        $xml->addAttribute('frameColor', $this->frameColor);
        $xml->addAttribute('frameWidth', $this->frameWidth);
        $xml->addAttribute('thumbPosition', $this->thumbPosition);
        $xml->addAttribute('thumbColumns', $this->thumbColumns);
        $xml->addAttribute('thumbRows', $this->thumbRows);
        $xml->addAttribute('showOpenButton', $this->showOpenButton);
        $xml->addAttribute('showFullscreenButton', $this->showFullscreenButton);
        $xml->addAttribute('maxImageWidth', $this->maxImageWidth);
        $xml->addAttribute('maxImageHeight', $this->maxImageHeight);
        $xml->addAttribute('useFlickr', $this->useFlickr);
        $xml->addAttribute('flickrUserName', $this->flickrUserName);
        $xml->addAttribute('flickrTags', $this->flickrTags);
        $xml->addAttribute('languageCode', $this->languageCode);
        $xml->addAttribute('languageList', $this->languageList);
        $xml->addAttribute('imagePath', $this->imagePath);
        $xml->addAttribute('thumbPath', $this->thumbPath);
        $xml->addAttribute('thumb2Path', $this->thumb2Path);
        $xml->addAttribute('prevChangeDate', strftime('%Y-%m-%d %H:%I:%S', time()));
        $xml->addAttribute('lastChangeDate', strftime('%Y-%m-%d %H:%I:%S', time()));
        fwrite($fileHandler, $xml->asXML());
        fclose($fileHandler);
    }
    /**
     * Check if the necessary tables are present, and if not, create them
     */
    private function tryCreateDBTables() {
        $db = new SQLite3($this->dbName);
        $imageTableExists = ($db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='Images'")->fetchArray() != 0  ) ? true : false;
        $tagTableExists   = ($db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='Tags'")->fetchArray() != 0  ) ? true : false;
        $imagesWithTagsTableExists = ($db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='TaggedImages'")->fetchArray() != 0  ) ? true : false;

        if ( !$imageTableExists ) { 
            $db->exec('
                CREATE TABLE Images ( 
                    imageid INTEGER primary key, 
                    imageURL text, 
                    thumbURL text, 
                    thumb2URL text, 
                    size INTEGER, 
                    lastModified date, 
                    width INTEGER, 
                    height INTEGER,
                    filename text,
                    dominant_colour text, 
                    average_colour text
                )
            ');
        }
        if ( !$tagTableExists ) { 
            $db->exec('
                CREATE TABLE Tags (
                    tagid INTEGER primary key, 
                    parent INTEGER DEFAULT NULL, 
                    name text collate nocase unique, 
                    foreign key(parent) references Tags(tagid) on delete cascade)
            ');
            $db->exec('CREATE index Tags_Name_Index on Tags (name collate nocase)');
        }
        if ( !$imagesWithTagsTableExists ) { 
            $db->exec('
                CREATE TABLE TaggedImages (
                    tag INTEGER, 
                    image INTEGER, 
                    primary key (tag,image),
                    foreign key(tag) references Tags(tagid) on update cascade on delete cascade, 
                    foreign key(image) references Images(imageid) on update cascade on delete cascade
                )
            ');
        }
    }
    /**
     * Scans the Gallery File for all images and loads up the $xml variable
     * @return <array>
     */
    private function scanGalleryImages() {
        $this->xml = simplexml_load_file('gallery.xml');
        $imageArray = array();
        foreach ($this->xml->children() as $node) {
            $arr = $node->attributes();
            $imageArray[] = (string)$arr["imageURL"];
        }
        return $imageArray;
    }
    /**
     * Returns an array with the new images to be added
     * @param <array> $galleryArray
     * @param <array> $imageArray
     * @return <array>
     */
    private function getNewImages($galleryArray, $imageArray) {
        return array_diff($imageArray, $galleryArray);
    }
    /**
     * Returns an array with the deleted images which are not in the image folder
     * @param <array> $galleryArray
     * @param <array> $imageArray
     * @return <array>
     */
    private function getDeletedImages($galleryArray, $imageArray) {
        return array_diff($galleryArray, $imageArray);
    }
    /**
     * Delete the XML info and thumbs of images in the given array
     * @param <array> $deletedImages
     */
    private function deleteImageAssets($deletedImages) {
        $db = new SQLite3($this->dbName);
        foreach ($deletedImages as $image) {
            //Delete the thumbnail
            @unlink($this->thumbPath  . substr($image, strpos($image, '/') + 1));
            @unlink($this->thumb2Path . substr($image, strpos($image, '/') + 1));
            //Delete DB entry
            $db->exec("delete from Images where imageURL='$image'");
            //Fetch the xml object relative to the image url to be deleted
            $segs = $this->xml->xpath("image[@imageURL=\"$image\"]");
            $seg = $segs[0];
            $dom = dom_import_simplexml($seg);
            //Delete the Node
            $dom->parentNode->removeChild($dom);
        }
    }
    /**
     * Creates the thumbnails and adds the Images to the Gallery File
     * @param <array> $newImages
     */
    private function addNewImages($newImages) {
        $successfulAdds = 0;
        $this->images = new SimpleXMLElement("<images/>");
        $analyser = new ImageAnalyser(null, $this->googleSwatches);
        $db = new SQLite3($this->dbName);
        foreach ($newImages as $image) {
            /* Make an Image Node */
            $imgNode = new SimpleXMLElement("<image/>");
            /* Add the attributes */
            $imgNode->addAttribute('imageURL', $image);
            $imgNode->addAttribute('thumbURL', $this->thumbPath . substr($image, strpos($image, '/') + 1));
            $imgNode->addAttribute('thumb2URL', $this->thumb2Path . substr($image, strpos($image, '/') + 1));
            $imgNode->addAttribute('linkURL', '');
            $imgNode->addAttribute('linkTarget', '');
            $imgNode->addAttribute('size', filesize($image));
            $imgNode->addAttribute('lastModified', @filemtime($image));
            /* Add Filename Node to support newer version of SimpleViewer 2.0.3 */
            $filename = substr($image, strpos($image, '/') + 1);
            $imgNode->addChild('filename', $filename);
            /* Add an empty Caption Node to the ImageNode */
            $imgNode->addChild('caption');
            $extention = strtolower(substr($image, -3));
            if ($extention == "jpg" || $extention == "jpeg" || $extention == "png") {
                /* Create thumbnail for the image  */
                list($x, $y) = @getimagesize($image); //get size of img
                /* Add dimension attribute */
                $imgNode->addAttribute('width', $x);
                $imgNode->addAttribute('height', $y);
                $data;
                if ($this->enoughmem($x, $y)) {
                    //Open img file
                    $img = ($extention == "jpg" || $extention == "jpeg") ? @imagecreatefromjpeg($image) : @imagecreatefrompng($image);
                    $thumb = 110; //max. size of thumb , regular
                    if ($x > $y) {
                        $tx = $thumb; //landscape
                        $ty = round($thumb / $x * $y);
                    } else {
                        $tx = round($thumb / $y * $x); //portrait
                        $ty = $thumb;
                    }
                    if ($this->enoughmem($tx, $ty)) {
                        $thb = imagecreatetruecolor($tx, $ty); //create thumbnail
                        imagecopyresampled($thb, $img, 0, 0, 0, 0, $tx, $ty, $x, $y);
                        $targetThumb = $this->thumbPath . substr($image, strpos($image, '/') + 1);
                        if (!file_exists(dirname($targetThumb))) mkdir(dirname($targetThumb), 0777, true);
                        if ($extention == "jpg" || $extention == "jpeg") imagejpeg($thb, $targetThumb, 80);
                        else imagepng($thb, $targetThumb, 8);
                        imagedestroy($thb);
                        @chmod($targetThumb, 0755);
                    }
                    imagedestroy($img);
                    //Open img file
                    $img = ($extention == "jpg" || $extention == "jpeg") ? @imagecreatefromjpeg($image) : @imagecreatefrompng($image);
                    $thumb = 293; //max. size of thumb , 293
                    if ($x > $y) {
                        $tx = $thumb; //landscape
                        $ty = round($thumb / $x * $y);
                    } else {
                        $tx = round($thumb / $y * $x); //portrait
                        $ty = $thumb;
                    }
                    if ($this->enoughmem($tx, $ty)) {
                        $thb = imagecreatetruecolor($tx, $ty); //create thumbnail
                        imagecopyresampled($thb, $img, 0, 0, 0, 0, $tx, $ty, $x, $y);
                        $targetThumb = $this->thumb2Path . substr($image, strpos($image, '/') + 1);
                        if (!file_exists(dirname($targetThumb))) mkdir(dirname($targetThumb), 0777, true);
                        if ($extention == "jpg" || $extention == "jpeg") imagejpeg($thb, $targetThumb, 80);
                        else imagepng($thb, $targetThumb, 8);
                        $data = $analyser->GetColorInfoFromImage(imagecreatefromstring(file_get_contents( $targetThumb )), 2, ImageAnalyser::COLOR_HEX );
                        imagedestroy($thb);
                        @chmod($targetThumb, 0755);
                    }
                    $imgNode->addAttribute('dominant_colour', $data['Dominant']);
                    $imgNode->addAttribute('average_colour', $data['Average']);
                    imagedestroy($img);
                    //Add ImageNode to the list
                    $this->AddXMLElement($this->images, $imgNode);
                    //Add Image to DB
                    $imageURL = $imgNode["imageURL"];
                    $thumbURL = $imgNode["thumbURL"];
                    $thumb2URL = $imgNode["thumb2URL"];
                    $size = $imgNode["size"];
                    $lastModified = $imgNode["lastModified"];
                    $width = $x;
                    $height = $y;
                    $dominant = $imgNode["dominant_colour"];
                    $average = $imgNode["average_colour"];
                    $db->exec("INSERT INTO Images ( imageid,imageURL,thumbURL,thumb2URL,size,lastModified,filename,dominant_colour,average_colour,width,height ) VALUES ( null, '$imageURL', '$thumbURL', '$thumb2URL', '$size', '$lastModified','$filename', '$dominant', '$average', '$width', '$height')");
                    $successfulAdds++;
                }
                //Out of memory
                else {
                    $filename = substr($image, strpos($image, '/') + 1);
                    //Attempt to delete thumbs if any
                    @unlink($this->thumbPath  . $filename);
                    @unlink($this->thumb2Path . $filename);
                    //Attempt to move the picture to the error folder
                    if (copy($image, $this->woepsPath . $filename)) {
                        @unlink($image);
                    } else {
                        echo "Failed processing \"" . $image . "\" and moving it to " . $this->woepsPath . "\n";
                    }
                }
            }
            //Other format
            else {
                $this->AddXMLElement($this->images, $imgNode);
                $successfulAdds++;
            }
        }
        return $successfulAdds;
    }
    /**
     * Save the XML file back to disk
     */
    private function saveGallery() {
        $fileHandler = fopen($this->xmlFile, 'w');
        fwrite($fileHandler, $this->xml->asXML());
        fclose($fileHandler);
    }
    /**
     * Swap positions of XML Nodes
     * @param SimpleXMLElement $dest
     * @param SimpleXMLElement $source
     */
    private function AddXMLElement(SimpleXMLElement $dest, SimpleXMLElement $source) {
        $new_dest = $dest->addChild($source->getName(), $source[0]);
        foreach ($source->attributes() as $name => $value) {
            $new_dest->addAttribute($name, $value);
        }
        foreach ($source->children() as $child) {
            $this->AddXMLElement($new_dest, $child);
        }
    }
    /**
     * Sort all images
     */
    private function sort() {
        $db = new SQLite3($this->dbName);
        $newImagesNodes = $this->images->xpath('/images/image');
        $oldImagesNodes = $this->xml->xpath('image');
        //Fetch the xml object relative to the image url to be deleted
        $segs = $this->xml->xpath('image');
        foreach ($segs as $seg) {
            $dom = dom_import_simplexml($seg);
            //Delete the Node
            $dom->parentNode->removeChild($dom);
        }
        $appended = array_merge($newImagesNodes, $oldImagesNodes);
        usort($appended, function ($t1, $t2) {
            return strcmp($t2['lastModified'], $t1['lastModified']);
        });
        foreach ($appended as $imgNode) $this->AddXMLElement($this->xml, $imgNode);
    }
}
$wallgen = new WallGenerator();
$wallgen->start();
?>
