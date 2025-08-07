# CleanLayer - AI Background Remover

A powerful web application that automatically removes backgrounds from images using deep learning. Built with a Python Flask backend utilizing the U²-NET deep learning model and a modern Next.js frontend with React and TypeScript.

<img width="1876" height="928" alt="CleanLayer1" src="https://github.com/user-attachments/assets/56e1a717-26a2-42f7-8c25-ea93bcb8ff0d" />
<img width="1876" height="932" alt="CleanLayer" src="https://github.com/user-attachments/assets/0a24ca55-5aa8-404c-bc7d-f3641d59c0c1" />

---

## 🔑 Key Features

### ✅ Modern UI/UX
- **Responsive Design**: Optimized for all screen sizes
- **Progress Indicators**: Real-time feedback with progress indicators
- **Error Handling**: Comprehensive error messages and retry options
- **Accessibility**: Full keyboard navigation and screen reader support
- **Drag & Drop Interface**: Modern React components with drag and drop support
  
### ✅ Automatic Background Remover
- Uses the state-of-the-art [U²-NET](https://github.com/xuebinqin/U-2-Net) deep learning model

### ✅ Live Preview
- Side-by-side comparison with transparent background visualization before downloads

### ✅ Advanced Export Options
- **Format Selection**: PNG (with transparency), JPG (smaller size), WebP (modern compression)
- **Custom Dimensions**: Set specific width/height or choose from presets (HD, 4K, etc.)
- **Aspect Ratio Control**: Maintain original proportions or create custom ratios
- **Quality Settings**: Adjustable compression for JPG and WebP formats
- **Smart Filenames**: Automatically generated names based on dimensions and format

---

## 💻 Tech Stack
<table>
  <tr>
    <td>
      <b>Frontend:</b>
    </td>
    <td>
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
      <img src="https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
      <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td>
      <b>Backend:</b>
    </td>
    <td>
      <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue" />
      <img src="https://img.shields.io/badge/OpenCV-27338e?style=for-the-badge&logo=OpenCV&logoColor=white" />
      <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
      <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td>
      <b>Deployment:</b>
    </td>
    <td>
      <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 18.17.0 or higher
- Git

### Quick Start
```bash
git clone https://github.com/ObsCure9277/Background-Remover.git
cd Background-Remover
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Download the U²NET model (one-time setup)
python download_model.py
```

### Start the Backend Server
```bash
cd backend
python app.py
```
The Flask server will start at `http://localhost:5000`

### Access the Application
Live Preview 👉 <a href="https://cleanlayer.vercel.app">View Website</a>

