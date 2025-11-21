## 📚 Ollama PDF Analyzer

🌟 **Project Overview**

The Ollama PDF Analyzer is a full-stack web application designed to **extract, document, and refine key structured variables** from uploaded PDF documents using a **local Large Language Model (LLM)**. This ensures data processing is performed securely on your local machine.

The application follows a dual-component architecture:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python (FastAPI) | Handles secure PDF uploads, text extraction (using `pypdf`), and communication with a local **Ollama** instance for LLM analysis (e.g., identifying dates, rates, or metrics). It also provides an endpoint for refining extracted variables based on user feedback. |
| **Frontend** | React (Vite) | Interactive user interface styled with **Tailwind CSS**. It allows users to upload a PDF, view the LLM's analysis results in a structured table, and interactively edit or refine the extracted variables. |

---

### 🚀 Getting Started

Follow these steps to clone and run the project on your local device.

#### 📋 Prerequisites

Ensure you have the following installed:

* **Python 3.10+** (Conda/Miniconda recommended for environment management)
* **Node.js** (LTS version) and **npm** (for the frontend)
* **Ollama**: Download and install the Ollama service.

> **Crucial Step:** Ensure the Ollama service is running, and you have pulled the required LLM model (e.g., `llama3` or the model specified in `main.py` code). The backend relies on Ollama being accessible locally on its default port.

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-project-directory>
```

#### 2. Set Up the Backend (FastAPI/Python)

**a. Create and Activate the Conda Environment:**
The Python dependencies are listed in `environment.yml`.

```bash
conda env create -f environment.yml
conda activate pdf
```

**b. Run the Backend Server:**
The server will run on `http://127.0.0.1:8000` by default.

```bash
uvicorn main:app --reload
```

*Keep this terminal window open and running.*

#### 3. Set Up the Frontend (React/Vite)

**a. Install Dependencies:**
Install the Node.js dependencies listed in `package.json`.

```bash
npm install
```

**b. Start the Development Server:**
The frontend server will typically start on `http://localhost:5173`.

```bash
npm run start
```

-----

#### 4. Usage

1.  Verify that both the FastAPI backend (running on port **8000**) and the React frontend (running on port **5173**) are active.
2.  Open the frontend application in your browser (e.g., **http://localhost:5173**).
3.  Upload a PDF document using the provided interface.
4.  The application will send the PDF to the backend for analysis by Ollama, displaying the extracted variables in real-time within the UI.

-----

### 🛠️ Technologies Used

  * **Backend:** Python, FastAPI, PyPDF, Ollama Python Client, Conda
  * **Frontend:** React, Vite, Tailwind CSS
  * **AI/LLM:** Ollama (running local models)
