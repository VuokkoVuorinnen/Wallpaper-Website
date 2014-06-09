var api = new WallpaperApi();
var sorter = new Sorter();
var viewbox;
$(document).ready(function () {
    viewbox = new ViewBox('#container', { width: 290, height: 170 });
    viewbox.populateChild = function (child, data) {
        //tip: try to use jQuery's template system in here
        //child.hide();
        var image = data.Image.imageURL;
        var thumb = data.Image.thumb2URL;
        var id = data.Image.imageId;
        child.data('imageId', id);
        var img = $('<img/>');
        img.attr('src', api.GetImageUrl(thumb));
	var link = $('<a class="gallery" rel="group" target="_blank">');
	link.attr('href', api.GetImageUrl(image));
	link.append(img);
        child.append(link);
    };

    api.onLoading = function () {
        //console.log("loading");
        $('#Loading').fadeIn();

        $.get('https://wallpapers.carroarmato0.be/gallery.xml', function(data) {
            imagesXML = $(data);
            items = $(imagesXML).find("image").length;
            $('h3').text("Currently serving " + items + " images.");
        });

        $.get('https://wallpapers.carroarmato0.be/counter', function(data) {
             $('h4').text("Visitors: " + data);
        });

        var refreshId = setInterval(function() {
             $.get('https://wallpapers.carroarmato0.be/counter', function(data) {
                  $('h4').text("Visitors: " + data);
             });
        }, 30000);
    };

    api.onLoaded = function () {
        //console.log("loaded");
        $('#Loading').fadeOut();
        $('#header').fadeIn();
    };

    api.GetImages(function (data) {
        //console.log('data arrived');
        sorter.setData(data.Images);
        var sorted = sorter.sort('Image.imageid');
        viewbox.setChildren(sorted);
    });
});


function getData(children, dataSelector) {
    var data = Array();
    children.each(function () {
        data[data.length] = $(this).data(dataSelector);
    });
    return data;
}

var scrollDown = true;
var isScrolling = false;

function scrollContainerUp(speed) {
    //console.log("going up");
    $('#container').stop();
    var top = $('#container').scrollTop();
    var height = $('#container > div').height();
    $('#container').animate({ scrollTop: 0 }, top / speed, 'linear', function () {
        scrollDown = true;
        stopAnimation();
    });
}
function scrollContainerDown(speed) {
    $('#container').stop();
    var top = $('#container').scrollTop();
    var height = $('#container > div').height();
    //console.log("going down: " + height);
    $('#container').animate({ scrollTop: height }, (height - top) / speed, 'linear', 
	function () {
        scrollDown = false;
        stopAnimation();
    });
}

function scrollSlow() {
    if (!isScrolling) {
        //console.log("begin scrolling: " + isScrolling);
        isScrolling = true;
        var top = $('#container').scrollTop();
        var height = $('#container > div').height();
        //console.log(height - top);
        if (scrollDown) {
            $('#container').animate({ scrollTop: height }, (height - top) * 20, 'linear', function () {
                scrollDown = false;
                stopAnimation();
                scrollSlow();
            });
        } else {
            $('#container').animate({ scrollTop: 0 }, top * 20, 'linear', function () {
                scrollDown = true;
                stopAnimation();
                scrollSlow();
            });
        }
    }
}

function stopAnimation() {
    isScrolling = false;
    $('#container').stop();
}

