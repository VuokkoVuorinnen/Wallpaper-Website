<?php

require_once '../core/includes/config.php';
require_once '../library/plonk/plonk.php';
require_once '../library/plonk/filter/filter.php';
require_once '../library/plonk/session/session.php';

class API {
    private $allowedRequests = array (
        'getImageByID',
        'getImages',
        'tagImage',
        'getTags',
        'getTagCloud',
        'getImagesSince'
    );
    private $allowedFormat   = array ('xml', 'json');
    private $db;

    protected $request;
    protected $output;

    /**
     * Internal Mechanism
     */
    public function __construct() {
        header("Access-Control-Allow-Origin: *");
        if(!ob_start("ob_gzhandler")) ob_start();
        $this->db       = new SQLite3('../'.SQLite3_DB_NAME);
        $this->db->exec("PRAGMA foreign_keys = 1");
        $this->request  = PlonkFilter::getGetValue('request', $this->allowedRequests, null);
        $this->output   = PlonkFilter::getGetValue('format' , $this->allowedFormat  , 'json');
        $this->processRequest();
    }
    private function AddXMLElement(SimpleXMLElement $dest, SimpleXMLElement $source) {
        $new_dest = $dest->addChild($source->getName(), $source[0]);
        foreach ($source->attributes() as $name => $value) $new_dest->addAttribute($name, $value);
        foreach ($source->children() as $child) $this->AddXMLElement($new_dest, $child);
    }
    private function processRequest() {
        $answer = null;
        if ( in_array( $this->request, $this->allowedRequests ) ) {
            $answer = call_user_func(array($this,$this->request));
        } else {
            die(file_get_contents("help.html") );
        }

        $outputFormat = 'output' . strtoupper($this->output);
        call_user_func(array($this,$outputFormat), $answer);
    }
    private function outputJSON($response) {
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');
        //header('Content-Type: text/javascript;charset=utf-8');
        echo json_encode($response);
    }
    private function outputXML($response) {
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: text/xml');        
        $xml = new SimpleXMLElement('<Response/>');
        //$response = array_flip($response);
        //var_dump($respone);
        //array_walk_recursive($response, array ($xml, 'addChild'));
        
        $this->array_to_xml($response, $xml);
        
        echo $xml->asXML();
    }
    private function array_to_xml($student_info, &$xml_student_info) {       
        foreach($student_info as $key => $value) {
            if(is_array($value)) {
                if(!is_numeric($key)){
                    $subnode = $xml_student_info->addChild("$key");
                    $this->array_to_xml($value, $subnode);
                }
                else{
                    $this->array_to_xml($value, $xml_student_info);
                }
            }
            else {
                $xml_student_info->addChild("$key","$value");
            }
        }
    }

    /**
     *  API Call Handlers
     */
    
