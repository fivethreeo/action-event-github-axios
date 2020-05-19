const axios = require('axios');

const user = 'fivethreeo';
const reponame = 'action-event-github-axios';
const githubToken = process.env.GITHUB_TOKEN;

axios({
  method: "POST",
  url: `https://api.github.com/repos/${user}/${reponame}/dispatches`,
  headers: {
    Authorization: `Bearer ${githubToken}`,
    "Content-Type": "application/json"
  },
  data: {
    "event_type": "test-event",
    "client_payload": {
      "unit": false,
      "integration": true
    }
  }
})
.then(res => {
  console.log(JSON.stringify(res.data));
})
.catch(err => {
  console.log(err)
})
