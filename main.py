from retrieveFood import *
import json, time, requests

def readFromFile(filename):
    try:
        file = open(filename, "r")
        data = file.read()
        file.close()
        food = json.loads(data)
        return food
    except:
        return {}

# ----- Start of program ----- #

menuID = 14
url = "https://slypeog.com/food/updateFood.php"
authKey = "" # Hidden from git

currentWeek = getWeek()
food = readFromFile("food.json")

for i in range(-1, 3):
    weekID = str(currentWeek + i)
    if weekID not in food:
        food[weekID] = retrieveFood(menuID, i)
    time.sleep(0.5)

file = open("food.json", "w")
file.write(json.dumps(food))
file.close()

payload = {"auth": authKey, "food": json.dumps(food)}
req = requests.post(url, data = payload)
