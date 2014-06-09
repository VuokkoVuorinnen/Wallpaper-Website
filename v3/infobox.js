function InfoBox(containerSelector, tagApi, zoomApi) {
    var tagger = tagApi;
    var zoombox = zoomApi;
    var container = $(containerSelector);
    var infoBox = this;
    var currentImage;
    var allImages;
    var currentImageIndex;
    this.setImages = function (images) {
        allImages = images;
    }

    this.showInfo = function (info) {
        currentImage = info;
        currentImageIndex = getCurrentIndex(info);
        $(document.body).unbind('keyup', handleKeys);
        $(document.body).bind('keyup', handleKeys);
        var div = $('<div class="infoBox"></div>');
        var a = $('<a class="close">Close</a>');
        a.click(function () {
            div.fadeOut(function () { $(this).remove(); });
            $(document.body).unbind('keyup', handleKeys);
        });
        div.append(a);
        var img = $('<img />');
        var url = info.Image.thumb2URL;
        img.attr('src', infoBox.path + url);
        div.append(img);
        div.hide();
        var colorDiv = $('<div class="colour">Color</div>');
        colorDiv.css('background-color', info.Image.dominant_colour);
        div.append(colorDiv);


        var sizeDiv = $('<div class="size"></div>');
        var filesizeDiv = $('<div class="size"></div>');
        sizeDiv.text(info.Image.width + ' x ' + info.Image.height);
        filesizeDiv.text(bytesToSize(info.Image.size, 2));
        div.append(sizeDiv);
        div.append(filesizeDiv);
        var tags = info.Image.tags;
        if (tags != null) {
            var tagsDiv = $('<div class="tags"></div>');
            tags = tags.split(',');
            for (var i in tags) {
                var tagId = tags[i];
                var tag = tagger.getTag(tagId);
                var tagA = $('<a></a>');
                tagA.text(tag.name);
                tagA.data('tag', tag);
                tagsDiv.append(tagA);
                console.log(tags);
            }
            div.append(tagsDiv);
        }

        var zoomIcon = $('<a target="_blank" class="zoom">zoom</a>');
        zoomIcon.click(function () { zoombox.zoom(info, 'Image.imageURL'); });
        div.append(zoomIcon);
        container.children('.infoBox').fadeOut(function () { $(this).remove(); });
        container.append(div);
        div.fadeIn();
    }
    function bytesToSize(bytes, precision) {
        var kilobyte = 1024;
        var megabyte = kilobyte * 1024;
        var gigabyte = megabyte * 1024;
        var terabyte = gigabyte * 1024;

        if ((bytes >= 0) && (bytes < kilobyte)) {
            return bytes + ' B';

        } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
            return (bytes / kilobyte).toFixed(precision) + ' KB';

        } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
            return (bytes / megabyte).toFixed(precision) + ' MB';

        } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
            return (bytes / gigabyte).toFixed(precision) + ' GB';

        } else if (bytes >= terabyte) {
            return (bytes / terabyte).toFixed(precision) + ' TB';

        } else {
            return bytes + ' B';
        }
    }
    function getCurrentIndex(image) {
        for (var i = 0; i < allImages.length; i++) {
            var img = allImages[i];
            if (img == image) return i;
        }
        return -1;
    }

    function next() {
        var nextIndex = currentImageIndex + 1;
        while (nextIndex >= allImages.length) nextIndex -= allImages.length;
        infoBox.showInfo(allImages[nextIndex]);
        return false;
    }
    
    function prev() {
        var prevIndex = currentImageIndex - 1;
        while (prevIndex < 0) prevIndex += allImages.length;
        infoBox.showInfo(allImages[prevIndex]);
        return false;
    }

    function handleKeys(e) {
        if (!e.shiftKey && e.ctrlKey && !e.altKey) {
            switch (e.keyCode) {
                case 39: // right arrow
                    next();
                    break;
                case 37:
                    prev();
                    break;
            }
        }
        e.handled = true;
        return false;
    }
}