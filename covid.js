
//-----------GLOBAL VAR------------
let countries = [];
var countriesRAW;
var dailyDeathRAW;

class Country {
    constructor(name, lastDate, confirmed, defunct, recovered) {
        this.name = name;
        this.lastDate = lastDate;
        this.confirmed = confirmed;
        this.defunct = defunct;
        this.recovered = recovered;
    }
}

//-----------ONLOAD------------
window.onload = () => {
    getCountriesNameJSON();
    cacheDailyDeath(); //Aqui fara el callback per a treure el load
    document.getElementById("key").addEventListener("keyup", () => { suggestionCountry() }, false);
    document.getElementById("suggestions").addEventListener("click",(event) => {
        let target = event.target; // A quin div ha clicat?
        onclickSearcher(target.innerHTML); // Buscar aquest click
    },false);
    //document.querySelectorAll(".btn", ".btn-info", " .btn-flat")[0].addEventListener("click", () => { onclickSearcher() }, false); //EL BOTO DE BUSQUEDA QUE NO SERVEIX :^)
}

const cacheDailyDeath = () => { //Al obrir guardar les dailyDeath al dailyDeathRAW
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            dailyDeathRAW = JSON.parse(this.responseText);
            stopLoad();
        }
    };
    xhttp.open("GET", "http://covid.codifi.cat/ecdc.php", true);
    xhttp.send();
}

const getCountriesNameJSON = () => {  //Fa el countriesRAW i fa la peticio fent un callback de que guardi un array de countries
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            countriesRAW = JSON.parse(this.responseText);
            getCountriesTotal();
        }
    };
    xhttp.open("GET", "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Coronavirus_2019_nCoV_Cases/FeatureServer/2/query?where=1%3D1&outFields=OBJECTID,Country_Region,Last_Update,Recovered,Deaths,Confirmed&outSR=4326&f=json", true);
    xhttp.send();
}

const getCountriesTotal = () => { //Mira el countriesRAW i agqafa tots els countries creant objectes amb les seves propietats
    let features = countriesRAW["features"];
    let featLeng = countriesRAW["features"].length;
    for (let i = 0; i < featLeng; i++) {
        countries[i] = new Country(features[i]["attributes"]["Country_Region"], convertTimeStampUnix(features[i]["attributes"]["Last_Update"]), features[i]["attributes"]["Confirmed"], features[i]["attributes"]["Deaths"], features[i]["attributes"]["Recovered"]);
    }
}


const stopLoad = () => { //Amagar la animacio de carregar
    let elem = document.querySelectorAll(".loading")[0];
    let op = 1;
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            elem.style.display = 'none';
        }
        elem.style.opacity = op;
        elem.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 10);
}
//--------------FUNCTIONS------------------

const onclickSearcher = (valPais) => { //al clicar la busqueda que volguem
    document.getElementById("key").value = "";
    suggestionCountry(); //Per a forçar que es tregui el suggerits
    printGlobalStats(valPais)
    printDailyDeath(valPais);
}

//-----DAILY------
const printDailyDeath = (paisABuscar) => {
    const dailDeathRecords = dailyDeathRAW["records"]; //Agafem totes les dades
    let dailyToPrint = []; //Aqui guardarem totes les que volem per el cas actual
    for (var i = 0; i < dailDeathRecords.length; i++) {
        //console.log(dailDeathRecords[i].countriesAndTerritories);
        if (String(dailDeathRecords[i].countriesAndTerritories) == String(paisABuscar)) { //En cuan trobem, solament mirarem desde aquella posicio, ja que tots els del mateix pais estan junts
            let o = 0;
            let puntReferencia = i;
            while (String(dailDeathRecords[puntReferencia].countriesAndTerritories) == String(paisABuscar)) {
                dailyToPrint[o] = dailDeathRecords[puntReferencia];
                o++;
                puntReferencia++;
            }
            break; //Per a que deixi de mirar tots els que hi ha
        }
    }

    //Aquesta part realitzarem l'HTML per a despres posarlo com a dades diaries
    let textHTMLDeathDaily = "";
    for (let x = 0; x < dailyToPrint.length; x++) {
        const dadesActual = dailyToPrint[x];
        textHTMLDeathDaily += `<div class="col-xl-2 col-lg-4 col-md-6"><div class="card mb-3"><div class="row no-gutters h-100"> <div class="col-12">
                    <div class="card-body">
                        <div><i class="fas fa-calendar-alt text-primary"></i> ${dadesActual.dateRep}</div>
                        <div><i class="fas fa-bug text-warning"></i> ${dadesActual.cases}</div>
                        <div><i class="fas fa-skull-crossbones text-danger"></i> ${dadesActual.deaths}</div>
                    </div>
                </div></div></div></div>`
    }
    document.getElementById("old_days").innerHTML = textHTMLDeathDaily;
}

//--------GLOBAL-------
const printGlobalStats = (paisABuscar) => { //Busquem el country que volem y llavors als elements li posarem les dades del que hem buscat
    let stats = countries.find(function (post, index) {
        if (post.name == paisABuscar)
            return true;
    });

    document.getElementById("current_date").innerHTML = stats.lastDate;
    document.getElementById("current_infected").innerHTML = stats.confirmed;
    document.getElementById("current_deaths").innerHTML = stats.defunct;
    document.getElementById("current_recovered").innerHTML = stats.recovered;
}



const suggestionCountry = () => {
    const valPais = document.getElementById("key").value;
    const elemSuggestion = document.getElementById("suggestions");
    if (valPais == "") {
        elemSuggestion.style.display = "none";
        return;
    }

    const results = countries.filter(x => x.name.toLowerCase().startsWith(valPais.toLowerCase()));

    let resultsHTML = "";
    for (let x in results) {
        resultsHTML += `<div>${results[x].name}</div>`
    }

    elemSuggestion.innerHTML = resultsHTML;
    elemSuggestion.style.display = "inline";
}

//-------MISC--------
const convertTimeStampUnix = (time) => { //Convertir temps, agafat de internet
    let unix_timestamp = time
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp);
    // Hours part from the timestamp
    var day = date.getDate();
    // Minutes part from the timestamp
    var month = date.getMonth() + 1;
    // Seconds part from the timestamp
    var year = date.getFullYear();

    // Will display time in 10:30:23 format
    var formattedTime = day + '/' + month + '/' + year;

    return formattedTime;
}

//NAMES
    //http://covid.codifi.cat/countries.php
//DAILY MUERTES
    //http://covid.codifi.cat/ecdc.php
//RECOVERED
    //https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Coronavirus_2019_nCoV_Cases/FeatureServer/2/query?where=1%3D1&outFields=OBJECTID,Country_Region,Last_Update,Recovered,Deaths,Confirmed&outSR=4326&f=json