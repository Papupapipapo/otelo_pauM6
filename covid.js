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

window.onload = () => {
    getCountriesNameJSON();
    cacheDailyDeath();
    document.querySelectorAll(".btn",".btn-info"," .btn-flat")[0].addEventListener("click", () => {onclickDailyDeath()},false);
}
/*
let actualCountry = {
    name: "",
    lastDate: "01/01/2020",
    confirmed: 0,
    defunct: 0,
    recovered: 0,
}*/

const cacheDailyDeath = () => {
    
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            dailyDeathRAW = JSON.parse(this.responseText);
            console.log(dailyDeathRAW);
        }
    };
    xhttp.open("GET", "http://covid.codifi.cat/ecdc.php", true);
    xhttp.send();
}

const onclickDailyDeath = () => {
    const valPais = document.getElementById("key").value;
    //FILTER QUE CONTINGUI EL NOM DEL PAIS EXACTAMENT
    console.log(Object.entries(dailyDeathRAW["records"]));
    let dailyToPrint = Object.fromEntries(
        Object.entries(dailyDeathRAW["records"]).filter(([key, value]) => key[1].filter(([key2, value]) => key2 == 'Albania')) )
    console.log(dailyToPrint);
    //printDailyDeath(dailyToPrint);
}
const printDailyDeath = (dailySelectedCountryStats) => {
    
    for(let x in dailySelectedCountryStats){
        console.log(x)  
    }

}



//ONCLICK DE BOTON HACER LA BUSQUEDA DE RECIENTES con funcion que los buscara y generara
    //en cuanto ya lo tenga cambiar valores de total tambien
//ontype (existe?) enn la barra de input de cercar empezar a buscar haciendo array filter con countries aux


const convertTimeStampUnix = (time) => {
    let unix_timestamp = time
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp);
    // Hours part from the timestamp
    var day = date.getDate();
    // Minutes part from the timestamp
    var month =  date.getMonth() + 1;
    // Seconds part from the timestamp
    var year = date.getFullYear();

    // Will display time in 10:30:23 format
    var formattedTime = day + '/' + month + '/' + year;

    return formattedTime;
}

const getCountriesTotal = () => {
    let features = countriesRAW["features"];
    let featLeng = countriesRAW["features"].length;
    let htmlCountries = "";
    for (let i = 0; i < featLeng; i++) {
        countries[i] = new Country(features[i]["attributes"]["Country_Region"], convertTimeStampUnix(features[i]["attributes"]["Last_Update"]), features[i]["attributes"]["Confirmed"], features[i]["attributes"]["Deaths"], features[i]["attributes"]["Recovered"]);
        
        //htmlCountries += "<option value='" + codiPostalCarrer + "'>" + nomCarrer + " (" + tipusViaCarrer + ")</option>";
    }
    console.log(countries);
}

const getCountriesNameJSON = () => {
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


function getJSON() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            vartosave = JSON.parse(this.responseText);

        }
    };
    xhttp.open("GET", String(url), true);
    xhttp.send();

}


//NAMES
    //http://covid.codifi.cat/countries.php
//DAILY MUERTES
    //http://covid.codifi.cat/ecdc.php
//RECOVERED
    //https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Coronavirus_2019_nCoV_Cases/FeatureServer/2/query?where=1%3D1&outFields=OBJECTID,Country_Region,Last_Update,Recovered,Deaths,Confirmed&outSR=4326&f=json