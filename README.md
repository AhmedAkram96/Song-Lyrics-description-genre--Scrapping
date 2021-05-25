# Song-Lyrics-description-genre--Scrapping
This repository offers a function that given a list of artists, it returns the lyrics, description and genre of their most popular tracks on Genius


We are  using Genius APIs to get each artist's popular tracks, lyrics and description and we use Spotify APIs to get the genre


<h2> How it works </h2>

- After clonning the repo, start installing the needed node modules using `npm`

- `npm install spotify-web-api-node genius-api node-genius cheerio axios @chilkat/ck-node12-linux64`

- Go get your Genius AccessToken from https://genius.com/api-clients and your Spotify AccessToken following this repo https://github.com/JMPerez/spotify-web-api-token

- Add these AccessTokens to the env.json file

- At the end of the `Scrapping.js` file, you can find the function `getAllArtistsTracks` to be called. The function takes two arguments :
1. Array of artists
2. number of songs to retrieve for each artist

- The file dataset.csv will be updated with the new added data to it
