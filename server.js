var http = require('http')
  , fs   = require('fs')
  , mustache = require('mustache')
  , markdown = require( "markdown" ).markdown
  , url  = require('url')
  , querystring = require('querystring')
  , port = 8080

var movies = []

fs.readFile(__dirname + '/movies.txt', 'utf8', function(err, txt) {
    if (err) {
      throw err
    }
    movies = txt.split('\n')
})

var server = http.createServer (function (req, res) {
  var uri = url.parse(req.url)

  switch( uri.pathname ) {
    // Note the new case handling search
    case '/search':
      handleSearch(res, uri)
      break
    // Note we no longer have an index.html file, but we handle the cases since that's what the browser will request
    case '/':
      sendIndex(res)
      break
    case '/index.html':
      sendIndex(res)
      break
    case '/template.html':
      sendFile(res, 'template.html')
      break
    case '/css/style.css':
      sendFile(res, 'style.css', 'text/css')
      break
    case '/js/scripts.js':
      sendFile(res, 'scripts.js', 'text/javascript')
      break
    case '/server.js':
      sendFile(res, 'server.js', 'text/javascript')
      break
    case '/template.html':
      sendFile(res, 'template.html')
      break
    case '/movies.txt':
      sendFile(res, 'movies.txt')
      break
    case '/readme.md':
    case '/README.md':
      sendReadme(res)
      break
    default:
      res.end('404 not found')
  }
})

server.listen(process.env.PORT || port)
console.log('listening on 8080')

// subroutines

// You'll be modifying this function
function handleSearch(res, uri) {
  var contentType = 'text/html'

  fs.readFile(__dirname + '/template.html', 'utf8', function(err, html) {
    if (err) {
      throw err
    }
    //Generate filtered movie list
    if (uri.query && querystring.parse(uri.query)['searchterm']) {
      query = querystring.parse(uri.query)
      searchTerm = query['searchterm']
      searchResult = filterList(searchTerm, movies)
      if (searchResult.length > 0) {
        movieList = searchResult.map(function(d) { return '<li class="list-group-item">'+d+'</li>' }).join(' ')
      } else {
        movieList = '<div class="alert alert-danger" role="alert">No results found.</div>'
      }
    } else {
      searchTerm = ""
      movieList = '<div class="alert alert-warning" role="alert">No Search Term Provided!</div>'
      movieList = movieList + movies.map(function(d) { return '<li class="list-group-item">'+d+'</li>' }).join(' ')
    }
    
    //Serve rendered page
    mustache.parse(html)
    var rendered = mustache.render(html, {movielist: movieList, searchterm: searchTerm})
    res.writeHead(200, {'Content-type': contentType})
    res.end(rendered, 'utf-8')
  })
}

// Note: consider this your "index.html" for this assignment
function sendIndex(res) {
  var contentType = 'text/html'
  fs.readFile(__dirname + '/template.html', 'utf8', function(err, html) {
    if (err) {
      throw err
    }
    //Generate movie list
    movieList = movies.map(function(d) { return '<li class="list-group-item">'+d+'</li>' }).join(' ')
    
    //Serve rendered page
    mustache.parse(html)
    var rendered = mustache.render(html, {movielist: movieList})
    res.writeHead(200, {'Content-type': contentType})
    res.end(rendered, 'utf-8')
  })
}

function sendReadme(res) {
  var contentType = 'text/html'
  fs.readFile(__dirname + '/README.md', 'utf8', function(err, md) {
    if (err) {
      throw err
    }
    
    //Serve rendered readme
    res.writeHead(200, {'Content-type': contentType})
    res.end(markdown.toHTML(md, 'Gruber'), 'utf-8')
  })
}

function filterList(searchterm, list) {
  return list.filter(function f(value) {
    if (value.toLowerCase().includes(searchterm.toLowerCase()))
    {
      return true
    } else {
      return false
    }
  })
}

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html'

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })
}
