import random
import time
from colorama import Fore, init

init()

color = [Fore.RED, Fore.BLUE, Fore.GREEN, Fore.WHITE]

for i in range(1, 101):
    print(f"{random.choice(color)}{i}. sayang rapa")
    time.sleep(00.1)
