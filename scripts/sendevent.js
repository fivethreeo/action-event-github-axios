const axios = require('axios');
const execa = require('execa');
const chalk = require('chalk');
const inquirer = require('inquirer');

const defaultToken = process.env.GITHUB_TOKEN;

const sendEvent = (token, user, reponame, github_event, payload) => {
  return axios({
    method: "POST",
    url: `https://api.github.com/repos/${user}/${reponame}/dispatches`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    data: {
      "event_type": github_event,
      "client_payload": payload
    }
  })
}
const getUserRepo = () => {
  return new Promise((resolve, reject) => {
    execa("git", ["remote"], {shell: true}).then(( {stdout} ) => {
      return stdout.split('\n');
    }).then((remotes) => {
      return execa("git", ["remote", "get-url", remotes[0]], {shell: true})
    }).then(( {stdout} ) => {
      return stdout.split('\n')[0];
    }).then((url) => {
      const [, , , user, repo] = url.split(/\/|\.git/);
      resolve([user, repo]);
    }).catch(err => {
      reject(err);
    });
  });
}

getUserRepo().then(([user, repo]) => {
  console.log(user, repo)
  sendEvent(defaultToken, user, repo, "test-event", {
    "unit": false,
    "integration": true
  }).then(res => {
    console.log(JSON.stringify(res.data));
  }).catch(err => {
    console.log(err)
  })
});

// const question = {
//   type: 'confirm',
//   name: 'shouldChangePort',
//   message:
//     chalk.yellow(
//       message +
//         `${existingProcess ? ` Probably:\n  ${existingProcess}` : ''}`
//     ) + '\n\nWould you like to run the app on another port instead?',
//   default: true,
// };
// inquirer.prompt(question).then(answer => {
//   if (answer.shouldChangePort) {
//     resolve(port);
//   } else {
//     resolve(null);
//   }
// });
