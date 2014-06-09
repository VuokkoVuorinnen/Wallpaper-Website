<?php
class ImageAnalyser
{
    const COLOR_RGB = 0;
    const COLOR_HEX = 1;
    const COLOR_RAW = 2;
    const COLOR_HSV = 3;
    const COLOR_XYZ = 4;
    const COLOR_LAB = 5;
    private $colorWheel;
    public function __construct($colorCount = 15, $colorSet = null)
    {
        if($colorSet == null)
            $this->colorWheel = $this->generateColorWheel($colorCount);
        else
            $this->colorWheel = $colorSet;
    }
    
    public function GetColorSet()
    {
        return array_values($this->colorWheel);
    }
    public function GetColorInfoFromImage($image, $granularity = 1, $format = ImageAnalyser::COLOR_RGB)
    {
        $colorWheel = array_combine($this->colorWheel, array_fill(0, count($this->colorWheel), 0));
        $reds = $greens = $blues = $pixels = 0;
        
        $width = imagesx($image);
        $height = imagesy($image);
        for($x = 0; $x < $width; $x += $granularity)
        {
            for($y = 0; $y < $height; $y += $granularity)
            {
                $color = imagecolorat($image, $x, $y);
                $blue = 0xFF & ($color);
                $green = 0xFF & ($color >> 0x8);
                $red = 0xFF & ($color >> 0x10);
                
                $reds += $red;
                $greens += $green;
                $blues += $blue;
                
                $red = min(255,$red*1.5);
                $green = min(255,$green*1.5);
                $blue = min(255,$blue*1.5);
                
                
                //list($h, $s, $v) = $this->rgbToHsv($red, $green, $blue);
                //var_dump("$h $s $v <br/>");
                //list($red, $green, $blue) = $this->hsvToRgb($h, $s, 100);
                
                

                $color = $this->getColor($red, $green, $blue);
                
                //var_dump(dechex($color).'<br/>');
                //echo "$r = $red<br/>";
                
                list($closestColor, $closestDistance) = $this->findWheelColor($color);
                //var_dump($closestDistance);
                if($closestDistance < 50)
                    $colorWheel[$closestColor]++;
                
                $pixels++;
            }
        }
        $max = max($colorWheel);
        $dominant = array_search($max, $colorWheel);
        $average = $this->getColor($reds / $pixels, $greens / $pixels, $blues / $pixels);
        return array('Average' => $this->FormatColor($average, $format),
                     'Dominant' => $this->FormatColor($dominant, $format));
    }
    function de_1994($lab1,$lab2){
     $c1 = sqrt($lab1[1]*$lab1[1]+$lab1[2]*$lab1[2]);
     $c2 = sqrt($lab2[1]*$lab2[1]+$lab2[2]*$lab2[2]);
     $dc = $c1-$c2;
     $dl = $lab1[0]-$lab2[0];
     $da = $lab1[1]-$lab2[1];
     $db = $lab1[2]-$lab2[2];
     $dh = sqrt(($da*$da)+($db*$db)-($dc*$dc));
     $first = $dl;
     $second = $dc/(1+0.045*$c1);
     $third = $dh/(1+0.015*$c1);
     return(sqrt($first*$first+$second*$second+$third*$third));
}
  private function XYZtoCIELAB($x, $y, $z)
  {
    $refX = 100;
    $refY = 100;
    $refZ = 100;

    $x = $x / $refX;
    $y = $y / $refY;
    $z = $z / $refZ;

    if ($x > 0.008856) {
      $x = pow($x, 1/3);
    } else {
      $x = (7.787 * $x) + (16 / 116);
    }

    if ($y > 0.008856) {
      $y = pow($y, 1/3);
    } else {
      $y = (7.787 * $y) + (16 / 116);
    }

    if ($z > 0.008856) {
      $z = pow($z, 1/3);
    } else {
      $z = (7.787 * $z) + (16 / 116);
    }

    return array(
 (116 * $y) - 16,
       500 * ($x - $y),
       200 * ($y - $z),
    );
  }

