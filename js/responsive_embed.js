var notes = {}; // Storage of note model/properties.
var resizeTimer; //set resizeTimer to empty so it resets on page load

//entry point
var init = function(){
  //add each note as an object of coordinates
  $(".DC-note-container").each( function(){ 
    addNotes( $(this) );
    compareSize();
  });

  //on resize, run compareSize and reset the timeout
  $(window).resize( function(){
    clearTimeout( resizeTimer );
    resizeTimer = setTimeout( compareSize,250 ); //250 is the delay in milliseconds. Can be adjusted as you see fit. 
  });
}

//CLARIFICATION OF TERMINOLOGY
//box : the area with the yellow border
//viewable(".DC-note-excerpt-wrap") : just the area with the image
//left cover(".DC-left-cover"), target, right cover(".DC-right-cover") : parts of the viewable area; apparently there's no element corresponding directly to the target, or the actual focus of the note
//image(".DC-note-image") : actual image, a parts of which is visible in the viewable area

//stores full-size note coordinates for each note
var addNotes = function(noteEl){
  var noteID          = noteEl.attr('id');
  var widthViewable   = noteEl.find(".DC-note-excerpt-wrap").width();

  //don't store notes that are set to display none && you can't embed the same note twice on one page, so you can't have two notes[noteID]
  if( widthViewable!=0 && !(notes[noteID]) ){
    var heightViewable  = noteEl.find(".DC-note-excerpt").height(); //heightViewable = heightLeftCover = heightTarget = heightRightCover
    var widthLeftCover  = noteEl.find(".DC-left-cover"  ).width();
    var widthRightCover = noteEl.find(".DC-right-cover" ).width();
    var heightOffset    = noteEl.find(".DC-note-image"  ).position().top;
  //var widthImage    for a full-sized note is always 700 because all page images served are 700x900
  //var widthViewable for a full-sized note is always 750 because max width of viewable is 750

    //note
    var note = {
      noteID:              noteID,
      heightViewable:      heightViewable,
      widthLeftCover:      widthLeftCover,
      widthTarget:         750-(widthLeftCover+widthRightCover),
      widthRightCover:     widthRightCover,
      heightOffset:        heightOffset,
      widthViewable_state: 3 //the largest case
    };
    //add the note to notes
    notes[noteID] = note;
  }
}

//compares new width of viewable to left cover and target widths & scales accordingly
var compareSize = function(){
  $.each( notes,function(){
    var noteEl = $("#"+this.noteID); //the notes lookup should just cache the element.
    var new_widthViewable = noteEl.find(".DC-note-excerpt-wrap").width();

    //changing from any case (1,2,3) to the smallest case (1), scaleNote & shiftLeft
    if( new_widthViewable < this.widthTarget ){
      //scale + kill left cover
      var scaling_factor = new_widthViewable/this.widthTarget;
      scaleNote( this.noteID,{
        heightViewable:  scaling_factor*this.heightViewable,
        widthRightCover: scaling_factor*this.widthRightCover,
        widthImage:      scaling_factor*700,
        heightOffset:    scaling_factor*this.heightOffset
      } );
      shiftLeft( this.noteID,{
        widthLeftCover:  0,
        widthOffset:     scaling_factor*this.widthLeftCover
      } );
      //update this.widthViewable_state
      // console.log(this.noteID+" : "+this.widthViewable_state+"->1");
      this.widthViewable_state = 1; //the smallest case
    }
    else{
      //changing from the smallest case (1) to NOT the smallest case(2,3), scaleNote
      if( this.widthViewable_state==1 ){
        scaleNote( this.noteID,{
          heightViewable:  this.heightViewable,
          widthRightCover: this.widthRightCover,
          widthImage:      700,
          heightOffset:    this.heightOffset
        } );
      }

      //changing from NOT the middle case (1,3) to the middle case (2), shiftLeft
      if( new_widthViewable < this.widthLeftCover+this.widthTarget ){
        if( this.widthViewable_state!=2 ){
          //kill left cover
          shiftLeft( this.noteID,{
            widthLeftCover:  0,
            widthOffset:     this.widthLeftCover
          } );
          //update this.widthViewable_state
          // console.log(this.noteID+" : "+this.widthViewable_state+"->2");
          this.widthViewable_state = 2; //the largest case
        }
      }
      //changing from NOT the largest case (1,2) to the largest case (3), shiftLeft
      else{
        if( this.widthViewable_state!=3 ){
          //restore left cover
          shiftLeft( this.noteID,{
            widthLeftCover:  this.widthLeftCover,
            widthOffset:     0
          } );
          //update this.widthViewable_state
          // console.log(this.noteID+" : "+this.widthViewable_state+"->3");
          this.widthViewable_state = 3; //the largest case
        }
      }
    }
  });
}

//scales note coordinates
var scaleNote = function(noteID,dimensions){
  var noteEl = $("#"+noteID);
  // set heights for note images.
  noteEl.find(".DC-note-excerpt").height(dimensions.heightViewable);
  noteEl.find(".DC-left-cover"  ).height(dimensions.heightViewable);
  noteEl.find(".DC-right-cover" ).height(dimensions.heightViewable); 
  // Set widths of right cover and image.
  noteEl.find(".DC-right-cover" ).width(dimensions.widthRightCover);
  noteEl.find(".DC-note-image"  ).width(dimensions.widthImage);
  // position image
  noteEl.find(".DC-note-image"  ).css('top',    dimensions.heightOffset);
}
//
var shiftLeft = function(noteID,dimensions){
  var noteEl = $("#"+noteID);
  // Set widths of left cover
  noteEl.find(".DC-left-cover"  ).width(dimensions.widthLeftCover);
  // position image
  noteEl.find(".DC-note-excerpt").css('left',-1*dimensions.widthOffset);
}

$(window).load( function(){
  init();
});
