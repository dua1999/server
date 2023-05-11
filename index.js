const http = require('http')

const PORT = 8080

const server = http.createServer((req, res) => {

  setTimeout(() => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      if (body) {
        console.log('Received body:', body)
      }

      res.statusCode = 200
      res.end()
    })
  }, 100)
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
