import csv

# สร้าง Looping Access Pattern
def generate_looping_addresses(loop_addresses, num_addresses):
    addresses = []
    loop_length = len(loop_addresses)
    for i in range(num_addresses):
        address = loop_addresses[i % loop_length]
        addresses.append(address)
    return addresses

# ตั้งค่าพารามิเตอร์
loop_addresses = ["0x1000", "0x2000", "0x3000", "0x4000"]  # Addresses ที่จะ Loop
num_addresses = 10000  # จำนวน Addresses

# สร้าง Addresses
looping_addresses = generate_looping_addresses(loop_addresses, num_addresses)

# เขียนลงไฟล์ CSV
with open('looping_access.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Address(Hex)"])  # เขียน Header
    for address in looping_addresses:
        writer.writerow([address])

print("Looping Access CSV created successfully!")