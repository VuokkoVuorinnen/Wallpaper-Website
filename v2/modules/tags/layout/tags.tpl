{option:oHasTags}
<ul id="tagCloud">
{iteration:iTags}
<li><a style="font-size: {$tagSize}px" href="{$tagURL}">{$tagName}</a></li>
{/iteration:iTags}
</ul>
{/option:oHasTags}
{option:oNoTags}
<p id="noTags">No Wallpapers have been tagged currently,<br />please check back later!</p>
{/option:oNoTags}