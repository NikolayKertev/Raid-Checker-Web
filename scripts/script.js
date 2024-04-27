/* window.addEventListener("load", refreshPage); */
const baseUrl = 'https://neptune.fibrecat.org/pugsters-api-gateway/';
const compositionUrl = 'https://api.codetabs.com/v1/proxy/?quest=https://raid-helper.dev/api/raidplan';

const checkButtonElement = document.querySelector('.check');
const reloadButtonElement = document.querySelector('.reload');
const dupesArea = document.querySelector('.dupesOutput');
const errorArea = document.getElementById('errors');
const memeGifElement = document.querySelector('.meme-gif');

const characterCountElement = document.querySelector('.characterCount');
const playerCountElement = document.querySelector('.playerCount');
const dupesCountElement = document.querySelector('.dupesCount');

const eventsIDs = [];

const playersArray = [];
const playersInstancesArray = [];
let dupesCount = 0;

fetchData();

function getData() {
    fetch(baseUrl)
        .then(response => response.json())
        .then(data => {
            const eventsMetaInfo = Object.values(data);
            const eventsArray = eventsMetaInfo[eventsMetaInfo.length - 1];

            eventsArray.filter(event => event.channelId === '1157639409194254338').forEach(event => {
                const eventID = event.id;

                eventsIDs.push(eventID);
            })

        })
        .then(createPlayers)
        .then(getDupedPlayers);
}

async function createPlayers() {
    for (eventID of eventsIDs) {
        try {
            const res = await fetch(`${compositionUrl}/${eventID}`);
            const data = await res.json();

            const characterArray = data.raidDrop;

            characterArray.forEach(character => {
                const playerName = character.name;
                const characterSpec = character.spec;

                let player = {};
                player[playerName] = characterSpec;

                playersArray.push(player);
            })
        } catch (error) {
            errorArea.style.display = 'block';
            errorArea.textContent = 'Some of the events have less than 1 players insert into. Those events are ignored.'
        }
    }
}

function getDupedPlayers() {
    let counter = 0;

    playersArray.forEach(player => {
        let name = Object.keys(player);
        let spec = Object.values(player);
        counter++;

        if (specMap[spec] !== undefined) {
            spec = specMap[spec];
        }

        if (counter > 175) {
            errorArea.style.display = 'block';
            errorArea.textContent = 'Error. Auto reload in 2 seconds.'

            setTimeout(() => reloadButtonElement.click(), 2000);
            return;
        }

        if (name != 'null') {
            const currentInstance = new Player(name);
            currentInstance.Push(spec);

            const playerIndex = playersInstancesArray.findIndex(instance => instance.name[0] == name);

            if (playerIndex > -1) {
                const player = playersInstancesArray[playerIndex];
                player.Push(spec);
            } else {
                playersInstancesArray.push(currentInstance);
            }
        }
    })

    checkButtonElement.removeAttribute('Disabled');
    reloadButtonElement.removeAttribute('Disabled');

    const playersLenth = playersArray.filter(player => {
        let name = Object.keys(player);

        if (name != 'null') {
            return player;
        }

        return;
    }).length;

    characterCountElement.textContent = `Total Chars: ${playersLenth}`;
    playerCountElement.textContent = `Total players: ${playersInstancesArray.length}`;
    dupesCountElement.textContent = `Total dupes:`;
}

checkButtonElement.addEventListener('click', (e) => {
    if (playersInstancesArray.length < 1) {
        fetchData();
    }

    dupesCount = 0;

    dupesArea.innerHTML = '';

    const dupedPlayers = playersInstancesArray.filter(player => player.duped === true);

    if (dupedPlayers.length === 0) {
        const pElement = document.createElement('p');
        pElement.textContent = 'You have no duped players!';
        pElement.style.color = 'green';

        dupesArea.appendChild(pElement);

        return;
    }

    dupedPlayers.forEach(player => {
        const text = player.ToStringDuped();

        const pElement = document.createElement('p');
        pElement.textContent = text;

        dupesArea.appendChild(pElement);
    })

    checkButtonElement.setAttribute('Disabled', 'Disabled');
    memeGifElement.style.display = 'block';
    dupesCountElement.textContent = `Total dupes: ${dupesCount}`;
})

reloadButtonElement.addEventListener('click', (e) => {
    eventsIDs.length = 0;
    playersArray.length = 0;
    playersInstancesArray.length = 0;

    errorArea.style.display = 'none';
    dupesArea.innerHTML = '';

    memeGifElement.style.display = 'none';

    checkButtonElement.setAttribute('disabled', 'disabled');
    reloadButtonElement.setAttribute('disabled', 'disabled');

    characterCountElement.textContent = `Total Chars:`;
    playerCountElement.textContent = `Total players:`;
    dupesCountElement.textContent = `Total dupes:`;
    fetchData();
})

function fetchData() {
    setTimeout(() => getData(), 500);
}

class Player {
    constructor(name) {
        this.name = name;
        this.specs = {};
        this.duped = false;
        this.specCount = 0;
    }

    changeDupedToTrue() {
        this.duped = true;
    }

    Push(spec) {
        if (this.specs[spec]) {
            this.changeDupedToTrue();
        } else {
            this.specs[spec] = 0;
        }

        this.specs[spec]++;
        this.specCount++;
    }

    ToStringDuped() {
        const dupedSpecs = [];

        for (const spec in this.specs) {
            if (this.specs[spec] > 1) {
                dupedSpecs.push(spec);
            }
        }

        const dupedCount = this.specCount - Object.values(this.specs).length;

        let text = `${this.name}: ${dupedSpecs.join(', ')} - ${dupedCount} times.`;

        dupesCount += dupedCount;
        return text;
    }
}

const specMap = {
    'Restoration1': 'Restoration Shaman',
    'Guardian': 'Feral (Tank)',
    'Protection1': 'Protection Paladin',
    'Protection': 'Protection Warrior',
    'Blood Tank': 'Blood DK (Tank)',
    'Fury': 'Fury Warrior',
    'Retribution': 'Retribution Paladin',
    'Unholy_DPS': 'Unholy DK',
    'Frost_DPS': 'Frost DK',
    'Feral': 'Feral (DPS)',
    'Combat': 'Combat Rogue',
    'Assassination': 'Assassination Rogue',
    'Demonology': 'Demonology Warlock',
    'Affliction': 'Affliction Warlock',
    'Marksmanship': 'Marksmanship Hunter',
    'Survival': 'Survival Hunter',
    'Shadow': 'Shadow Priest',
    'Balance': 'Balance Druid',
    'Elemental': 'Elemental Shaman',
    'Fire': 'Fire Mage',
    'Holy1': 'Holy Paladin',
    'Discipline': 'Discipline Priest',
    'Restoration': 'Restoration Druid',
    'Holy': 'Holy Priest',
}