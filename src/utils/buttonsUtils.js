var imgs = require("./imgs.js"),
    yutils = require("yasgui-utils"),
    utils = require("./baseUtils.js"),
    $ = require("jquery"),
    Codemirror = require('codemirror');

var drawButtons = function(yasme){

    yasme.buttons = $("<div class='yashe_buttons'></div>").appendTo($(yasme.getWrapperElement()));
 

    /**
     * upload button
     */
    var uploadButton = $("<div>", {
      class: "downloadBtns"
    }).append($('<input type="file" accept=".shex" name="file-1[]" id="file-1" class="inputfileBtn" data-multiple-caption="{count}'
    +'files selected" multiple /><label id="uploadBntLabel" for="file-1">'+imgs.upload+'</label>')
    .addClass("yashe_uploadBtn")
    .attr("title", "Upload your ShEx file")
    .on('change',()=>{utils.readFile(yasme)}));
   
    /**
     * download button
     */
  
    var downloadButton = $("<div>", {
      class: "downloadBtns"
    })
      .append(
        $(yutils.svg.getElement(imgs.download))
          .addClass("yashe_downloadBtn")
          .attr("title", "Download File")
          .attr("id", "downloadBtn")
          .click(function() {          
            var textFileAsBlob = new Blob([ yasme.getValue() ], { type: 'text/shex' });
            var fileNameToSaveAs = "document.shex";
  
            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            if (window.URL != null) {
              // Chrome allows the link to be clicked without actually adding it to the DOM.
              downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            } else {
              // Firefox requires the link to be added to the DOM before it can be clicked.
              downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
              downloadLink.onclick = destroyClickedElement;
              downloadLink.style.display = "none";
              document.body.appendChild(downloadLink);
            }
            downloadLink.click();
            Codemirror.signal(yasme,'download');
          })
      );
    
    /**
     * copy button
     */
  
    var copyButton = $("<div>", {
      class: "downloadBtns"
    })
      .append(
        $(yutils.svg.getElement(imgs.copy))
          .addClass("yashe_downloadBtn")
          .attr("id", "copyBtn")
          .attr("title", "Copy to the clipboard")
          .click(function() { 
              Codemirror.signal(yasme,'copy');
          }))

   
    /**
     * delete button
     */
    var deleteButton = $("<div>", {
      class: "downloadBtns"
    }).append($(yutils.svg.getElement(imgs.delete))
    .addClass("yashe_deletedBtn")
    .attr('id','deleteBtn')
    .attr("title", "Delete content")
    .click(function() { 
              yasme.setValue("")
              Codemirror.signal(yasme,'delete');
          }));


    /**
     * theme button
     */
    var themeButton = $("<div>", {
      class: "downloadBtns"
    }).append($(yutils.svg.getElement(imgs.theme))
    .addClass("yashe_themeBtn")
    .attr('id','themeBtn')
    .attr("title", 'Change the theme')
    .click(function() { 
      
      var themeValue = 'wiki'
      var color = 'black'
      if(yasme.getOption('theme') == 'wiki'){
        themeValue='dark'
        color = 'white'
      }
      

      yasme.setOption("theme",themeValue)

      //Change fill of buttons
      $('#uploadBntLabel').css('fill', color)
      $('#downloadBtn').css('fill', color)
      $('#copyBtn').css('fill', color)
      $('#deleteBtn').css('fill', color)
      $('#themeBtn').css('fill', color)
      $('#fullBtn').css('fill', color)
      $('#smallBtn').css('fill', color)
 
      Codemirror.signal(yasme,'themeChange');
    }))




    /**
       * fullscreen button   
    */
    var toggleFullscreen = $("<div>", {
      class: "fullscreenToggleBtns"
    })
      .append(
        $(yutils.svg.getElement(imgs.fullscreen))
          .addClass("yashe_fullscreenBtn")
          .attr("title", "Set editor full screen")
          .attr("id", "fullBtn")
          .click(function() {
            yasme.setOption("fullScreen", true);
            Codemirror.signal(yasme,'expandScreen');
          })
      )
      .append(
        $(yutils.svg.getElement(imgs.smallscreen))
          .addClass("yashe_smallscreenBtn")
          .attr("title", "Set editor to normal size")
          .attr("id", "smallBtn")
          .click(function() {
            yasme.setOption("fullScreen", false);
            Codemirror.signal(yasme,'collapseScreen');
          })
      );



   /*  var endpointButton = $("<div>", {
      class: "downloadBtns"
    }).append($(yutils.svg.getElement(imgs.endpoint))
    .addClass("yashe_endpointdBtn")
    .attr('id','endpointBtn')
    .attr("title", "Endpoint")
    .click(function() { 
          if($('.endpointInput').length>0){
            $('.endpointInput').remove();
          }else{
             $('.yashe_buttons').
              prepend( 
                $( '<input class="endpointInput" type="text" id="endPoint" name="fname">')
                .val(yasme.options.endpoint)
                .change(function(){
                   yasme.setOption('endpoint',$('.endpointInput').val())
                }))
          }
         
    }));


  
    yasme.buttons.append(endpointButton); */

    //Draw buttons
    if(yasme.options.showUploadButton){
      yasme.buttons.append(uploadButton);
    }

    if(yasme.options.showDownloadButton){
      yasme.buttons.append(downloadButton);
    }

    if(yasme.options.showCopyButton){
      yasme.buttons.append(copyButton);
    }

    if(yasme.options.showDeleteButton){
      yasme.buttons.append(deleteButton);
    }

    if(yasme.options.showThemeButton){
      yasme.buttons.append(themeButton);
    }

    if(yasme.options.showFullScreenButton){
      yasme.buttons.append(toggleFullscreen);
    }
    

  }



module.exports = {
    drawButtons:drawButtons
}