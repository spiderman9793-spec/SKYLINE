import pyttsx3
import time
import pyjokes
import random

joke = pyjokes.get_joke()

engine = pyttsx3.init()
engine.say("Here's a time for you: " + time.strftime("%H:%M:%S"))
engine.runAndWait()
print("Here's a time for you: " + time.strftime("%H:%M:%S"))
print("Here's a joke for you: " + joke)
engine.say("Here's a joke for you: " + joke)
engine.runAndWait()