import csv

# สร้าง Sequential Access Pattern
def generate_sequential_addresses(start_address, num_addresses, step):
    addresses = []
    current_address = start_address
    for _ in range(num_addresses):
        addresses.append(f"0x{current_address:04X}")
        current_address += step
    return addresses

# ตั้งค่าพารามิเตอร์
start_address = 0x1000  # เริ่มที่ Address 0x1000
num_addresses = 10000   # จำนวน Addresses
step = 4                # ขนาด Step (4 Bytes)

# สร้าง Addresses
sequential_addresses = generate_sequential_addresses(start_address, num_addresses, step)

# เขียนลงไฟล์ CSV
with open('sequential_access.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Address(Hex)"])  # เขียน Header
    for address in sequential_addresses:
        writer.writerow([address])

print("Sequential Access CSV created successfully!")