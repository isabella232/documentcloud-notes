$(function(){

	var notes = {}; 

	var currentQuery; 
	var lgQuery = window.matchMedia("(min-width:1200px)");
	var mdQuery = window.matchMedia("(min-width:980px) and (max-width:1199px)"); 
	var smQuery = window.matchMedia("(min-width:768px) and (max-width:979px)"); 
	var xsQuery = window.matchMedia("(max-width:767px)"); 

    var resizeTimer; //set resizeTimer to empty so it resets on page load

	var init = function (){
		findNotes(); 
        //on resize, run the function and reset the timeout
        //250 is the delay in milliseconds. Can be adjust as you see fit. 
        $(window).resize(function() {
            clearTimeout(resizeTimer); 
            resizeTimer = setTimeout(checkSize, 250); 
        });  
    }

    var findNotes = function() {
    	var noteDiv = $(".DC-note-container"); 
    	$.each(noteDiv, function() {
    		getCoords(this); 
            swapURL(this);
    	});
    }

    //link notes to wapo embedder pages instead of document cloud
    var swapURL = function(note) {
        var note = $(note); 
        if (note.data('wapo')) {
            var newLink = note.data('wapo'); 
            note.find('a').attr('href', newLink); 
            note.find('a').attr('target', '_blank');
        }
    }	

    var getCoords = function (note) {
    	var noteID = $(note).attr('id');  

    	var wrapWidth = $("#"+noteID+" .DC-note-excerpt").width(),
    	docWidth = $("#"+noteID+" .DC-note-image").width(),
    	docTop = $("#"+noteID+" .DC-note-image").position().top,
    	lCoverWidth = $("#"+noteID+" .DC-left-cover").width(),
    	rCoverWidth = $("#"+noteID+" .DC-right-cover").width(),
    	excerptHeight = $("#"+noteID+" .DC-note-excerpt").height(), 
    	excerptLeft = $("#"+noteID+" .DC-note-excerpt").position().left;
    	excerptWidth = $("#"+noteID+" .DC-note-excerpt").width(); 

    	if (docWidth != 0 && !(notes[noteID])) { //don't store notes that are set to display none
    		var x1 = lCoverWidth,
	    	y1 = (docTop)*-1;

	  		var x2 = x1 + (750 - (lCoverWidth+rCoverWidth)), 
	  		y2 = y1 + excerptHeight; 

	  		var noteWidth = (x2-x1);

	  		var note = {
	  			x1: x1, 
	  			x2: x2, 
	  			y1: y1, 
	  			y2: y2, 
	  			noteID: noteID, 
	    		wrapWidth: wrapWidth, 
	    		docWidth: docWidth, 
	    		docTop: docTop, 
	    		lCoverWidth: lCoverWidth, 
	    		rCoverWidth: rCoverWidth, 
	    		excerptHeight: excerptHeight, 
	    		excerptLeft: excerptLeft, 
	    		excerptWidth: excerptWidth,
	    		noteWidth: noteWidth
	    	}

	    	notes[noteID] = note;
    	}
    	setMatchMedia(); 
    }

    var setMatchMedia = function() {
    	//initial call of handleMatchMedia for each breakpoint
    	handleMatchMedia(lgQuery);
    	handleMatchMedia(mdQuery);
    	handleMatchMedia(smQuery);
    	handleMatchMedia(xsQuery); 

    	//add listeners for when viewport size changes
    	lgQuery.addListener(handleMatchMedia);
    	mdQuery.addListener(handleMatchMedia);
    	smQuery.addListener(handleMatchMedia);
    	xsQuery.addListener(handleMatchMedia); 

        //orientation change listener
        window.addEventListener("orientationchange", function() {
            console.debug("orientation change = "+window.orientation); 
            checkSize(); 
        }, false);
    }

    var handleMatchMedia = function(mediaQuery) {
    	if (mediaQuery.matches) { 
            console.log("mediaQuery.media = "+mediaQuery.media); 
    		currentQuery = mediaQuery.media; 
    		checkSize(); 	
    	}
    }

    var checkSize = function() {
    	$.each(notes, function() { 
			var noteElem = $("#"+this.noteID);  
			var newWrapWidth = noteElem.find('.DC-note-excerpt-wrap').width(); 
			var checkWidth = this.noteWidth/newWrapWidth; 
			if (currentQuery != xsQuery.media) {
    			if (checkWidth > 1) {
	    			resizeDoc(this.noteID); 
	    		} else if (checkWidth < 1){
	    			restoreDoc(this.noteID); 
	    		}
    		} else {
    			resizeDoc(this.noteID); 
    		}
		}); 
    }

    var resizeDoc = function(noteID) {
    	//original values
    	var natNoteWidth = notes[noteID].noteWidth; 
    	var natWrapWidth = notes[noteID].wrapWidth;
    	var natDocWidth = notes[noteID].docWidth;  

    	//new values after resize of browser 
    	var newWrapWidth = $("#"+noteID+" .DC-note-excerpt-wrap").width();
    	var newNoteWidth = newWrapWidth;
 
 		//calculate new width of document image
		var w = (natNoteWidth-newWrapWidth); //w
		var a = w/natNoteWidth;  //a
		var x = (natNoteWidth/natDocWidth);  //x
		var b = a*x; //b
		var newDocWidth = (natDocWidth*(1-b))-70; 
		//var newDocWidth = natDocWidth-(w*x); 

		var z = newDocWidth/natDocWidth;
		var newExcerptWidth = (notes[noteID].excerptWidth)*z;
		var newExcerptHeight = (notes[noteID].excerptHeight)*z;

		//new x1,x2,y1,y2
		var newX1 = (notes[noteID].x1)*z;
		var newX2 = (notes[noteID].x2)*z;

		//apply calculations to elements
		$("#"+noteID+" .DC-note-image").width(newDocWidth);
		$("#"+noteID+" .DC-note-image").css('top', (notes[noteID].docTop)*z);
		$("#"+noteID+" .DC-note-excerpt").width(newExcerptWidth); 
		$("#"+noteID+" .DC-note-excerpt").height(newExcerptHeight); 
		$("#"+noteID+" .DC-note-excerpt").css('left', -1*newX1);
		console.debug()
		$("#"+noteID+" .DC-left-cover").width(newX1); 
		$("#"+noteID+" .DC-right-cover").width(newExcerptWidth-newX2);
		$("#"+noteID+" .DC-left-cover").height(newExcerptHeight); 
		$("#"+noteID+" .DC-right-cover").height(newExcerptHeight);
	} 

	var restoreDoc = function(noteID) {
		$("#"+noteID+" .DC-note-image").width(notes[noteID].docWidth);
		$("#"+noteID+" .DC-note-image").css('top', notes[noteID].docTop);
		$("#"+noteID+" .DC-note-excerpt").width(notes[noteID].excerptWidth);
		$("#"+noteID+" .DC-note-excerpt").height(notes[noteID].excerptHeight);
		$("#"+noteID+" .DC-note-excerpt").css('left', notes[noteID].excerptLeft);
		$("#"+noteID+" .DC-left-cover").width(notes[noteID].lCoverWidth); 
		$("#"+noteID+" .DC-right-cover").width(notes[noteID].rCoverWidth); 
		$("#"+noteID+" .DC-left-cover").height(notes[noteID].excerptHeight); 
		$("#"+noteID+" .DC-right-cover").height(notes[noteID].excerptHeight);
	}

	//footnote click
    $(document).on('click', '.link-fn', function(){
        var fnLink = $(this);
        var fnLinkIcon = $(this).find('.fa');
        var fnID = $(this).data('fn'); 
        var footnote = $('#footnote'+fnID); 
        if (footnote.hasClass('show')) {
            footnote.removeClass('show');
            footnote.slideUp({duration: 800, easing: 'swing'});
            fnLink.removeClass('reverse'); 
        } else {
            footnote.addClass('show'); 
            footnote.slideDown({duration: 800, easing: 'swing'});
            fnLink.addClass('reverse'); 
            //add note to notes and run subsequent functions
            var note = $(footnote).find('.DC-note-container'); 
            getCoords(note); 
        }
        if (fnLinkIcon.hasClass('fa-caret-down')) {
            fnLinkIcon.removeClass('fa-caret-down').addClass('fa-caret-up');
        } else {
            fnLinkIcon.removeClass('fa-caret-up').addClass('fa-caret-down');
        }
    });

    $(window).load(function() {
    	init(); 
    }); 

});




