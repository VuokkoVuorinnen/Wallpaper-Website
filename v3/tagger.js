function Tagger(c) {
    var tagger = this;
    var tagList;
    this.getTag = function (id) {
        for (var i = 0; i < tagList.length; i++) {
            var tag = tagList[i].Tag;
            if (tag.id == id) return tag;
        }
    }

    this.bindSearch = function (autocompleteBoxSelector, inputSelector, tagFound) {
        var input = $(inputSelector);
        var autocompleteBox = $(autocompleteBoxSelector);
        input.bind('keypress', function (e) {
            var value = input.val();
            if (!e.altKey && !e.ctrlKey && e.charCode == 32) {
                value = value.trim();
                var found = tagger.findTag(value);
                if (found) {
                    tagFound(found);
                    input.val(null);
                }
            } else {
                autocompleteBox.children('.tagComplete').remove();
                for (var i in tagList) {
                    var tag = tagList[i];
                    if (tag.Tag.name.contains(value)) {
                        var div = $('<div class="tagComplete"></div>');
                        div.text(tag.Tag.name);
                        autocompleteBox.append(div);
                    }
                }
            }
        });
    }


    function isInQuotes(text) {
        var singleOpen = false;
        var doubleOpen = false;
        for (var i in text) {
            var char = text[i];
            if (char == "'") {
                if (!doubleOpen) singleOpen = !singleOpen;
            }
            if (char == '"') {
                if (!singleOpen) doubleOpen = !doubleOpen;
            }
        }
        return doubleOpen || singleOpen;
    }

    this.findTag = function (value) {
        value = value.toLowerCase().trim('');
        for (var i in tagList) {
            var tag = tagList[i];
            console.log(tag.Tag.name + '==' + value);
            if (tag.Tag.name.toLowerCase() == value) return tag;
        }
        return null;
    }
    this.addTag = function (id, value) {

    }
    this.removeTag = function (id) {
    }

    this.setTags = function (tags) {
        tagList = tags;
    }
    this.getTags = function () {
        return tagList;
    }
    this.tagClick = function (tag) {
        console.log(tag);
    };
}