  private function RGBtoXYZ($r, $g, $b)
  {
    $r  = $r / 255;
    $g  = $g / 255;
    $b  = $b / 255;

    if ($r > 0.04045) {
      $r  = pow((($r + 0.055) / 1.055), 2.4);
    } else {
      $r  = $r / 12.92;
    }

    if ($g > 0.04045) {
      $g  = pow((($g + 0.055) / 1.055), 2.4);
    } else {
      $g  = $g / 12.92;
    }

    if ($b > 0.04045) {
      $b  = pow((($b + 0.055) / 1.055), 2.4);
    } else {
      $b  = $b / 12.92;
    }

    $r  *= 100;
    $g  *= 100;
    $b  *= 100;

    //Observer. = 2°, Illuminant = D65
    return array($r * 0.4124 + $g * 0.3576 + $b * 0.1805,
      $r * 0.2126 + $g * 0.7152 + $b * 0.0722,
      $r * 0.0193 + $g * 0.1192 + $b * 0.9505,
    );
  }
    private function findWheelColor($color)
    {
        $blue = (0xFF & ($color));
        $green = (0xFF & ($color >> 0x8)) ;
        $red = (0xFF & ($color >> 0x10));
        
        list($x,$y,$z) = $this->RGBtoXYZ($red ,$green ,$blue );
        list($l, $a, $b) = $this->XYZtoCIELAB($x,$y,$z);
        
        $closestColor = 0xF0F0F0;
        $closestDistance = INF;
        foreach($this->colorWheel as $wheelColor)
        {
            $wheelBlue = (0xFF & ($wheelColor));
            $wheelGreen = (0xFF & ($wheelColor >> 0x8));
            $wheelRed = (0xFF & ($wheelColor >> 0x10));
            list($wheelX,$wheelY,$wheelZ) = $this->RGBtoXYZ($wheelRed ,$wheelGreen ,$wheelBlue );
            list($wheelL, $wheelA, $wheelB) = $this->XYZtoCIELAB($wheelX,$wheelY,$wheelZ);
/*
            $redSquare = pow($wheelRed - $red, 2);
            $greenSquare = pow($wheelGreen - $green, 2);
            $blueSquare = pow($wheelBlue - $blue, 2);           

            $xSquare = pow($wheelX - $x, 2);
            $ySquare = pow($wheelY - $y, 2);
            $zSquare = pow($wheelZ - $z, 2);

            $lSquare = pow($wheelL - $l, 2);
            $aSquare = pow($wheelA - $a, 2);
            $bSquare = pow($wheelB - $b, 2);
            */
            // yep, pythagoras, to lazy to implement the full CIE2000 implementation
            //$distance = sqrt($redSquare + $greenSquare + $blueSquare); 
            //$distance = sqrt($xSquare + $ySquare + $zSquare ); 
            //$distance = sqrt($lSquare + $aSquare + $bSquare) ; 
            
            $distance = $this->de_1994(array($wheelL, $wheelA, $wheelB), array($l, $a, $b));
            

            if($distance < $closestDistance){ $closestColor = $wheelColor; $closestDistance = $distance; }
        }
        return array($closestColor, $closestDistance) ;
    }
    
    private function generateColorWheel($colorCount)
    {
        $colors = Array();
        $skip = 360 / $colorCount;
        $saturation = 1;
        $value = 0.75;
            for($hue = 0; $hue < 360; $hue += $skip)
            {
                $normalizedHue = $hue / 360;
                list($red, $green, $blue) = $this->hsvToRgb($normalizedHue, $saturation, $value);
                $color = $this->getColor($red * 255, $green * 255, $blue * 255);
                $colors[] = $color;
            } 
        $colors[] = 0x000000; // add black
        //$colors[] = 0x7F7F7F; // add gray
        $colors[] = 0xffffff; // add white
        return $colors;
    }
    
