var api = new WallpaperApi();
var sorter = new Sorter();
var zoombox;
var tagger;
var viewbox;
var infoBox;
$(document).ready(function () {
    zoombox = new ZoomBox('#zoomBox');
    zoombox.path = api.GetImageUrl('');
    tagger = new Tagger();
    infoBox = new InfoBox('#InfoBox>div', tagger, zoombox);
    infoBox.path = api.GetImageUrl('');
    viewbox = new ViewBox('#container', { width: 290, height: 170 });
    // viewbox.setChildren(Array('hello (1)', 'world (2)', 'this (3)', 'is (4)', 'me (5)', 'going (6)', 'to (7)', 'hear (8)', 'my (9)', 'prayers (10)', 'give (11)', 'me (12)', 'give (13)', 'me (14)', '.. (15)'));
    viewbox.populateChild = function (child, data) {
        //tip: try to use jQuery's template system in here
        //child.hide();
        var image = data.Image.imageURL;
        var thumb = data.Image.thumb2URL;
        var id = data.Image.imageId;
        child.data('imageId', id);
        var img = $('<img/>');
        img.attr('src', api.GetImageUrl(thumb));
        child.append(img);
        addTags(child);

        var tagsIcon = $('<a target="_blank" class="tags"></a>');
        if (data.Image.tags)
            tagsIcon.text(data.Image.tags.split(',').length);
        else
            tagsIcon.text(0);
        child.append(tagsIcon);

        var dlIcon = $('<a target="_blank" class="download">download</a>');
        dlIcon.attr('href', api.GetImageUrl(image));
        child.append(dlIcon);
        var zoomIcon = $('<a target="_blank" class="zoom">zoom</a>');
        zoomIcon.click(function () { zoombox.zoom(data, 'Image.imageURL'); });
        child.append(zoomIcon);

        img.click(function () {
            infoBox.showInfo(data);
            return false;
        });
        //child.fadeIn();

    };

    tagger.bindSearch('#searchBox .complete', '#searchBox input', function (tag) {
        console.log(tag);
        var div = $('<a class="tag"></a>');
        div.text(tag.Tag.name);
        div.data('Tag', tag);
        div.click(function () {
            div.remove();
            search(getData($('#searchBox').children('.tag'), 'Tag'));
        });
        $('#searchBox').append(div);
        search(getData($('#searchBox').children('.tag'), 'Tag'));
    });

    api.onLoading = function () {
        console.log("loading");
        $('#Loading').fadeIn();
    };

    api.onLoaded = function () {
        console.log("loaded");
        $('#Loading').fadeOut();
    };

    api.GetTagCloud(function (data) {
        tagger.setTags(data.Tags);
    });

    api.GetImages(function (data) {
        console.log('data arrived');
        sorter.setData(data.Images);
        var sorted = sorter.sort('Image.imageid');
        viewbox.setChildren(sorted);
        infoBox.setImages(sorted);
        zoombox.setImages(sorted, 'Image.imageURL');
    });

    $('#sortFilesize').click(function () {
        var sorted = sorter.sort('Image.size');
        viewbox.setChildren(sorted);
        zoombox.setImages(sorted, 'Image.imageURL');
        infoBox.setImages(sorted);
        setSortSelector(this, sorter.currentAscend);
    });
    $('#sortDate').click(function () {
        var sorted = sorter.sort('Image.lastModified');
        viewbox.setChildren(sorted);
        zoombox.setImages(sorted, 'Image.imageURL');
        infoBox.setImages(sorted);
        setSortSelector(this, sorter.currentAscend);
    });
    $('#sortImageSize').click(function () {
        var sorted = sorter.sort('Image.width');
        viewbox.setChildren(sorted);
        zoombox.setImages(sorted, 'Image.imageURL');
        infoBox.setImages(sorted);
        setSortSelector(this, sorter.currentAscend);
    });
    $('#sortTags').click(function () {
        var sorted = sorter.sort('Image.tags', null, function (value) {
            if (value)
                return value.split(',').length;
            return -1;
        });
        viewbox.setChildren(sorted);
        zoombox.setImages(sorted, 'Image.imageURL');
        infoBox.setImages(sorted);
        setSortSelector(this, sorter.currentAscend);
    });

    $('#InfoPanel .handle').click(function () {
        var panel = $('#InfoPanel');
        if (panel.is('.up')) {
            panel.addClass('down');
            panel.removeClass('up');
        } else {
            panel.addClass('up');
            panel.removeClass('down');
        }
    });

    $('a.scrollUp').click(function () {
        if ($(this).is('.active')) {
            stopAnimation();
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
            scrollContainerUp(1);
        }
        $('a.scrollDown').removeClass('active');
    });
    $('a.scrollDown').click(function () {
        if ($(this).is('.active')) {
            stopAnimation();
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
            scrollContainerDown(1);
        }
        $('a.scrollUp').removeClass('active');
    });

    var colorsDiv = $('#colours');
    var colors = Array('CC0000', 'FB940B', 'FFFF00', '00cc00', '03c0c6', '0000ff', '762ca7', '7798bf', 'ffffff', '999999', '000000', '885418');
    for (var i in colors) {
        var color = '#' + colors[i];
        var div = $('<div class="colour"></div>');
        div.css('background-color', color);
        div.data('colour', color);
        div.click(function () {
            var colour = $(this).data('colour').toLowerCase();
            filter(function (item) {
                return item.Image.dominant_colour.toLowerCase() == colour;
            });
        });
        colorsDiv.append(div);
    }
});


function getData(children, dataSelector) {
    var data = Array();
    children.each(function () {
        data[data.length] = $(this).data(dataSelector);
    });
    return data;
}
function search(tags) {
    filter(function (item) {
        if (item.Image.tags) {
            var tagIds = item.Image.tags.split(',');
            for (var i in tags) {
                var tag = tags[i];
                var contains = false;
                for (var o in tagIds) {
                    var id = tagIds[o];
                    if (id == tag.Tag.id) {
                        contains = true;
                        break;
                    }
                }
                if (!contains) {
                    return false;
                }
            }
            return true;
        }
    });
}

function filter(callback) {
    var sorted = sorter.getCurrent().slice();
    var filtered = Array();
    for (var i in sorted) {
        item = sorted[i];
        if (callback(item)) filtered.push(item);
    }

    if (filtered.length < 200)
        console.log(filtered);
    console.log(filtered.length);
    viewbox.setChildren(filtered);
    zoombox.setImages(filtered, 'Image.imageURL');
    infoBox.setImages(filtered);
}

function setSortSelector(link, ascend) {
    $('#sort').find('a').removeClass('ascend').removeClass('descend');
    $(link).addClass(ascend ? 'ascend' : 'descend');
}

function addTags(child) {
    var id = child.data('imageId');
}

var scrollDown = true;
var isScrolling = false;

function scrollContainerUp(speed) {
    console.log("going up");
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
    console.log("going down: " + height);
    $('#container').animate({ scrollTop: height }, (height - top) / speed, 'linear', function () {
        scrollDown = false;
        stopAnimation();
    });
}

function scrollSlow() {
    if (!isScrolling) {
        console.log("begin scrolling: " + isScrolling);
        isScrolling = true;
        var top = $('#container').scrollTop();
        var height = $('#container > div').height();
        console.log(height - top);
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

