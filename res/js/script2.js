var items;
var prototype;
var scroll;
var imagesXML;
var iPrev;
var iRnd;
var nextImgTimer;
var showDebug = false;

//Test if console is supported or off!
if (showDebug) {
     try {   
          console.log("Debug Mode On");
     } catch (err) {
          showDebug = false;
     }
}

function getGallery() {
    $.get('counter', function(data) {
         if (showDebug) console.log("Visitor count fetched");
         $('h4').text("Visitors: " + data);
    });

    var refreshId = setInterval(function() {
         $.get('counter', function(data) {
              if (showDebug) console.log("Visitor count fetched");
              $('h4').text("Visitors: " + data);
         });
    }, 30000);


    $.get('gallery.xml', function(data) {
        if (showDebug) console.log("Gallery XML Fetched");
        imagesXML = $(data);
        items = $(imagesXML).find("image").length;
        $('h3').text("Currently serving " + items + " images.");

	    //if( items > 0 ) initializeBackground();

	    resizeHandler();
        scrollHandler();
    });
}

$(function () {
    prototype = $('#Prototype');
    prototype.hide();

    var container = $('#Container');
});

function LoadImage(iNr) {
    if (showDebug) console.log("Loading Background Image");
    var item =  $(imagesXML).find("image:nth-child(" + iNr + ")");
    var imageURL = "http://wallpapers.carroarmato0.be/" +  $(item).attr("imageURL");

    /* Assign the new image to the background */
    $("img#bg").attr("src", imageURL);

    /* Assign the image url to the description */
    $("a#image_url").attr("href", imageURL);
};

function LoadImages() {
    if (showDebug) console.log("Calculate Random number for background image");
    /* Select a new random image number */
    while(iPrev == iRnd) iRnd = Math.floor(Math.random()*items);
    /* Show the selected image */
    LoadImage(iRnd);
    iPrev = iRnd;
};

function resizeHandler(event) {
    if (showDebug) console.log("ResizeHandler Event");
    updateUIElements();
}

function scrollHandler() {
    var threshold = prototype.outerHeight(true);
    var currentScroll = $(window).scrollTop();
    if (Math.abs(currentScroll - scroll)  > threshold) {
        scroll = currentScroll;
        repositionElements();
    }
}

function initializeBackground() {
    if ( nextImgTimer == null ) setTimeout(LoadImages,1000);

    /* Define the function that triggers to fade in the background */
    $("img#bg").load(function() {
        if (showDebug) console.log("Background img loaded");

        /* Fade in during 3 seconds */
        $("img#bg").fadeTo(3000,1);
        $("#bg_grid").fadeTo(3000,1);

        /* Animate the picture description during 1 second */
        setTimeout(function() {
            $("#image_description").animate({right: '+=150'}, 1000)
        }, 1000);

        /* Set the timeout to fade out after 10 seconds*/
        nextImgTimer = setTimeout(function() {
            $("img#bg").fadeOut(3000);
            $("#bg_grid").fadeOut(3000);
            $("#image_description").animate({right: '-=150'}, 1000);

            /* Load the next image after 4 seconds */
            setTimeout(LoadImages,3000);
        },10000);
     }).error(function() {
         if (showDebug) console.log("Error loading Background, fetching another one");
         LoadImages();
     });

     $("#image_description").click(function() {
         window.open($(this).find("a").attr("href"));
     });

     $("#image_description").mouseover(function (){
         $("img#bg").css("z-index", 3);
         if ( nextImgTimer != null  ) {
             clearTimeout(nextImgTimer);
             if (showDebug) console.log("Halted the timer to fetch new background");
         }
     });

     $("#image_description").mouseout(function (){
         $("img#bg").css("z-index", 1);
         nextImgTimer = setTimeout(function() {
             $("img#bg").fadeOut(3000);
             $("#bg_grid").fadeOut(3000);
             $("#image_description").animate({right: '-=150'}, 1000);

             /* Load the next image after 4 seconds */
             setTimeout(LoadImages,3000);
         },10000);
         if (showDebug) console.log("Timer to fetch new background image started");
     });
}

$(document).ready(function() {
    if (showDebug) console.log("Document Ready");
    getGallery();

    $(window).resize(resizeHandler);

    scroll = $(window).scrollTop();
    $(window).scroll(scrollHandler);
    $(window).scroll();
});

var columns;
var rows;

function updateUIElements() {
    var height = prototype.outerHeight(true);
    var width = prototype.outerWidth(true)
    columns = Math.floor($('#Container').width() / width);
    rows = Math.ceil($(window).height() / height) + 3;

    var totalRows = Math.ceil(items / columns);

    var container = $('#Container');

    container.height(totalRows * height);
    if (showDebug) console.log(totalRows * height + ' = ' + totalRows + ' * ' + height);
    var elementCount = columns * rows;
    var children = container.children();
    for (var i = children.length; i < elementCount; i++) {
        var clone = prototype.clone();
        container.append(clone);
        clone.removeAttr('id');
        clone.show();
    }
    children = container.children();
    for (var i = children.length; i >= elementCount; i--) {
        var child = $(children[i]);
        child.remove();
    }

    repositionElements();
}

function repositionElements() {
    var container = $('#Container');
    var width = prototype.outerWidth(true);
    var height = prototype.outerHeight(true);

    var offsetRow = Math.floor(Math.max(0, $(window).scrollTop() - container.offset().top) / height)-1;
    var offset = offsetRow * height;

    if (showDebug) console.log(offset + 'px offset');
    var container = $('#Container');

    var children = container.children();

    var centerMargin = ($('#Container').width() - (width * columns)) / 2;

    for (var i = 0; i < children.length; i++) {
        var column = i % columns;
        var row = Math.floor(i / columns);

        var child = $(children[i]);

	    var index = (row + offsetRow) * columns + column;

        var w = child.outerWidth(true);
        var h = child.outerHeight(true);

        child.css({ left: centerMargin + w * column, top: offset + h * row });

    	if ((offsetRow + row) < 0 || offset + h * (row + 1) > container.height() || index >= items) {            
	        child.hide();
        } else {
    	    var item =  $(imagesXML).find("image:eq(" + (index) + ")");
            var imageURL = $(item).attr("imageURL");

	        //Check if gif (no thumbs)
            var ext = $(item).attr("thumbURL").substr( ($(item).attr("thumbURL").lastIndexOf('.') +1) );
    	    var thumbURL = $(item).attr("thumbURL");
    	    if ( ext == "gif") thumbURL = thumbURL.replace("thumbs","images");
    	    else thumbURL = thumbURL.replace("thumbs","thumbs293");
    	    var link = $('<a class="zoom" rel="group" target="_blank" href="http://wallpapers.carroarmato0.be/' + imageURL + '" >');
            var img = $('<img src="http://wallpapers.carroarmato0.be/' + thumbURL  + '" alt="' + (index) + '" />');
	        img.css({ height: child.height(), width: child.width() });
    	    $(link).append(img);
    	    $(link).fancybox();          
    	    child.children().remove();
            child.append(link);
            child.show();
        }
    }
}
