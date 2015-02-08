/* 
 * webtrees: online genealogy
 * Copyright (C) 2015 webtrees development team
 * Copyright (C) 2015 JustCarmen
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// For the 'find indi' link
var pastefield; 
function paste_id(value) {
	pastefield.value = value;
}

// setup numbers for scroll reference
function addScrollNumbers() {
	jQuery(".generation-block:visible").each(function(){
		jQuery(this).find("a.scroll").each(function(){
			if(jQuery(this).text() == "" || jQuery(this).hasClass("add_num")) {
				var id = jQuery(this).attr("href");
				var fam_id = jQuery(id);
				var fam_id_index = fam_id.index() + 1;
				var gen_id_index = fam_id.parents(".generation-block").data("gen");
				if(fam_id.length > 0) {
					jQuery(this).text(TextFollow + gen_id_index + "." + fam_id_index).removeClass("add_num");
				}
				else { // fam to follow is in a generation block after the last hidden block.
					jQuery(this).text(TextFollow).addClass("add_num");
				}
			}
		});
	});
	if (jQuery(".generation-block.hidden").length > 0) { // there are next generations so prepare the links
		jQuery(".generation-block.hidden").prev().find("a.scroll").not(".header-link").addClass("link_next").removeClass("scroll");
	}
}

// remove button if there are no more generations to catch
function btnRemove() {
	if (jQuery(".generation-block.hidden").length == 0) { // if there is no hidden block there is no next generation.
		jQuery("#btn_next").remove();
	}
}

// set style dynamically on parents blocks with an image
function setImageBlock() {
	jQuery(".parents").each(function(){
		if(jQuery(this).find(".gallery").length > 0) {
			var height = jQuery(this).find(".gallery img").height() + 10 + "px";
			jQuery(this).css({"min-height" : height});
		}
	});
}

// Hide last generation block (only needed in the DOM for scroll reference. Must be set before calling addScrollNumbers function.)
var lastBlock = jQuery(".generation-block:last");
if(OptionsNumBlocks > 0 && lastBlock.data("gen") > OptionsNumBlocks) {
	lastBlock.addClass("hidden").hide();
}

// add scroll numbers to visible generation blocks when page is loaded
addScrollNumbers();

// Remove button if there are no more generations to catch
btnRemove();

// Set css class on parents blocks with an image
setImageBlock();

// remove the empty hyphen on childrens lifespan if death date is unknown.
jQuery("li.child .lifespan").html(function(index, html){
	// this does not work without &nbsp;
	return html.replace("–<span title=\"&nbsp;\"></span>", "");
});

// prevent duplicate id\'s
jQuery("li.family[id]").each(function(){
	var family = jQuery("[id="+this.id+"]");
	if(family.length>1){
		i = 1;
		family.each(function(){
			famID = jQuery(this).attr("id");
			anchor = jQuery("#fancy_treeview a.scroll[href$="+this.id+"]:first");
			anchor.attr("href", "#" + famID + "_" + i);
			jQuery(this).attr("id", famID + "_" + i);
			i++;
		});
	}
});

// scroll to anchors
jQuery("#fancy_treeview-page").on("click", ".scroll", function(event){
	var id = jQuery(this).attr("href");
	if(jQuery(id).is(":hidden") || jQuery(id).length === 0) {
		jQuery(this).addClass("link_next").trigger("click");
		return false;
	}
	var offset = 60;
	var target = jQuery(id).offset().top - offset;
	jQuery("html, body").animate({scrollTop:target}, 1000);
	event.preventDefault();
});

// Print extra information about the non-married spouse (the father/mother of the children) in a tooltip
jQuery(".tooltip").each(function(){
	var text = jQuery(this).next(".tooltip-text").html();
	jQuery(this).tooltip({
	   items: "[title]",
	   content: function() {
		 return text;
	   }
	});
});

//button or link to retrieve next generations
jQuery("#fancy_treeview-page").on("click", "#btn_next, .link_next", function(){
	if(jQuery(this).hasClass("link_next")) { // prepare for scrolling after new blocks are loaded
		var id = jQuery(this).attr("href");
		scroll = true
	}
	jQuery(".generation-block.hidden").remove(); // remove the last hidden block to retrieve the correct data from the previous last block
	var lastBlock = jQuery(".generation-block:last");
	var pids = lastBlock.data("pids");
	var gen  = lastBlock.data("gen");
	var url = jQuery(location).attr("pathname") + "?mod=" + moduleName + "&mod_action=show&rootid=" + RootID + "&gen=" + gen + "&pids=" + pids;
	lastBlock.find("a.link_next").addClass("scroll").removeClass("link_next");
	lastBlock.after("<div class=\"loading-image\">");
	jQuery("#btn_next").hide();
	jQuery.get(url,
		function(data){
			data = jQuery(data).find(".generation-block");
			jQuery(lastBlock).after(data);
			
			// hidden block must be set before calling addScrollNumbers function.
			var count = data.length;
			if(count === OptionsNumBlocks + 1) {
				jQuery(".generation-block:last").addClass("hidden").hide(); 
			}

			// scroll
			addScrollNumbers();
			if (scroll == true) {
				var offset = 60;
				var target = jQuery(id).offset().top - offset;
				jQuery("html, body").animate({scrollTop:target}, 1000);
			}

			jQuery(".loading-image").remove();
			jQuery("#btn_next").show();

			// check if button has to be removed
			btnRemove();

			// check for parents blocks with images
			setImageBlock();
		}
	);
});
