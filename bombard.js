const http = require('http');
const yargs = require('yargs');

const argv = yargs
  .option('c', {
    alias: 'concurrency',
    describe: 'Number of parallel requests to perform at a time',
    type: 'number',
    default: 1,
  })
  .option('n', {
    alias: 'requests',
    describe: 'Number of requests to perform for the benchmarking session',
    type: 'number',
    default: 1,
  })
  .option('b', {
    alias: 'body',
    describe: ' if specified, should sent a random generated body with request',
    type: 'string',
  })
  .option('url',{
    alias:'url',
    describe: 'url which should be used for requests',
    
  })
  .demandOption(['url'])
  .argv;

const concurrency = argv.c;
const numRequests = argv.n;
const body = argv.b;
const url = argv.url;

let completedRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let totalResponseTime = 0;

function performRequest() {
  const startTime = process.hrtime();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
  };

  if (body) {
    requestOptions.body = body;
  }

  const req = http.request(url, requestOptions, (res) => {
    const endTime = process.hrtime(startTime);
    const responseTime = endTime[0] * 1000 + endTime[1] / 1e6;

    completedRequests++;
    totalResponseTime += responseTime;

    if (res.statusCode === 200) {
      successfulRequests++;
    } else {
      failedRequests++;
    }

    console.log(`${completedRequests} ${responseTime.toFixed(0)}`);

    if (completedRequests < numRequests) {
      performRequest();
    } else {
      printSummary();
    }
  });

  req.on('error', (error) => {
    failedRequests++;
    completedRequests++;
    console.error(`Request failed: ${error.message}`);

    if (completedRequests >= numRequests) {
      printSummary();
    }
  });

  if (body) {
    req.write(body);
  }

  req.end();
}

function printSummary() {
  console.log(`\nbombarded\n${numRequests} times`);
  console.log(`${successfulRequests} successful, ${failedRequests} failing`);
  console.log(`average response time ${Math.round(totalResponseTime / numRequests)}ms`);
}

for (let i = 0; i < concurrency; i++) {
  performRequest();
}
