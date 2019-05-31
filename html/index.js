const GO = id => document.getElementById(id);
const GC = cls => document.getElementsByClassName(cls);

let food = {};

const contentElem = GC("content")[0];
const daysElem = GC("days")[0];
const weekElem = GO("currentWeek");
const settings = {
    foodUrl: "food.json",
    currentWeek: 0,
    updateInterval: 1000 * 60 * 60,
    lunchName: "Lunch",
    dinnerName: "Middag",
    noFoodMessage: "Kunde inte läsa in matsedeln.",
    weekDays: [
        {id: "mon", name: "Mån"},
        {id: "tue", name: "Tis"},
        {id: "wed", name: "Ons"},
        {id: "thu", name: "Tor"},
        {id: "fri", name: "Fre"},
        {id: "sat", name: "Lör"},
        {id: "sun", name: "Sön"},
    ]
};

Date.prototype.isLeapYear = function(){
    year = this.getFullYear();
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

Date.prototype.getWeek = function(){
    var months = [31, (this.isLeapYear() ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var days = 0;
    for(var i = 0;i < this.getMonth();i++){
        days += months[i];
    }
    days += this.getDate();
    return Number.isInteger(days / 7) ? Math.ceil(days / 7) + 1 : Math.ceil(days / 7);
}

function getToday(){
    let d = new Date();
    return d.getFullYear() + "-" + (((1 + d.getMonth()) + "").toString().length < 2 ? "0" + (1 + d.getMonth()) : "" + (1 + d.getMonth())) + "-" + ((d.getDate() + "").toString().length < 2 ? "0" + d.getDate() : "" + d.getDate());
}

function formatDate(str){
    let arr = str.split("-");
    if(arr.length != 3)
        return "-";
    return arr[2] + "/" + (arr[1].substring(0, 1) == "0" && arr[1].length > 1 ? arr[1].substring(1) : arr[1]);
}

function createAdvancedElement(type, args = {}){
    let elem = document.createElement(type);
    applyAttribute(elem, args);
    return elem;

    function applyAttribute(obj, args){
        for(let key in args){
            if(args.hasOwnProperty(key)){
                if(typeof args[key] == "object" && typeof obj[key] !== "undefined")
                    applyAttribute(obj[key], args[key]);
                else
                    obj[key] = args[key];
            }
        }
    }
}

function changeDay(elem){
    let id = typeof elem == "number" ? elem : parseInt(elem.dataset.id);
    let date = settings.weekDays[id];
    if(settings.currentWeek + "" in food){
        updateDays(food[settings.currentWeek], id);
        updateContent(food[settings.currentWeek][date.id]);
    }
}

function changeWeek(elem){
    let newWeek;
    if(typeof elem == "number")
        newWeek = elem + "";
    else {
        if(elem.className.includes("otherWeekDisabled"))
            return;
        let delta = parseInt(elem.dataset.delta);
        let current = parseInt(weekElem.innerText);
        newWeek = (current + delta) + "";
    }
    if(newWeek in food){
        weekElem.innerText = newWeek;
        settings.currentWeek = newWeek;
        GC("weeks")[0].children[0].className = ((parseInt(newWeek) - 1) + "") in food ? "otherWeek": "otherWeek otherWeekDisabled";
        GC("weeks")[0].children[2].className = ((parseInt(newWeek) + 1) + "") in food ? "otherWeek": "otherWeek otherWeekDisabled";
        updateDays(food[newWeek], 0);
        updateContent(food[newWeek][settings.weekDays[0].id]);
    }
    else {
        contentElem.innerHTML = "";
        contentElem.appendChild(createAdvancedElement("DIV", {  className: "row noFood",  innerText: settings.noFoodMessage   }));
    }
}

function updateDays(data, activeID, noDate = false){
    let weekDays = settings.weekDays;
    for(let i = 0;i < weekDays.length;i++){
        daysElem.children[i].className = activeID == i ? "day dayActive" : "day";
        daysElem.children[i].children[0].innerText = weekDays[i].name;
        daysElem.children[i].children[1].innerText = noDate ? "-" : formatDate(data[weekDays[i].id].date);
        daysElem.children[i].children[2].style.display = data[weekDays[i].id].date == getToday() ? "flex" : "none";
    }
}

function updateContent(food){
    contentElem.innerHTML = "";
    contentElem.appendChild(createAdvancedElement("DIV", {  className: "row rowTitle",  innerText: settings.lunchName   }));
    for(let row of food.lunch)
        contentElem.appendChild(createAdvancedElement("DIV", {  className: "row",   innerText: row  }));
    contentElem.appendChild(createAdvancedElement("DIV", {  className: "row rowTitle",  innerText: settings.dinnerName  }));
    for(let row of food.dinner)
        contentElem.appendChild(createAdvancedElement("DIV", {  className: "row",   innerText: row  }));
}

function retrieveFood(){
    fetch(settings.foodUrl)
    .then(response => response.json())
    .then(json => {
        food = json;
        updateAll();
    })
    .catch(err => console.log(err));
}

function updateAll(){
    let currentWeek = new Date().getWeek();
    let currentDay = (new Date().getDay() + 6) % 7;
    changeWeek(currentWeek);
    changeDay(currentDay);
}

document.body.onload = () => {
    retrieveFood();
    // Update regularly
    setInterval(() => {
        retrieveFood();
    }, settings.updateInterval);
};
