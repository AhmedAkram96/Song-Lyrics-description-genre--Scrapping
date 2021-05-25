//**********************Spotify CONFIGS************** */
var SpotifyWebApi = require('spotify-web-api-node');

const env = require("./env.json");
const geniusAccessToken = env.geniusAcessToken
const clientId = env.clientId
const clientSecret = env.clientSecret
const spotifyAccessToken = env.spotifyAccessToken

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: clientId.toString(),
  clientSecret: clientSecret.toString(),
  redirectUri: 'http://localhost:3000'
});
spotifyApi.setAccessToken(spotifyAccessToken.toString());

//*************GENIUS CONFIGS*************** */
var Genius = require ('genius-api')
const genius = new Genius(geniusAccessToken.toString())

var nodeGenius = require("node-genius");
var geniusClient = new nodeGenius(geniusAccessToken.toString());
// ************************************General configs *******************************//
const cheerio = require('cheerio') 
const axios = require('axios')
var chilkat = require('@chilkat/ck-node12-linux64'); 





//*********************************************/
function loadCsvFile(path)  {

  return new Promise((resolve, reject) =>{
    var csv = new chilkat.Csv();
    csv.HasColumnNames = true;
    var success = csv.LoadFile(path);
    if (success !== true) {
          reject(csv.LastErrorText);
    }
    else{
      resolve(csv) 
      }
  })

}
function getArtistIdByNameSpotify(ArtistName){
  return spotifyApi.searchArtists(ArtistName)
  .then(function(data) {
		return new Promise((resolve, reject) =>{
      for(var i =0 ; i<data.body.artists.items.length ; i++){
        if(data.body.artists.items[i].name == ArtistName){
          resolve( data.body.artists.items[i].id)
        }
      }
      reject(`cannot find an artist with the name "${ArtistName}" on spotify`)
    })
 
  }, function(err) {
    console.error(err);
  }).catch(err => console.log(err));
}

async function getArtistIdByName(artistName) {
	//const normalizeName = name => name.replace(/\./g, '').toLowerCase()   // regex removes dots
	const artistNameNormalized = artistName
  
	return genius.search(artistName)
	  .then((response) => {
		for (let i = 0; i < response.hits.length; i += 1) {
			const hit = response.hits[i]
		  if (hit.type === 'song' && hit.result.primary_artist.name === artistNameNormalized) {
			return hit.result
		  }
		}
		return null
		}).then(songInfo => {
			if(songInfo==null)
			return null
			else
			return songInfo.primary_artist.id
		}
			).catch(err => console.log(err))
  }

function getArtistTopTracks(artistId,numberOfTopTracks){
        return new Promise((resolve, reject) =>{
          geniusClient.getArtistSongs(artistId, {"page": "1", "per_page": `${numberOfTopTracks}` , "sort": "popularity"},
            function (error, songs) {
                if(error){
                  reject(error)
                }
                else{
                  songs = JSON.parse(songs)
                  res_songs = songs.response.songs
                  resolve(res_songs)
                }
              })  
          });
  }

function getSongLyrics(geniusUrl) {
  if(geniusUrl){
    return axios.get(geniusUrl).then(res => {
      const $ = cheerio.load(res.data)
      
      //to get description 
  

  
    return new Promise((resolve, reject) =>{
      var description =  $('p').parent('div.rich_text_formatting').slice(0,1).each(async (index,element) =>{
      	return  $(element)
      }).text()
      const lyrics = $('.lyrics').text().toString().trim()
    
      if(lyrics){
          res = {
            lyrics,
            description
          }
          resolve(res)
      }
      else{
        reject("no lyrics could  be fetched, Will try again")
      }
  })
    }).catch(err=>console.log(err))
  }
  else{
    console.log("URL is undeifined because no song with this name")
    return null
  }
}
async function getGenre(ArtistName){

  const artistId = await getArtistIdByNameSpotify(ArtistName)
  return await spotifyApi.getArtist(artistId)
  .then(function(data) {
    return(data.body.genres);
  }, function(err) {
    console.error("didn't find artist with that name : ", ArtistName , " on spotify");
  });



}

async function getAllArtistsTracks(Artists,topTracksNumber){
  var csv = await loadCsvFile("dataset.csv")
  
  if(csv){
     var j =0
    
     var row = csv.NumRows+1

      while(j<Artists.length){
        console.log(row)
        const artistName = Artists[j]
        const  artistId  = await getArtistIdByName(artistName)
    //    //const genre = csv.GetCell(row,4).toString()
        const genre = await getGenre(artistName)
        if(artistId){
          console.log("artist Id " + artistId)

          var topTracks = await getArtistTopTracks(artistId,topTracksNumber)
         

        if(topTracks && topTracks.length !==0){

          for(var i =0 ; i<topTracks.length ; i++){
            var title = topTracks[i].title
            var songUrl = topTracks[i].url

            while(true){
              var output = await getSongLyrics(songUrl)
              if(output !== undefined){
                break
              }
            }

            
            csv.SetCell(row, 0, artistName)
            csv.SetCell(row, 1, title.toString())
            csv.SetCell(row, 2, output.lyrics)
            csv.SetCell(row, 3, output.description)
            csv.SetCell(row, 4, genre)

            row = row+1
            await console.log(`row number ${row} : track name ${title}`)
          };
          
        }
        
        else{
          console.log(`no trakcs available for ${artistName} `)
          for(var i =0 ; i<4; i++){
            csv.SetCell(row, 0, artistName)
            //csv.SetCell(row, 4, genre)
             row = row+1
          }
        }
         
          success3 = await csv.SaveFile("dataset.csv");
       
       }
      else{
        console.log(`something went wrong while getting ${artistName} ID`)
      }
       j++
      }
  }else {
    console.log(`something went wrong while reading CSV file`)

  }
}

(async () => {
  await getAllArtistsTracks(["Elliott Smith","Post Malone", "The Smashing Pumpkins" ,"Nirvana","Doja Cat","SZA","Kanye West","JAY-Z","PARTYNEXTDOOR","Summer Walker","D’Angelo","Bob Dylan","Van Morrison","The Kid LAROI","Juice WRLD","Cardi B","Drake","Travis Scott","John Mayer","Maggie Rogers","Dua Lipa","Lady Gaga","Billie Eilish","Rihanna","Tame Impala","Mac DeMarco","Adele","Carole King","Jimi Hendrix","The Beatles","Grateful Dead","Led Zeppelin","Morgan Wallen","Kane Brown","Frank Ocean","Don Toliver","Gucci Mane","21 Savage"] , 4)
})();

