{option:oPagination}
<ul class="pager">
    {option:oPrevious}<li><a href="/browse/page/{$previousLink}" class="navBtn">Previous</a></li>{/option:oPrevious}
    <li>
        {iteration:iPages}
        {option:oLink}<a href="/browse/page/{$pageLink}" {option:oCurrent}class="current"{/option:oCurrent}>{$pageNumber}</a>{/option:oLink}
        {option:oSkip}<a href="#">..</a>{/option:oSkip}
        {/iteration:iPages}
    </li>
    {option:oNext}<li><a href="/browse/page/{$nextLink}" class="navBtn">Next</a></li>{/option:oNext}
</ul>
{/option:oPagination}

{iteration:iPics}
{option:oFirstDate}
<div class="clearfloats">&nbsp;</div>
<div class="date first">{$date}</div>
{/option:oFirstDate}
{option:oNewDate}
<div class="clearfloats">&nbsp;</div>
<div class="date">{$date}</div>
{/option:oNewDate}
<div class="image">
    <a href="{$imgURL}" target="_blank">
        <img src="{$imgTHUMB}" alt="{$imgFILENAME}" />
        <div class="overlay">
            <ul>
                {option:oAdminEdit}<li><a class="editTags" href="#inline"><img class="edit" src="../../../core/img/icnEdit.gif" alt="{$imgID}" title="Edit" /></a></li>{/option:oAdminEdit}
                <li style="float: right;">{$imgRESOLUTION}</li>
            </ul>
            <div class="clearfloats">&nbsp;</div>
        </div>
    </a>
</div>
{/iteration:iPics}

<div style="display:none">
    <div id="inline">
        <img id="previewPic" src="" alt="" />
        <ul id="tags"></ul>
        <input id="submitTags" type="button" name="submitTags" value="Update" /><img id="status" style="display: none;" src="/modules/browse/img/icon_ok.gif" alt="ok" />
    </div>
</div>

<div class="clearfloats">&nbsp;</div>

{option:oPagination}
<ul class="pager">
    {option:oPrevious}<li><a href="/browse/page/{$previousLink}" class="navBtn">Previous</a></li>{/option:oPrevious}
    <li>
        {iteration:iPages2}
        {option:oLink}<a href="/browse/page/{$pageLink}" {option:oCurrent}class="current"{/option:oCurrent}>{$pageNumber}</a>{/option:oLink}
        {option:oSkip}<a href="#">..</a>{/option:oSkip}
        {/iteration:iPages2}
    </li>
    {option:oNext}<li><a href="/browse/page/{$nextLink}" class="navBtn">Next</a></li>{/option:oNext}
</ul>
{/option:oPagination}

{option:oNoWallpapers}
<p id="noWall">No Wallpapers currently,<br />please check back later!</p>
{/option:oNoWallpapers}