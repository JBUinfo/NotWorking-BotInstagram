const request = require('request');
const USER = 'kolemomon';
const PASS = 'BotoInstagramo';
const hastaggs = ['hiphop','rap','live','trap','rapero','freestyle','musicfragments','hiphopmusic','rapper','musica','soundcloud','fragmentos','youtube','music'];
const comentarios = ['Me encantan tus fotos!','Sigueme!'];
let photosHastags = [];
let peopleHastags = [];
let flagLikes = true;
let flagFollows = true;
let flagComments = true;
let userid = '';
let followers = [];
let following = [];
let header = {
  url: '',
  headers: {
    'method': 'POST',
    'scheme': 'https',
    'accept': '*/*',
    'accept-encoding': 'deflate, br',
    'content-type': '*/*',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'X-Instagram-AJAX': '1',
    'content-type': 'application/x-www-form-urlencoded',
    'x-requested-with': 'XMLHttpRequest'
  }
};
function sleep(ms) {
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  })
}
 
async function login() {
  let flag = true;
  let csrf = '';
  let rollout_hash = '';
  let cookies = '';
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/accounts/login/?source=auth_switcher';
  headerTemporal.headers.method = 'GET';

  request(headerTemporal, function(error, response, body) {
    let substr = response.body.substring(response.body.indexOf('"csrf_token":"')+14,response.body.length);
    csrf = substr.substring(0,substr.indexOf('"'));
    rollout_hash = substr.substring(substr.indexOf('"rollout_hash":"'+16),substr.indexOf('"'));
    flag = false;
  });

  while(flag) {
    console.log('Getting csrf');
    await sleep(2000);
  }
  flag= true;

  headerTemporal.url = 'https://www.instagram.com/accounts/login/ajax/?hl=es';
  headerTemporal.headers['X-CSRFToken'] = csrf
  headerTemporal.form = {
    'username': USER,
    'password': PASS,
    'enc_password': '',
    'queryParams': {"hl":"es","source":"auth_switcher"},
    'optIntoOneTap': 'false'
  }

  request.post(headerTemporal, function(error, response, body) {
    let cookieOne= response.headers['set-cookie'][7];//csrftoken
    let cookieTwo= response.headers['set-cookie'][8];//rur
    let cookieThree= response.headers['set-cookie'][9];//mid
    let cookieFour= response.headers['set-cookie'][10];//userid
    let cookieFive= response.headers['set-cookie'][11];//sessionid
    cookieOne=cookieOne.substring(0,cookieOne.indexOf(";")+1);
    csrf = cookieOne.substring(cookieOne.indexOf("=")+1,cookieOne.indexOf(";"));
    cookieTwo=cookieTwo.substring(0,cookieTwo.indexOf(";")+1);
    cookieThree=cookieThree.substring(0,cookieThree.indexOf(";")+1);
    cookieFour=cookieFour.substring(0,cookieFour.indexOf(";")+1);
    userid=cookieFour.substring(cookieFour.indexOf("=")+1,cookieFour.indexOf(";"));
    cookieFive=cookieFive.substring(0,cookieFive.indexOf(";")+1);
    header.headers.cookie=cookieOne+cookieTwo+cookieThree+cookieFour+cookieFive;
    header.headers['x-csrftoken']=csrf;
    header.headers['X-Instagram-AJAX']=rollout_hash;
    flag=false;
  });

  while (flag) {
    console.log('Getting cookies');
    await sleep(2000);
  }
}

function follow(id) {
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/web/friendships/'+id+'/follow/';
  try {
    request.post(headerTemporal, callback);
  } catch (e) {
    console.log(e);
  }
}

function unfollow(id) {
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/web/friendships/'+id+'/unfollow/';
  try {
    request.post(headerTemporal, callback);
  } catch (e) {
    console.log(e);
  }
}

function like(id) {
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/web/likes/'+id+'/like/';
  try {
    request.post(headerTemporal, callback);
  } catch (e) {
    console.log(e);
  }
}

function addComment(id,comment) {
  let headerTemp = header;
  headerTemp.url = 'https://www.instagram.com/web/comments/'+id+'/add/';
  headerTemp.form = {};
  headerTemp.form.comment_text = comment;
  try {
    request.post(headerTemp, callback);
  } catch (e) {
    console.log(e);
  }
}

