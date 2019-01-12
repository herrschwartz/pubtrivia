
window.onload = () => {
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
    });

    document.getElementById("tagAddInput").onkeyup = (e) => {if(e.keyCode == 13) addTag(e)}
    document.getElementById("tagAddButton").click = (e) => {    
        let txt = document.getElementById("tagAddInput")
        console.log(txt)
        $("#tagArea").append("<div class='tag'>"+ txt.value +"</div>")
        txt.value = ""
    }
}

function addTag(e){
    $("#tagArea").append("<div class='tag'>"+e.target.value+"</div>")
    e.target.value = ""
}