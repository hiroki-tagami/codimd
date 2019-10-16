const url = window.location.search
const hash  = url.slice(1).split('&');
let queryStrings = {};
let words = new Array();

onLoad()


// add a query strings.
function addQueryStrings(words) {
  let query = []
  for (const word of words) {
    if(word.match(/:/)) {
      query.push(word.replace(':', '='))
    } else {
      query.push('word=' + word)
    }
  }
  if(query.length > 0) {
    return "?" + query.join('&')
  }
}

function onLoad() {
  // parsing query strings.
  if(hash != "") {
    for (const item of hash) {
      const[key, value] = item.split('=')
      if(key != 'word') {
        words.push(key + ":" + value)
      } else {
        words.push(value)
      }
      queryStrings[key] = value
    }
    // add to input form from url query strings.
    if(words.length > 0) {
      $('input#search-word').val(decodeURI(words.join(" ")))
    }
  }

  $('#search-word').focus()
}

// search
function search() {
  words = $('input#search-word').val().split(' ')
  let url = "/search"
  if(words[0] != "") {
     url  += addQueryStrings(words)
  }
  location.href = url
}


$('#search-button').click(() => {
  search()
})

$('#search-word').keypress((e) =>{
  if(e.which == 13) {search()}
})

