# Cache Insight: Simulation & Analysis of Memory Access

🚀 **เครื่องมือจำลองและวิเคราะห์การเข้าถึงหน่วยความจำด้วย Cache**  
*A cache memory simulator for educational and analytical purposes*  

![ตัวอย่างการทำงานของโปรเจค](https://i.postimg.cc/5jc8WwQQ/Screenshot-31-3-2025-34016-localhost.jpg)  
*ตัวอย่างการทำงานของโปรเจค*  

---

## 🎓 เกี่ยวกับโปรเจค (About the Project)
โปรเจคนี้เป็นส่วนหนึ่งของรายวิชา **Computer Architecture (ComArch) Computer Engineering @ Kasetsart University Siracha Campus
โดยมีเป้าหมายเพื่อศึกษาและวิเคราะห์ประสิทธิภาพของ **Cache Mapping Techniques** ผ่านการจำลองและเปรียบเทียบผลลัพธ์ของ **Direct Mapped, Set-Associative และ Fully Associative Cache**  

🔹 **จุดประสงค์ของโปรเจค:**  
✔ ศึกษาพฤติกรรมการเข้าถึงหน่วยความจำในระบบแคช  
✔ เปรียบเทียบอัตรา **Cache Hit/Miss** ของแต่ละเทคนิค  
✔ วิเคราะห์ผลกระทบของ **Cache Size, Block Size และ Replacement Policy**  

---

## 📌 คุณสมบัติหลัก (Features)
✅ **รองรับสถาปัตยกรรมแคช 3 รูปแบบ**  
   - **Direct Mapped**  
   - **Set-Associative** (2-way, 4-way, 8-way, 16-way)  
   - **Fully Associative**  

✅ **สามารถปรับแต่งพารามิเตอร์ได้**  
   - ขนาดแคช (1-256 KB)  
   - ขนาดบล็อก (16-256 ไบต์)  
   - นโยบายแทนที่ (LRU, FIFO, Random)  
   - จำนวน Way ใน Set-Associative Cache  

✅ **แสดงผลและวิเคราะห์ผลลัพธ์**  
   - อัตรา **Cache Hit/Miss**  
   - กราฟแสดงผลการทำงานของแคช  
   - แสดงรูปแบบการเข้าถึงหน่วยความจำ  

---

## 🛠️ วิธีการติดตั้ง (Installation)

1. **โคลนโปรเจคจาก GitHub**  
```bash
git clone https://github.com/yourusername/cache-insight.git
cd cache-insight
```

2. **ติดตั้ง Dependencies**  
```bash
npm install
```

3. **รันโปรเจค**  
```bash
npm start
```

---

## 🖥️ วิธีการใช้งาน (Usage)

1. ตั้งค่าพารามิเตอร์ **Cache Size, Block Size, Mapping Technique, Replacement Policy**  
2. อัปโหลด **ไฟล์ CSV** ที่มีรายการ **Memory Address**  
3. กดปุ่ม **Start Simulation**  
4. วิเคราะห์ผลลัพธ์จาก **กราฟ Cache Hit/Miss**  

📄 **รูปแบบไฟล์ CSV ที่รองรับ**  
```csv
Address(Hex)
0x00000000
0x00000004
0x00000008
...
```

📌 **หมายเหตุ:**  
- เมื่อกดปุ่ม **Show All** อาจต้องใช้เวลานานในการประมวลผล (หากไฟล์มีขนาดใหญ่)  
- ระบบสามารถรับไฟล์ CSV ที่มีข้อมูล Address ได้ไม่จำกัด (ขึ้นอยู่กับประสิทธิภาพของเครื่องและเบราว์เซอร์)  

---

## 🌟 ตัวอย่างผลลัพธ์ (Examples)

### **Direct Mapped Cache**
![Direct Mapped](https://i.postimg.cc/c4ZQhcWP/Screenshot-31-3-2025-34410-localhost.jpg)  

### **Set-Associative Cache**
![Set-Associative](https://i.postimg.cc/nhr9SRPS/Screenshot-31-3-2025-34515-localhost.jpg)  

---

## 🧩 เทคโนโลยีที่ใช้ (Technologies)

- **Frontend**: React.js + Tailwind CSS  
- **Data Visualization**: Chart.js + react-chartjs-2  
- **CSV Processing**: PapaParse  
- **Routing**: React Router  
- **AI Tools Used**: ChatGPT, DeepSeek, Grok  

---

## 🗺️ แผนพัฒนาต่อไป (Roadmap)
- [ ] เพิ่มการจำลองแบบ **N-way Set-Associative**  
- [ ] เพิ่มฟังก์ชัน **ส่งออกผลลัพธ์เป็น PDF**  
- [ ] เพิ่มตัวอย่างข้อมูลให้หลากหลายขึ้น  
- [ ] รองรับ **Multi-Level Cache (L1, L2, L3)**  

---

## 👥 ผู้พัฒนา (Contributors)
- [Your Name](https://github.com/yourusername)  
- [Contributor 2](https://github.com/contributor2)  
- [Contributor 3](https://github.com/contributor3)  

📧 **ติดต่อเรา**: your.email@example.com  

---

## 🎓 ข้อมูลรายวิชา (Course Information)
- **รายวิชา:** Computer Architecture
- **สถาบัน:** Kasetsart University Siracha Campus 
- **ภาคเรียน:** ภาคเรียนที่ 2 ปีการศึกษา 2024  
- **ผู้สอน:** อาจารย์ Prasitthichai Narongleadrit 
