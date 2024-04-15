/* window.addEventListener("load", refreshPage); */
const baseUrl = 'https://neptune.fibrecat.org/pugsters-api-gateway/';
const compositionUrl = 'https://api.codetabs.com/v1/proxy/?quest=https://raid-helper.dev/api/raidplan';

const checkButtonElement = document.querySelector('.check');
const reloadButtonElement = document.querySelector('.reload');
const dupesArea = document.querySelector('.dupesOutput');
const errorArea = document.getElementById('errors');

const eventsIDs = [];

const playersArray = [];
const playersInstancesArray = [];

setTimeout(() => getData(), 500);
setTimeout(() => createPlayers(), 3000);
setTimeout(() => getDupedPlayers(), 5000);

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
}

function createPlayers() {
    eventsIDs.forEach(eventID => {
        fetch(`${compositionUrl}/${eventID}`)
            .then(response => {
                return response.json()
            })
            .then(data => {
                const charArray = data.raidDrop;

                charArray.forEach(character => {
                    const playerName = character.name;
                    const characterSpec = character.spec;

                    let player = {};
                    player[playerName] = characterSpec;

                    playersArray.push(player);

                })
            })
            .catch(err => {
                errorArea.style.display = 'block';
                errorArea.textContent = 'Some of the events have less than 1 players insert. Those events are ignored.'
            })
    })
}

function getDupedPlayers() {
    playersArray.forEach(player => {
        let name = Object.keys(player);
        let spec = Object.values(player);

        if (specMap[spec] !== undefined) {
            spec = specMap[spec];
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
}

checkButtonElement.addEventListener('click', (e) => {
    if (playersInstancesArray.length < 1) {
        setTimeout(() => getData(), 500);
        setTimeout(() => createPlayers(), 3000);
        setTimeout(() => getDupedPlayers(), 5000);
    }

    dupesArea.innerHTML = '';
    
    const dupedPlayers = playersInstancesArray.filter(player => player.duped == true);

    dupedPlayers.forEach(player => {
        const text = player.ToStringDuped();

        const pElement = document.createElement('p');
        pElement.textContent = text;

        dupesArea.appendChild(pElement);
    })
})

reloadButtonElement.addEventListener('click', (e) => {
    eventsIDs.length = 0;
    playersArray.length = 0;
    playersInstancesArray.length = 0;

    errorArea.style.display = 'none';
    dupesArea.innerHTML = '';

    checkButtonElement.setAttribute('disabled', 'disabled');
    reloadButtonElement.setAttribute('disabled', 'disabled');

    setTimeout(() => getData(), 500);
    setTimeout(() => createPlayers(), 3000);
    setTimeout(() => getDupedPlayers(), 5000);
})

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

        let text = `${this.name}: ${dupedSpecs} - ${this.specCount - Object.values(this.specs).length} times.`;

        return text;
    }
}

const specMap = {
    'Restoration1': 'Restoration Shaman',
    'Guardian': 'Feral (Tank)',
    'Protection1': 'Protection Paladin',
    'Protection':'Protection Warrior',
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

