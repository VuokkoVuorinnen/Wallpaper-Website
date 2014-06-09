function ZoomBox(boxSelector) {
    var zoomBox = this;
    var box = new $(boxSelector);
    box.hide();
    this.path = './';
    var currentSelector;
    var currentImages;
    var currentImageIndex;

    var next = $('<a class="next">Next</a>');
    var prev = $('<a class="prev">Previous</a>');
    box.append(next);
    box.append(prev);

    next.click(function () {
        var nextIndex = currentImageIndex + 1;
        while (nextIndex >= currentImages.length) nextIndex -= currentImages.length;
        zoombox.zoom(currentImages[nextIndex], currentSelector);
        return false;
    });
    prev.click(function () {
        var prevIndex = currentImageIndex - 1;
        while (prevIndex < 0) prevIndex += currentImages.length;
        zoombox.zoom(currentImages[prevIndex], currentSelector);
        return false;
    });

    box.click(function () {
        fadeOutImages();
        $(this).fadeOut();

        $(document.body).unbind('keyup', handleKeys);
    });

    this.setImages = function (images, selector) {
        currentImages = images;
        currentSelector = selector;
    }
    function handleKeys(e) {
        console.log(e);
        if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
            switch (e.keyCode) {
                case 39: // right arrow
                    next.click();
                    break;
                case 37:
                    prev.click();
                    break;
            }
        }
        e.handled = true;
        return false;
    }
    this.zoom = function (image, selector) {
        $(document.body).bind('keyup', handleKeys);
        currentImageIndex = getCurrentIndex(image, selector);
        if (currentImageIndex >= 0) { next.show(); prev.show(); } else { next.hide(); prev.hide(); }
        box.css('backgroundColor', getColor(image.Image.average_colour, 0.95));
        box.fadeIn(function () {
            var url = zoomBox.path + getData(image, selector);
            var img = $('<img/>');
            img.hide();
            box.find('.loading').fadeIn();
            fadeOutImages();
            var imgDiv = $('<div class="img"></div>');
            imgDiv.append(img);
            box.append(imgDiv);
            img.load(function () {
                img.fadeIn(1000);
                box.find('.loading').fadeOut();
            });
            img.attr('src', url);
        });
    }


    function getColor(hexStr, alpha) {

        /* note: hexStr should be #rrggbb */
        var hex = parseInt(hexStr.substring(1), 16);
        var rcolor = (hex & 0xff0000) >> 16;
        var gcolor = (hex & 0x00ff00) >> 8;
        var bcolor = (hex & 0x0000ff);
        var result = 'rgba(' + rcolor + ',' + gcolor + ',' + bcolor + ',' + alpha + ')';
        
        return result;


    }

    function getCurrentIndex(image, selector) {
        var url = getData(image, selector);
        for (var i = 0; i < currentImages.length; i++) {
            var img = getData(currentImages[i], selector);
            if (img == url) return i;
        }
        return -1;
    }

    function getData(dataObj, selector) {
        var value = dataObj;
        var selectorSplit = selector.split('.');
        for (var i in selectorSplit) {
            var selectorPart = selectorSplit[i];
            value = value[selectorPart];
        }
        return value;
    }

    function fadeOutImages() {
        box.children('.img').fadeOut(function () { $(this).remove(); });
    }
}