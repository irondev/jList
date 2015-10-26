jList 1.4.1

* ChangeLog:
* v1.4.1 (25/10/2015)
* - new options for slide : option {currentPaging:false|DOM element, totalPaging:false|DOM element}
* v1.4 (01/04/2014)
* - new option for slide : option {nav:false|DOM element}
* v1.3.1 (07/03/2014)
* - implement a new method multiplebox
* v1.3 (14/02/2014)
* - implement a new method box
* - Bug fix : removeAttr for slide prev
* v1.2.3.1 (16/11/2013)
* - Bug fix : hide paging button if no content
* v1.2.3 (07/11/2013)
* - Bug fix : remove previous events with off() on init
* - Upgrade method paging : loading class on the button, replace .fadeOut() by .hide() on complete
* - Replace .size() by .length
* v1.2.2 (29/10/2013)
* - Bug fix : node >= 3 fixed
* v1.2.1 (08/10/2013)
* - Upgrade option arrows : now available for fade
* v1.2 (17/05/2013)
* - Upgrade option arrows : now configurable with specific DOM elements
* v1.1.5 (07/01/2012)
* - Bug fix : use children("li").size() instead of find("li").size() to count itemNum
* v1.1.4 (09/11/2012)
* - Upgrade option active : now available for slide and fade
* v1.1.3 (22/10/2012)
* - Bug fix for slide and scroll : itemSize now use .outerWidth(true)/.outerHeight(true) instead of .width()/.height()
* - New option for tabs : option {active:integer|"random"} set the default tab, therefore option {random:true} is no more used for tabs
* v1.1.2 (17/10/2012)
* - Bug fix for paging : hide button if itemNum % originalItemNum > 0
* v1.1.1 (03/10/2012)
* - Bug fix IE8- : $.trim() instead of .trim()
* - Bug fix IE8- : no comma at the end of objects
* v1.1 (28/09/2012)
* - New method paging / $("ul").jList('paging') / options : auto, ajax
* v1.0 (14/09/2012)
* - $("ul").jList('slide') / options : position, node, move, speed, auto, loop, arrows
* - $("ul").jList('scroll') / options : position, node, speed, ajax
* - $("ul").jList('fade') / options : speed, random, auto, ajax, arrows
* - $("ul").jList('tabs') / options : random, auto, ajax
*
* Roadmap:
* v1.x : 
* - implement an ajax option for the slide method
* - implement a callback option for all methods
* - implement pushState
* v2 : jQuery 2 compliant