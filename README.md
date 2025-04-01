# Cache Insight: Simulation & Analysis of Memory Access
Youtube:https://youtu.be/nlsk0XR7LXg

🚀 **A cache memory simulator for educational and analytical purposes**  
*A tool for simulating and analyzing memory access behavior using different cache mapping techniques.*  

![Project Screenshot](https://i.postimg.cc/5jc8WwQQ/Screenshot-31-3-2025-34016-localhost.jpg)  
*Example of project in action*  

---

## 🎓 About the Project
This project is part of the **Computer Architecture (ComArch) course at Kasetsart University Siracha Campus, Thailand**. It aims to study and analyze the performance of **Cache Mapping Techniques** by simulating and comparing the results of **Direct Mapped, Set-Associative, and Fully Associative Cache**.

🔹 **Project Objectives:**  
✔ Understand memory access behavior in cache systems  
✔ Compare **Cache Hit/Miss rates** for different techniques  
✔ Analyze the impact of **Cache Size, Block Size, and Replacement Policy**  

---

## 📌 Key Features
✅ **Supports 3 Cache Architectures:**  
   - **Direct Mapped**  
   - **Set-Associative** (2-way, 4-way, 8-way, 16-way)  
   - **Fully Associative**  

✅ **Configurable Parameters:**  
   - Cache Size (1-256 KB)  
   - Block Size (16-256 Bytes)  
   - Replacement Policy (LRU, FIFO, Random)  
   - Number of Ways in Set-Associative Cache  

✅ **Result Visualization & Analysis:**  
   - **Cache Hit/Miss Rate**  
   - Graphs displaying cache performance  
   - Memory access pattern visualization  

---

## 🛠️ Installation

1. **Clone the project from GitHub:**  
```bash
git clone https://github.com/yourusername/cache-insight.git
cd cache-insight
```

2. **Install dependencies:**  
```bash
npm install
```

3. **Run the project:**  
```bash
npm start
```

---

## 🖥️ How to Use

1. Set parameters **Cache Size, Block Size, Mapping Technique, Replacement Policy**  
2. Upload a **CSV file** containing **Memory Addresses**  
3. Click **Start Simulation**  
4. Analyze results using **Cache Hit/Miss Graphs**  

📄 **Supported CSV File Format:**  
```csv
Address(Hex)
0x00000000
0x00000004
0x00000008
...
```

📌 **Note:**  
- Clicking **Show All** may take longer if the file is large  
- The system can handle large CSV files, depending on the performance of the machine and browser  

---

## 🌟 Example Results

### **Direct Mapped Cache**
![Direct Mapped](https://i.postimg.cc/c4ZQhcWP/Screenshot-31-3-2025-34410-localhost.jpg)  

### **Set-Associative Cache**
![Set-Associative](https://i.postimg.cc/nhr9SRPS/Screenshot-31-3-2025-34515-localhost.jpg)  

---

## 🧩 Technologies Used

- **Frontend**: React.js + Tailwind CSS  
- **Data Visualization**: Chart.js + react-chartjs-2  
- **CSV Processing**: PapaParse  
- **Routing**: React Router  
- **AI Tools Used**: ChatGPT, DeepSeek, Grok  

---

## 🗺️ Future Development (Roadmap)
- [ ] Add **N-way Set-Associative simulation**  
- [ ] Implement **result export as PDF**  
- [ ] Provide more diverse example datasets  
- [ ] Support **Multi-Level Cache (L1, L2, L3)**  

---

## 👥 Contributors
- [Natthaphon P.](https://github.com/Nattopacirus)  
- [IMLV1](https://github.com/IMLV1)  
- [Picklock29](https://github.com/Picklock29)  

---

## 🎓 Course Information
- **Course:** Computer Architecture  
- **Institution:** Kasetsart University Siracha Campus, Thailand  
- **Semester:** 2nd Semester, Academic Year 2024  
- **Instructor:** Prasitthichai Narongleadrit  

