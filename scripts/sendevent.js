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

const getRemotes = (selectMessage, remotes, defaultRemote) => {
  return execa("git", ["remote"], {shell: true}).then(( {stdout} ) => {
    return stdout.split('\n');
  })
}

const selectRemote = (selectMessage, remotes, defaultRemote) => {
  return new Promise((resolveRemote, rejectRemote) => {
    const question = {
      type: 'list',
      name: 'remote',
      message: selectMessage,
      choices: remotes,
      default: remotes.indexOf(defaultRemote),
    };
    inquirer.prompt(question).then(answer => {
      if (answer.remote) {
        resolveRemote(answer.remote);
      } else {
        resolveRemote(defaultRemote);
      }
    });
  })
}

const getToken = (interactive = true) => {
  return new Promise((resolveToken) => {
    const defaultToken = process.env.GITHUB_TOKEN;
    if (defaultToken) {
      resolveToken(defaultToken);
    } else if (interactive) {
      const question = {
        type: 'input',
        name: 'token',
        message: 'GITHUB_TOKEN env var not set, enter token:',
      };
      inquirer.prompt(question).then(answer => {
        if (answer.token) {
          resolveToken(answer.token);
        }
      });
    } else {

    }
  })
}

const getUserRepo = (selectMessage, interactive = true) => {
  return new Promise((resolveUserRepo) => {
    getRemotes().then((remotes) => {
      const defaultRemote = remotes.includes('origin') ? 'origin' : remotes[0];
      if (interactive) {
        return selectRemote(selectMessage, remotes, defaultRemote);
      } else {
        return defaultRemote;
      }
    }).then((remote) => {
      return execa("git", ["remote", "get-url", remote], {shell: true})
    }).then(( {stdout} ) => {
      return stdout.split('\n')[0];
    }).then((url) => {
      const [, , , user, repo] = url.split(/\/|\.git/);
      resolveUserRepo([user, repo]);
    });
  });
}

getUserRepo("Select remote to run test-event on").then(async ([user, repo]) => {
  const token = await getToken();
  sendEvent(token, user, repo, "test-event", {
    "unit": false,
    "integration": true
  }).then(res => {
    console.log(JSON.stringify(res.data));
  }).catch(err => {
    console.log(err)
  })
});
