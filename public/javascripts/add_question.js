
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
        $("#tagArea").append("<div class='tag'>"+ txt.value +"</div>")
        txt.value = ""
    }
}

function addTag(e){
    let tag = e.target.value.replace(/\s+/g, '')
    var regex = /^[a-zA-Z0-9 ]+$/
    if(regex.test(tag)){
        if(tag.charAt(0) == '#'){
            $("#tagArea").append("<div class='tag'>"+tag+"</div>")
            document.getElementById("tagdata").value += tag.substring(1, tag.length).toLowerCase() + ","
        } else {
            document.getElementById("tagdata").value += tag.toLowerCase() + ","
            $("#tagArea").append("<div class='tag'>#"+tag+"</div>")
        }
    } else {
        document.getElementById("err").innerHTML = "Error: Values must be a-z 0-9"
    }
    e.target.value = ""
}