    private function getColor($red, $green, $blue)
    {
        return (int)$blue + ((int)$green << 0x08) + ((int)$red << 0x10);
    }   
    // output color in rgb 255, 255, 255 or hex #FFFFFF
    public function FormatColor($color, $format = ImageAnalyser::COLOR_RGB)
    {
        if($format == ImageAnalyser::COLOR_RAW) return $color;
        
        $blue = 0xFF & ($color);
        $green = 0xFF & ($color >> 0x8);
        $red = 0xFF & ($color >> 0x10);
        switch($format)
        {
            case ImageAnalyser::COLOR_RGB:
                return $red . ', ' . $green . ', '.$blue;
            case ImageAnalyser::COLOR_XYZ:
                list($x,$y,$z) = $this->RGBtoXYZ($red, $green, $blue);
                return $x . ', ' . $y . ', '.$z;
            case ImageAnalyser::COLOR_LAB:
                list($x,$y,$z) = $this->RGBtoXYZ($red, $green, $blue);
                list($l,$a,$b) = $this->XYZtoCIELAB($x,$y,$z);
                
                return 'L* '.round($l,2) . ', A* ' . round($a,2) . ', B* '.round($b,2);
            case ImageAnalyser::COLOR_HSV:
                list($hue, $saturation, $value) = $this->rgbTohsv($red/255.0, $green/255.0, $blue/255.0);
                return round($hue * 360) . '°, ' . round($saturation * 100) . '%, ' . round($value * 100) .'%';
            case ImageAnalyser::COLOR_HEX:
                $redH = dechex($red);
                if(strlen($redH) == 1) $redH = '0'.$redH;
                $greenH = dechex($green);
                if(strlen($greenH ) == 1) $greenH = '0'.$greenH ;
                $blueH = dechex($blue);
                if(strlen($blueH ) == 1) $blueH = '0'.$blueH ;
                return '#' . $redH . $greenH . $blueH;  
            default:
                throw new Exception('Unsupported format ' . $format);
        }
    }
    
    // function is used to build color wheel
    private function hsvToRgb($hue, $saturation, $value)
    {
            // hue from 0..1 to 0..6
            $hue *= 6;
            
            // hue index: [0, 1, 2, 3, 4, 5]
            $I = floor($hue);
            // hue index to hue distance
            $F = $hue - $I;
            
            // color components
            $M = $value * (1 - $saturation);
            $N = $value * (1 - $saturation * $F);
            $K = $value * (1 - $saturation * (1 - $F));
            
            // reconstruct rgb
            switch ($I) {
                case 0:
                    list($red, $green, $blue) = array($value, $K, $M);
                    break;
                case 1:
                    list($red, $green, $blue) = array($N, $value, $M);
                    break;
                case 2:
                    list($red, $green, $blue) = array($M, $value, $K);
                    break;
                case 3:
                    list($red, $green, $blue) = array($M, $N, $value);
                    break;
                case 4:
                    list($red, $green, $blue) = array($K, $M, $value);
                    break;
                case 5:
                case 6: //for when $hue=1 is given
                    list($red, $green, $blue) = array($value, $M, $N);
                    break;
            }
            return array($red, $green, $blue);
    }       
    // not used, would be required for CIE2000
    private function rgbToHsv($red, $green, $blue)
    {
        if($red == 255 && $green = 255 && $blue == 255) return array(0, 1 ,100);
        //1
        $value = max($red,$green,$blue);
        //2
        $X = min($red,$green,$blue);
        //3
        $saturation = ($value-$X)/$value;
        if ($saturation == 0)
            throw new Exception("Hue is undefined: ".dechex($red).dechex($green).dechex($blue));
        //4
        $r = ($value-$red)/($value-$X);
        $g = ($value-$green)/($value-$X);
        $b = ($value-$blue)/($value-$X);
        //5
        if ($red == $value)
            $hue = $green==$X?(5+$b):(1-$g);
        elseif ($green == $value)
            $hue = $blue==$X?(1+$r):(3-$b);
        else
            $hue = $red==$X?(3+$g):(5-$r);
        //6
        $hue /= 6;
        return array($hue, $saturation, $value);
    }
}
?>
