from bs4 import BeautifulSoup
import datetime, requests, time, re, json, copy

content = {
    "days": {
    	"måndag": "mon",   "tisdag": "tue",   "onsdag": "wed",
    	"torsdag": "thu",  "fredag": "fri",    "lördag": "sat",   "söndag": "sun"
    },
    "weekdays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "events": { "lunch": "lunch",  "middag": "dinner" },
    "foodTemplate": {"mon": {}, "tue": {}, "wed": {}, "thu": {}, "fri": {}, "sat": {}, "sun": {}}
}

def with0(t):
    return str(t) if len(str(t)) > 1 else "0" + str(t)

def getWeek():
    d = datetime.date.today()
    return d.isocalendar()[1]

def getMonday(delta):
    d = datetime.date.today()
    d += datetime.timedelta(days = delta * 7 - d.weekday())
    return "{}-{}-{}".format(d.year, with0(d.month), with0(d.day))

# 14 == Erikslund
def constructUrl(id, delta):
    monday = getMonday(delta)
    return "http://www.aivomenu.se/ShowMenu.aspx?MenuId={}&date={}".format(id, monday)

def getToday():
    wd = datetime.date.today().weekday()
    global content
    if wd < len(content["weekdays"]):
        return content["weekdays"][wd]
    return ""

# Returns (day, event, date) >> None or name
def evalDayOrEvent(div):
    string = div.text.lstrip().replace("\n", "").lower()
    date = re.sub("([^0-9\-])", "", string)
    global content
    for day in content["days"]:
        if day in string:
            return (content["days"][day], None, date)
    for event in content["events"]:
        if event in string:
            return (None, content["events"][event], None)
    if "idag" in string:
        return (getToday(), None, date)
    return (None, None)


def retrieveFood(id, deltaWeek):
    global content

    url = constructUrl(id, deltaWeek)
    response = requests.get(url)

    html = BeautifulSoup(response.text, 'html.parser')
    htmlTables = html.find_all('table')

    divs = []
    if len(htmlTables) >= 4:
        divs = htmlTables[3].find_all('div')
    else:
        return False

    food = copy.deepcopy(content["foodTemplate"])
    activeDay = ""
    activeDate = ""
    activeEvent = ""

    for div in divs:
        if len(div.find_all("b")) > 0:
            for b in div.find_all("b"):
                tDay, tEvent, tDate = evalDayOrEvent(b)
                if tDay:
                    activeDay = tDay
                    activeDate = tDate
                if tEvent: activeEvent = tEvent

        elif div.string != None:
            if activeDate != "" and "date" not in food[activeDay]:
                food[activeDay]["date"] = activeDate
            if activeEvent not in food[activeDay]:
                food[activeDay][activeEvent] = []
            food[activeDay][activeEvent].append(div.string.strip())

    return copy.deepcopy(food)
