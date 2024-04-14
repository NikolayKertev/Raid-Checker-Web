/* window.addEventListener("load", refreshPage); */
const API_Key = 'uDPHu47TpOFVs81FSmzPSwE57GbCyYzIj1r2Y9K3';
const SERVERID = '1028302685423808603';
const baseUrl = `https://raid-helper.dev/api/v3/servers/${SERVERID}/scheduledevents`;

const eventUrl = 'https://raid-helper.dev/api/v2/events/1225163202526969899';

fetch(baseUrl, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
        'Authorization': `${API_Key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

fetch(eventUrl)
.then(response => response.json())
.then(data => console.log(data));


/* method: 'POST',
headers: {
    'content-type': 'application/json'
},
body: JSON.stringify({
    name: nameInput,
    type: typeInput,
    players: countInput
}) */
