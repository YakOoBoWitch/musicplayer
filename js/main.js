//Requirements
window.$ = window.Jquery = require("./lib/jquery.min.js"); //require jquery
var shell = require('shell');
var fs = require("fs");
//connecting main and render processes
var remote = require('remote');
//require app
var app = remote.require('app');
//require global shortcuts
var globalShortcut = remote.require('global-shortcut');

var player = {
    songs: [],
    folder: "",
    playlist: "",
    shuffle: false,
    repeat: false,
    sound: 100,
    setTimer: function(){}, //Timer for settings
    searchTimer: function(){}, //Timer for search
    song: {
        Interval: function(){},
        prevTime: 0,
        nowTime: 0,
        playing: 0,
        prevSong: ""
    },
    counter: 0,
    playing: false,
    elem: document.getElementById("player"),
    playlistFunc: function(){}, //This function will be executed for return duration of song
    status: 0 //0 means playlist has not been set, 1 means loading, 2 means everything is allright
};

//Functions
//Returns readable directory
function dirToRight(dir){
    var newDir = "";
    for (var c = 0; c < dir.length; c++){
        if (dir.charAt(c) == "\\"){
            newDir += "/";
        } else if (c != (dir.length - 1)){
            newDir += dir.charAt(c);
        } else if (c == (dir.length - 1) && dir.charAt(c) != "/"){
            newDir += dir.charAt(c) + "/";
        }
    }
    return newDir;
}
//Change song
function changeSong(song, num){
    player.elem.src = "file:///"+ song;
    player.song.playing = num;
}
//Handles music folder, returning an array of mp3 songs
function handleFolder(path, callback){
    fs.readdir(player.folder, function(err, files){
        player.songs = [];
        //Check files for .mp3 format
        for (var c = 0; c < files.length; c++) {
            var len = files[c].length;
            if (files[c].substring(len - 4, len) == ".mp3"){
                // player.songs.push([player.folder], [files[c]]);
                player.songs.push(files[c]);
            }
        }
        // player.songs = songsSort(player.songs);
        callback();
    });
}
//Parse seconds in format like 6:18
function parseSec(sec){
	var mins = Math.floor(sec / 60);
	var seconds = Math.floor(sec - mins * 60);
    if (seconds.toString().length == 1){
        return mins.toString() +":0"+ seconds.toString();
    } else {
        return mins.toString() +":"+ seconds.toString();
    }
}
//Sorting songs
function songsSort(songs){
	for (var c = 0; c < songs.length; c++){
		songs[c] = songs[c].toLowerCase() + "[|=|]" + songs[c];
	}

	var sorted = songs.sort();

	for (var c = 0; c < sorted.length; c++){
		var i = 1;
		var newSorted = sorted[c].split("[|=|]");
		while (i < newSorted.length){
			sorted[c] = newSorted[i];
			i++;
		}
	}
	return sorted;
}
//Returns random number from a to b
function random(a, b){
    return Math.round(Math.random() * (b - a)) + a;
}
