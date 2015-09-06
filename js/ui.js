$(document).ready(function(){
    var dragObject = function(){};//Function for moving stuff
    //UI controller
    var ui = {
        menu: {
            opened: false
        },
        search: {
            visiable: false
        },
        typing: false,
        sound: {
            slider: document.getElementById("sound-slider"),
            elem: document.getElementById("playerBar-sound"),
            x: 0
        },
        progress: {
            slider: document.getElementById("playerBar-slider"),
            elem: document.getElementById("playerBar-progress"),
            x: 0
        },
        mouse: {
            x: 0,
            y: 0
        }
    };
    var drag = document.getElementById("songs");

    readSettings();

    //Unregister global shortcuts
    globalShortcut.unregisterAll();
    //Register global shortcuts
    //Pause/Play
    var pauseShort = globalShortcut.register('Ctrl+Shift+Q', function() {
        if (player.songs.length != 0){
            if (player.playing == true){
                pause();
            } else{
                play();
            }
        }
    });
    //Next track
    var nextTrackShort = globalShortcut.register('Ctrl+Shift+E', function() {
        if (player.songs.length != 0){
            nextSong();
        }
    });
    //Sound -5
    var soundM5 = globalShortcut.register('Ctrl+Alt+Q', function() {
        if (player.songs.length != 0){
            //Calculating size of the sound element
            // var rect = ui.sound.elem.getBoundingClientRect();
            if (player.sound > 5){
                player.sound -= 5;
                player.elem.volume -= 0.05;
            } else{
                player.sound = 0;
                player.elem.volume = 0;
            }
            $("#sound-slider").css("margin-left", 70 * (player.sound / 100) +"px");
            $(".playerBar .sound p").text( Math.round(player.sound) +"%" );
            //Change settings with delay
            wrtSettDelay(1000);
        }
    });
    //Sound +5
    var soundP5 = globalShortcut.register('Ctrl+Alt+E', function() {
        if (player.songs.length != 0){
            //Calculating size of the sound element
            var rect = ui.sound.elem.getBoundingClientRect();
            if (player.sound < 95){
                player.sound += 5;
                player.elem.volume += 0.05;
            } else{
                player.sound = 100;
                player.elem.volume = 1;
            }
            $("#sound-slider").css("margin-left", 70 * (player.sound / 100) +"px");
            $(".playerBar .sound p").text( Math.round(player.sound) +"%" );
            //Change settings with delay
            wrtSettDelay(1000);
        }
    });

    $(document).keydown(function(e){
        //M (Menu close and open)
        if (e.keyCode == 77 && ui.typing == false){
            openOrCloseMenu();
        } else if (e.keyCode == 9){
            return false;
        //Ctrl + F (Search)
        } else if (e.ctrlKey == true && e.keyCode == 70){
            showOrHideSearch();
        }
    });
    $(document).mousemove(function(e){
        ui.mouse.x = e.pageX;
        ui.mouse.y = e.pageY;

        dragObject();
    });
    $(document).mouseup(function(){
        //Stop moving everything
        dragObject = function(){};
    });

    //Menu close and open
    $("#bottom-menu-open").click(function(){ openOrCloseMenu(); });
    //Show and hide search
    $("#bottom-menu-search").click(function(){
        showOrHideSearch();
    });
    //Info close and open handler
    closer_opener(".info", "#menu-info", ".info .close");

    //Links handler
    $("a").click(function(){
        shell.openExternal(this.href);
        return false;
    });

    //Some crap
    $("input").focus(function(){
        ui.typing = true;
    });
    $("input").blur(function(){
        ui.typing = false;
    });
    // alignTop(".drag_folder p", ".drag_folder");
    alignTop(".songs .text", ".songs");

    //Fieres when audio is loaded (for returning duration)
    player.elem.addEventListener('loadedmetadata', function(){
	    player.playlistFunc();
	});

    //Controls
    //Play and pause music
    $("#bottom-menu-play").click(function(){
        if (player.playing == false && player.status == 2){
            play();
        } else if(player.status == 2){
            pause();
        }
    });
    //Modes:
    //Shuffle
    $("#bottom-menu-shuffle").click(function(){
        if (player.shuffle == true){
            $(this).css("opacity", "0.5");
            player.shuffle = false;
        } else{
            $(this).css("opacity", "1");
            player.shuffle = true;
        }
        writeSettings();
    });
    //Repeat
    $("#bottom-menu-repeat").click(function(){
        if (player.repeat == true){
            $(this).css("opacity", "0.5");
            player.repeat = false;
        } else{
            $(this).css("opacity", "1");
            player.repeat = true;
        }
        writeSettings();
    });
    //Next song
    $("#bottom-menu-next").click(function(){ nextSong(); });
    //Previous song
    $("#bottom-menu-previous").click(function(){
        if (player.shuffle == true || player.repeat == true){
            nextSong();
        } else{
            if (player.song.playing != 0){
                changeSong(
                    player.folder + player.songs[parseInt(player.song.playing) - 1],
                    parseInt(player.song.playing) - 1
                );
            //The first song
            } else{
                changeSong(player.folder + player.songs[player.songs.length - 1], player.songs.length - 1);
            }
            var name = player.songs[player.song.playing];
            $(".progress .songName").html(name.substring(0, name.length - 4));
            play();
        }
    });
    //Sound
    $("#playerBar-sound").mousedown(function(e){
        //Function that will be executed every mouse's move
        dragObject = function(){
            var rect = ui.sound.elem.getBoundingClientRect();
            //If mouse doesn't go out of sound element
            if (ui.mouse.x <= rect.right && ui.mouse.x >= rect.left){
                var value = ui.mouse.x - rect.left;
                //0.7 is 1% of sound's element width
                player.sound = value / 0.7;
                if (Math.round(player.sound) == 1){
                    player.sound = 0;
                }
                player.elem.volume = player.sound / 100;
                $(".playerBar .sound p").text( Math.round(player.sound) +"%" );

                $("#sound-slider").css("margin-left", value +"px");
                //Change settings with delay
                wrtSettDelay(1000);
            }
        }
        dragObject();
    });
    //Change progress
    $("#playerBar-progress").mousedown(function(e){
        var rect = ui.progress.elem.getBoundingClientRect();
        //If mouse doesn't go out of progress element
        if (ui.mouse.x <= rect.right && ui.mouse.x >= rect.left){
            var value = ui.mouse.x - rect.left;
            player.song.nowTime = player.elem.duration * ((
                value / ($("#playerBar-progress").width() / 100)
            ) / 100);
            player.elem.currentTime = player.song.nowTime;
        }
    });

    //Search
    $("#bottom-menu-search-input").keyup(function(e){
        clearTimeout(player.searchTimer);

        player.searchTimer = setTimeout(function(){
            var srchText = $("#bottom-menu-search-input").val();
            for (var c = 0; c < player.songs.length; c++){
                //If there is no coincidence
                if (player.songs[c].toLowerCase().indexOf(srchText.toLowerCase()) < 0){
                    $("#song-"+ c).css("display", "none");
                } else{
                    $("#song-"+ c).css("display", "block");
                }
            }
        }, 300);
    });

    //Drag and drop folders
    drag.ondrop = function(e){
        e.preventDefault();
        //If there is no music folder
        if (player.status != 1){
            player.status = 1;
            $(".songs .text").html("Loading...");
            //Reading folder
            player.folder = dirToRight(e.dataTransfer.files[0].path);
            //Reading files from folder
            addSongs();
        }
    }
    drag.ondragover = function(){
        // $(this).addClass("dragover");
        return false;
    }
    drag.ondragleave = function(){
        // $(this).removeClass("dragover");
        return false;
    }
    //Prevent opening a file in the app by droping it in any place of the document
    document.ondragover = function(){
        return false;
    }
    document.ondrop = function(e){
        e.preventDefault();
        return false;
    }
    drag.ondragleave = function(){
        return false;
    }


    //function for open-close stuff
    function closer_opener(thing, opener, closer){
        $(closer).click(function(){
            $(thing).css("display", "none");
        });
        $(opener).click(function(){
            $(thing).css("display", "block");
        });
    }
    function openOrCloseMenu(){
        if (ui.menu.opened == false){
            $(".menu").css("width", "250px");
            $(".songs").css("width", "calc(100% - 250px)");
            $("#bottom-menu-open").css("transform", "rotate(90deg)");
            ui.menu.opened = true;
        } else{
            $(".menu").css("width", "0");
            $(".songs").css("width", "100%");
            $("#bottom-menu-open").css("transform", "rotate(0deg)");
            ui.menu.opened = false;
        }
    }
    function showOrHideSearch(){
        if (ui.search.visiable == true){
            $("#bottom-menu-search-input").css("margin-top", "38px");
            $(".playerBar").css("margin-top", "2px");
            $("#bottom-menu-search-input").blur();
            ui.search.visiable = false;
        } else{
            $("#bottom-menu-search-input").css("margin-top", "2px");
            $(".playerBar").css("margin-top", "38px");
            $("#bottom-menu-search-input").focus();
            ui.search.visiable = true;
        }
    }
    function setUpSongs(){
        $(".song").click(function(){
            var id = this.id.substring(5, this.id.length);
            //Function that will be executed when song is loaded
            player.playlistFunc = function(){
                $(".playerBar .progress .end").text(parseSec(player.elem.duration));
                player.song.Interval = setInterval(function(){
                    player.song.nowTime = player.elem.currentTime;
                    //If time has changed
                    if (player.song.prevTime != player.song.nowTime){
                        //Write time
                        $(".playerBar .progress .current").text(parseSec(player.elem.currentTime));
                        var move = player.song.nowTime / (player.elem.duration / 100)
                        / 100 * $(".playerBar .progress").width();
                        //Moving progress bar
                        $(".playerBar .progress .line").css("width", move +"px");
                        //Moving slider
                        $(".playerBar .progress .slider").css("margin-left", move +"px");
                        player.song.prevTime = player.song.nowTime;
                    }
                }, 200);
            };
            //Fires when audio is ended
            player.elem.onended = nextSong;
            changeSong(player.folder + player.songs[id], id);
            var name = player.songs[id];
            $(".progress .songName").html(name.substring(0, name.length - 4));
            play();
        });
        changeSong(player.folder + player.songs[0], 0);
        $(".playerBar").css("opacity", "1");
    }
    //Sets margin-top of element to the center of it's parent
    function alignTop(elem, parent){
        $(elem).css(
            "margin-top", ($(parent).height() / 2 - $(elem).height() / 2) +"px"
        );
    }
    function play(){
        $("#bottom-menu-play").css("background-image", "url(icon/pause.png)");
        player.elem.play();
        player.playing = true;
    }
    function pause(){
        $("#bottom-menu-play").css("background-image", "url(icon/play.png)");
        player.elem.pause();
        player.playing = false;
    }
    //Add songs to the player
    function addSongs(){
        handleFolder(player.folder, function(){
            //Making playlist
            player.counter = 0;
            player.playlist = "";
            //Add songs to settings file
            writeSettings();
            //Make a new plaulist
            player.playlistFunc = makePlaylist;
            changeSong(player.folder + player.songs[0], 0);
            var name = player.songs[0];
            $(".progress .songName").html(name.substring(0, name.length - 4));
        });
    }
    //Set up function that will be executed when audio is loaded
    function makePlaylist(){
        var name = player.songs[player.counter];
        player.playlist +=
            '<div class="song" id="song-'+ player.counter +'">'+
                '<div class="progress" id="song-progress-'+ player.counter +'"></div>'+
                '<div class="name">'+ name.substring(0, name.length - 4) +'</div>'+
                '<div class="duration">'+ parseSec(player.elem.duration) +'</div>'+
            '</div>';
        player.counter++;
        changeSong(player.folder + player.songs[player.counter], player.counter);
        //If every songs is processed, reset the function
        if (player.counter == player.songs.length){
            $(".player.playlist").html(player.playlist);
            player.playlistFunc = function(){};
            $(".songs .playlist").html(player.playlist);
            setUpSongs();
            //Styling
            $(".playerBar .icon, .playerBar .slider").css("cursor", "pointer");
            $(".songs .text").css("display", "none");
            player.status = 2;
        }
    }
    //Changes song to the next
    function nextSong(){
        //If repeat is on
        if (player.repeat == true){
            play();
        } else{
            //If suffle is on
            if (player.shuffle == true){
                var nxt = random(0, player.songs.length - 1);
                changeSong(player.folder + player.songs[nxt], nxt);
            } else{
                if (player.song.playing != player.songs.length - 1){
                    changeSong(
                        player.folder + player.songs[parseInt(player.song.playing, 10) + 1],
                        parseInt(player.song.playing) + 1
                    );
                //The last song
                } else{
                    changeSong(player.folder + player.songs[0], 0);
                }
            }
            var name = player.songs[player.song.playing];
            $(".progress .songName").html(name.substring(0, name.length - 4));
            play();
        }
    }
    function writeSettings(){
        var data = {};
        data.folder = player.folder;
        data.repeat = player.repeat;
        data.shuffle = player.shuffle;
        data.sound = player.sound;
        data.status = player.status;

        data = JSON.stringify(data);

        fs.writeFile("./data/settings.json", data, function(){});
    }
    function readSettings(){
        fs.readFile("./data/settings.json", function(err, data){
            if (err) throw err;
            var settings = JSON.parse(data);
            player.folder = settings.folder;
            player.repeat = settings.repeat;
            player.shuffle = settings.shuffle;
            player.sound = settings.sound;
            player.status = settings.status;

            //Add songs
            if (player.folder != ""){
                addSongs();
                $(".songs .text").html("Loading...");
            }
            //Change stuff like shuffle and repeat
            if (player.shuffle == true){
                $("#bottom-menu-shuffle").css("opacity", "1");
            }
            if (player.repeat == true){
                $("#bottom-menu-repeat").css("opacity", "1");
            }
            //Sound
            player.elem.volume = player.sound / 100;
            $("#sound-slider").css("margin-left", 70 * (player.sound / 100) +"px");
            $(".playerBar .sound p").text( Math.round(player.sound) +"%" );
        });
    }
    //Change settings with an delay
    function wrtSettDelay(delay){
        clearTimeout(player.setTimer);

        player.setTimer = setTimeout(function(){
            writeSettings();
        }, delay);
    }

});
