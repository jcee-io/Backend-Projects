fetch('/api')
  .then(res => res.json())
  .then(json => {
    const timestampInfo = document.querySelector('#timestamp-info');

    timestampInfo.innerHTML =
    `
    <p>Unix Time: <br> ${json.unix}</p>
    <p>UTC Time: <br> ${json.utc}</p>
    `;
  });

fetch('/api/whoami')
  .then(res => res.json())
  .then(json => {
    const headerInfo = document.querySelector('#header-info');

    headerInfo.innerHTML =
    `
    <p>IP Address: <br> ${json.ipaddress}</p>
    <p>Language: <br> ${json.language}</p>
    <p>Software: <br> ${json.software}</p>
    `;
  });

  const onExerciseSubmit = event => {
    event.target.setAttribute('action', `/api/users/${event.target.childNodes[1].value}/exercises`);
  };