var DOMAIN = "http://wallpapers.carroarmato0.be/";
var availableTags;
var tagNames;


function fetchTags() {
    $.ajax({
        url: "/api/",
        type: "GET",
        data: "request=getTags&format=json",
        success: function(data) {
            availableTags = data.Tags;
            tagNames = $(availableTags).map(function() {return this.Tag.name;}).get()
        }
    });
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function synchTags(data) {
    $.ajax({
        url: "/api/",
        type: "GET",
        dataType: "json",
        data: "request=tagImage&data="+JSON.stringify(data),
        success: function(resp, status) {
            if (resp.hasOwnProperty("tags") ) {
                $("#status").show();
            }
        }
    });
}

$(document).ready(function() {
    
    $("#submitTags").click(function(){      
        var imgID = [$("#previewPic").attr('alt')];
        var tags  = $("#tags").tagit("assignedTags");
        var data = imgID.concat(tags);
        synchTags(data);
    });

    $("a.editTags").click(function() {
        fetchTags();
        
        $("#tags").tagit("removeAll");
        $("#status").hide();
        
        var imgID = jQuery("img", this).attr("alt");
        $.ajax({
            url: "/api/",
            type: "GET",
            data: "request=getImageByID&format=json&id="+imgID,
            success: function(data) {
                $("#previewPic").attr('src', DOMAIN + data.Image.thumb2URL );
                $("#previewPic").attr('alt', imgID );
                
                $("#tags").tagit({
                    availableTags: tagNames,
                    animate: false,
                    placeholderText: "enter tag",
                    onTagAdded: function(event, tag) {
                        $("#status").hide();
                    },
                    onTagRemoved: function(event, tag) {
                        $("#status").hide();
                    }
                });
                
                $('.ui-autocomplete-input').focus();
                
                if (data.Image.tags != null) {
                    var tags = data.Image.tags.split(',');
                    
                    $.each(tags, function(i, val){
                        var tag = getObjects(availableTags, 'id', parseInt(val));
                        $("#tags").tagit("createTag", tag[0].name);
                    });
                }              
                
            }
        });
    });
    
    $("a.editTags").fancybox();

});