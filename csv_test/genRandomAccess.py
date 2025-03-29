import os
import csv
import random

# Directory where the file will be saved
directory = '/'

# Check if the directory exists, if not, create it
if not os.path.exists(directory):
    os.makedirs(directory)

# สร้าง Random Access Pattern
def generate_random_addresses(num_addresses, address_range):
    addresses = []
    for _ in range(num_addresses):
        address = random.randint(0, address_range)
        addresses.append(f"0x{address:04X}")
    return addresses

# ตั้งค่าพารามิเตอร์
num_addresses = 1000000   # จำนวน Addresses
address_range = 0xFFFF  # ช่วง Address (0x0000 ถึง 0xFFFF)

# สร้าง Addresses
random_addresses = generate_random_addresses(num_addresses, address_range)

# เขียนลงไฟล์ CSV
with open(os.path.join(directory, '_1M_random_access.csv'), 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Address(Hex)"])  # เขียน Header
    for address in random_addresses:
        writer.writerow([address])

print("Random Access CSV created successfully!")