async function searchHastag(word) {
  let flag = true;
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/explore/tags/'+word+'/?__a=1';
  request(headerTemporal, function(error, response, body) {
    body = JSON.parse(body);
    for (let i = 0; i < Object.keys(body.graphql.hashtag.edge_hashtag_to_top_posts.edges).length; i++) {
      photosHastags[body.graphql.hashtag.edge_hashtag_to_top_posts.edges[i].node.id] = null;
      peopleHastags[body.graphql.hashtag.edge_hashtag_to_top_posts.edges[i].node.owner.id] = null;
    }
    for (let i = 0; i < Object.keys(body.graphql.hashtag.edge_hashtag_to_media.edges).length; i++) {
      photosHastags[body.graphql.hashtag.edge_hashtag_to_media.edges[i].node.id] = null;
      peopleHastags[body.graphql.hashtag.edge_hashtag_to_media.edges[i].node.owner.id] = null;
    }
    flag=false;
  });
  while (flag) {
    console.log('Searching Hastag: '+word);
    await sleep(2000);
  }
}

async function getFollowers() {
  let flag = true;
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=%7B%22id%22%3A%22'+userid+'%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Atrue%2C%22first%22%3A24%7D';
  try {
    request.post(headerTemporal, function(error, response, body){
      body = JSON.parse(body);
      for (let i = 0; i < Object.keys(body.data.user.edge_followed_by.edges).length; i++) {
        followers[i] = body.data.user.edge_followed_by.edges[i].node.id;
      }
      flag=false;
    });
    while (flag) {
      console.log('Getting List of followings');
      await sleep(2000);
    }
  } catch (e) {
    console.log(e);
  }
}

async function getFollowing() {
  let flag = true;
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=%7B%22id%22%3A%22'+userid+'%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A24%7D';
  headerTemporal.headers.method = 'GET';
  headerTemporal.headers['accept-encoding'] = 'gzip, deflate, br';
  try {
    request.post(headerTemporal, function(error, response, body){
      body = JSON.parse(body);
      console.log(body);
      for (let i = 0; i < Object.keys(body.data.user.edge_follow.edges).length; i++) {
        following[i] = body.data.user.edge_follow.edges[i].node.id;
      }
      flag=false;
    });
    while (flag) {
      console.log('Getting List of followings');
      await sleep(2000);
    }
  } catch (e) {
    console.log(e);
  }
}

async function unfollowFollowers() {
  let headerTemporal = header;
  headerTemporal.url = 'https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=%7B%22id%22%3A%22'+userid+'%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Atrue%2C%22first%22%3A24%7D';
  try {
    request.post(headerTemporal, async function(error, response, body){
      let followed = [];
      let mutualFollow = [];
      for (let i = 0; i < Object.keys(body.data.user.edge_followed_by.edges).length; i++) {
        followed[i] = body.data.user.edge_followed_by.edges[i].node.id;
      }
      for (let i = 0; i < Object.keys(body.data.user.edge_mutual_followed_by.edges).length; i++) {
        mutualFollow[i] = body.data.user.edge_mutual_followed_by.edges[i].node.id;
      }

      for (let i = 0; i < followed.length; i++) {
        if (!mutualFollow[followed[i]]) {
          unfollow(followed[i]);
          await sleep(60000);
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
}

async function likeHastags() {
  for (let e of Object.keys(photosHastags)) {
    console.log('dando like');
    like(e);
    await sleep(1000*60*8);
  };
  flagLikes = false;
}

async function commentHastags() {
  let random = 0;
  let arrayOfComments = photosHastags;
  for (let e of Object.keys(photosHastags)) {
    console.log('Dejando comentario');
    random = Math.floor(Math.random() * comentarios.length-1);
    addComment(e,comentarios[random]);
    comentarios.slice(0, 1, comentarios[random]);
    await sleep(1000*60*33);
  };
  flagComments = false;
}

async function followHastags() {
  for (let e of Object.keys(peopleHastags)) {
    console.log('dando follow');
    follow(e);
    await sleep(1000*60*30);
  }
  flagFollows = false;
}

function callback(error, response, body) {
  if (error || response.statusCode != 200) {
    console.log(error);
    console.log(body);
  }
}

(async () => {
  try {
    setInterval(async function() {
      await unfollowFollowers();
    },1000*60*60*24*7);

    let contador = 0;
    while (true) {
      contador++
      console.log(contador);
      await login();
      for (let i = 0; i < hastaggs.length; i++) {
        await searchHastag(hastaggs[i]);
      }
      // await getFollowing();
      // for (let i = 0; i < following.length; i++) {
      //   if (peopleHastags[following[i]]) {
      //     peopleHastags.splice(0, 1, following[i]);
      //   }
      // }
      // if (peopleHastags.length < 50) {
      //   continue;
      // }
      likeHastags();
      followHastags();
      commentHastags();
      while (flagLikes || flagFollows || flagComments ) {
        console.log('Esperando 30min');
        await sleep(1000*60*30);
      }
      flagLikes = true;
      flagFollows = true;
      flagComments = true;
    }
  } catch (e) {
    console.log(e);
  }
})();
