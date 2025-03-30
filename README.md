```markdown
# Cache Simulation Project

เครื่องจำลองการทำงานของแคชเมโมรีสำหรับการศึกษา 🚀  
*A cache memory simulator for educational purposes*

![ตัวอย่างการทำงานของโปรเจค](https://i.postimg.cc/5jc8WwQQ/Screenshot-31-3-2025-34016-localhost.jpg)
*ตัวอย่างการทำงานของโปรเจค*

## 📌 คุณสมบัติหลัก (Features)

- **รองรับสถาปัตยกรรมแคช 3 แบบ**:
  - แคชแบบ Direct Mapped
  - แคชแบบ Set-Associative
  - แคชแบบ Fully Associative
- **ปรับแต่งพารามิเตอร์ได้**:
  - ขนาดแคช (1-256 KB)
  - ขนาดบล็อก (16-256 ไบต์)
  - นโยบายแทนที่ (LRU, FIFO, Random)
  - ระดับความสัมพันธ์ (2-way, 4-way, 8-way, 16-way)
- **วิเคราะห์ผลลัพธ์**:
  - อัตราการ Hit/Miss
  - กราฟแสดงความสัมพันธ์ระหว่างพารามิเตอร์ต่างๆ
  - แสดงรูปแบบการเข้าถึงหน่วยความจำ

## 🛠️ วิธีการติดตั้ง (Installation)

1. โคลนโปรเจค:
```bash
git clone https://github.com/yourusername/cache-simulator.git
cd cache-simulator
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. รันโปรเจค:
```bash
npm start
```

## 🖥️ วิธีการใช้งาน (Usage)

1. กำหนดค่าพารามิเตอร์ในหน้า Simulation
2. อัปโหลดไฟล์ CSV หรือใช้ข้อมูลตัวอย่าง
3. กด "Start Simulation"
4. วิเคราะห์ผลลัพธ์ในหน้าผลลัพธ์

**รูปแบบไฟล์ CSV:**
```csv
Address(Hex)
0x00000000
0x00000004
0x00000008
...
```

## 🌟 ตัวอย่างผลลัพธ์ (Examples)

![ตัวอย่างผลลัพธ์ Direct Mapped](https://i.postimg.cc/c4ZQhcWP/Screenshot-31-3-2025-34410-localhost.jpg)  
*ผลลัพธ์การจำลองแบบ Direct Mapped*

![ตัวอย่างผลลัพธ์ Set-Associative](https://i.postimg.cc/nhr9SRPS/Screenshot-31-3-2025-34515-localhost.jpg)  
*ผลลัพธ์การจำลองแบบ Set-Associative*

## 🧩 เทคโนโลยีที่ใช้ (Technologies)

- **Frontend**: React.js + Tailwind CSS
- **Data Visualization**: Chart.js
- **CSV Processing**: Papaparse
- **Routing**: React Router
- **AI Tool**: Chatgpt,deepseek,grok

---

```
**Roadmap** (แผนพัฒนาต่อไป):
   ```markdown
   ## 🗺️ แผนพัฒนาต่อไป (Roadmap)
   - [ ] เพิ่มการจำลองแบบ N-way Set-Associative
   - [ ] เพิ่มฟังก์ชันส่งออกผลลัพธ์เป็น PDF
   - [ ] เพิ่มตัวอย่างข้อมูลให้หลากหลายขึ้น
```
