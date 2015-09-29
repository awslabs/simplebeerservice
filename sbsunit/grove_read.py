
from grovepi import grovepi

values = {}
values["ultrasonic"] = grovepi.ultrasonicRead(7)
grovepi.pinMode(0,"INPUT")
values["sound"] = grovepi.analogRead(0)
values["flow"] = grovepi.digitalRead(5)
values["dht"] = grovepi.dht(6, 1)
print str(values)