    /**
     * Fetches the requested image with all it's info
     * @return Image Properties and Tags
     */
    private function getImageByID() {
        $id = PlonkFilter::getGetValue('id', null, null, true, 'int');
        if ($id != null) {
            $query = $this->db->query("select Images.*, group_concat(distinct TaggedImages.tag) as tags from Images left join TaggedImages on Images.imageid = TaggedImages.image where Images.imageid = '$id'");

            if ( !empty($query) ) {
                header("Status: 200 OK");
                return array("Image" => $query->fetchArray(SQLITE3_ASSOC));
            } else {
                header("Status: 404 Not Found");
                return array();
            }
        } else {
            header("Status: 400 Bad Request");
            return array("debug" => 'Missing "id" parameter');
        }
    } 
    /**
     * Get all exisiting Images with all their info
     */
    private function getImages() {
        $query = $this->db->query("select Images.*, group_concat(distinct TaggedImages.tag) as tags from Images left join TaggedImages on Images.imageid = TaggedImages.image group by Images.imageid");
        
        $resultArr = array();
        
        while ($image = $query->fetchArray(SQLITE3_ASSOC) ) {
            $resultArr[] = array('Image' => $image);
        }
        
        if ( !empty($resultArr) ) {
            header("Status: 200 OK");
            return array('Images' => $resultArr);
        } else {
            header("Status: 404 Not Found");
            return array();
        }
    }
    /**
     * Adds Tags to the supplied Image. Creates missing Tags. 
     */
    private function tagImage() {
        if ( !PlonkSession::exists("admin") ) {
            header("Status: 401 Unauthorized");
            return array("debug" => 'You have no permission to perform this action.');
        }
        $data = PlonkFilter::getGetValue('data', null, null, true);
        if ($data != null) {
            $data = json_decode($data, false);
            if (!empty($data) && count($data) > 0 && PlonkFilter::isNumeric($data[0])) {
                $id = $data[0];
                $tagNames = array_splice($data, 1);
                //Escape everything properly
                $tmp = array();
                $tagIDs = null;
                //Attempt to create new Tags bij Inserting them (already existing ones will be ignored)
                foreach ($tagNames as $tag) {
                    $tag = $this->db->escapeString($tag);
                    $tmp[] = $tag;
                    $this->db->exec("insert or ignore into Tags (name) values('$tag')");
                }
                $tagNames = $tmp;
                //Fetch the Tag ID's of the Tags we are interested in
                $tagIDs = $this->db->query('select tagid from Tags where name in (\'' . implode('\',\'', $tagNames) . '\');');
                $tags = array();
                //Delete all old Image-Tag associations of our Image
                $this->db->exec("delete from TaggedImages where image = '$id'");
                //Add our new Image-Tag associations
                while ($tag=$tagIDs->fetchArray(SQLITE3_ASSOC)) {
                    $tag = $tag["tagid"];
                    $tags[] = $tag;
                    $this->db->exec("insert into TaggedImages (tag,image) values('$tag','$id')");
                }
                header("Status: 200 OK");
                return array("tags" => implode(',', $tags));
            } else {
                header("Status: 406 Not Acceptable");
                return array("debug" => 'Empty or malformed "data" parameter. First value must be an image ID followed by Tag names, example: [432,"Scenery","Video Games"]');
            }
        } else {
            header("Status: 400 Bad Request");
            return array("debug" => 'Missing "data" parameter.');
        }
    }
    /**
     * Gets all available Tags 
     */
    private function getTags() {
        $res = $this->db->query("select * from Tags");
        $resArr = array();
        while ($tag=$res->fetchArray(SQLITE3_ASSOC)) {
            $resArr[] = array ( "Tag" => array (
                    'id' => $tag["tagid"],
                    'name' => $tag["name"]
                )
            );
        }    
        if ( !empty($resArr) ) {
            header("Status: 200 OK");
            return array("Tags" => $resArr);
        } else {
            header("Status: 404 Not Found");
            return array();
        }
    }
    /**
     * Fetches Tags with the amount of images associated with them 
     */
    private function getTagCloud() {
        $res = $this->db->query('select Tags.tagid, Tags.name, count (distinct TaggedImages.image) as total from TaggedImages join Tags on Tags.tagid = TaggedImages.tag group by TaggedImages.tag order by Tags.name;');
        $resArr = array();
        while ($tag=$res->fetchArray(SQLITE3_ASSOC)) {
            $resArr[] = array('Tag' => array (
                    'id' => $tag['tagid'],
                    'name' => $tag["name"],
                    'count' => $tag["total"]
                )
            );
        }
        header("Status: 200 OK");
        return array('Tags' => $resArr);
    }
    /**
     * Fetch all images since a certain timestamp or image ID
     * @return Images
     */
    private function getImagesSince() {
        $id = PlonkFilter::getGetValue('id', null, 0, true, 'int');
        $timestamp = PlonkFilter::getGetValue('timestamp', null, 0, true, 'int');
        
        if ( $id == 0 && $timestamp == 0 ) {
            header("Status: 400 Bad Request");
            return array("debug" => 'Missing "id" or "timestamp" parameter');
        } else if ( $id != 0 && $timestamp != 0 ) {
            header("Status: 400 Bad Request");
            return array("debug" => 'Only 1 parameter at a time is allowed');
        } else if ( $id != 0 && $timestamp == 0 ) {
            // ID requested
            $query = $this->db->query("select Images.*, group_concat(distinct TaggedImages.tag) as tags from Images left join TaggedImages on Images.imageid = TaggedImages.image where imageid > '$id' group by Images.imageid");
            $resultArr = array();
            while ($image = $query->fetchArray(SQLITE3_ASSOC) ) {
                $resultArr[] = array('Image' => $image);
            }
            if ( !empty($resultArr) ) {
                header("Status: 200 OK");
                return array('Images' => $resultArr);
            } else {
                header("Status: 404 Not Found");
                return array();
            }
        } else {
            // Timestamp requested
            $query = $this->db->query("select Images.*, group_concat(distinct TaggedImages.tag) as tags from Images left join TaggedImages on Images.imageid = TaggedImages.image where lastModified > '$timestamp' group by Images.imageid");
            $resultArr = array();
            while ($image = $query->fetchArray(SQLITE3_ASSOC) ) {
                $resultArr[] = array('Image' => $image);
            }
            if ( !empty($resultArr) ) {
                header("Status: 200 OK");
                return array('Images' => $resultArr);
            } else {
                header("Status: 404 Not Found");
                return array();
            }
        }
    }
}
$api = new API();
?>
