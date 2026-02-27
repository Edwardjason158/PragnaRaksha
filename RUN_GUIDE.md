# 🛠️ How to Run PragnaRaksha in VS Code

Follow these steps to get the system running locally on your machine.

---

### 1. Open the Project
Open the root `mvp` folder in VS Code.

### 2. Open Two Terminals
You need two separate terminal instances running at the same time (one for Backend, one for Frontend). You can split the terminal in VS Code using the **"Split Terminal"** button (icon with two squares) or `Ctrl + Shift + \`.

---

### 3. Start the Backend (FastAPI)
In the **first terminal**:

```powershell
# 1. Enter the backend directory
cd backend

# 2. Activate the virtual environment
.\venv\Scripts\activate

# 3. Start the server
uvicorn main:app --port 8000 --reload
```
*The backend will be live at `http://localhost:8000`*

---

### 4. Start the Frontend (React/Vite)
In the **second terminal**:

```powershell
# 1. Enter the frontend directory
cd frontend

# 2. Start the development server
npm run dev
```
*The frontend will be live at `http://localhost:5173`*

---

### 💡 Pro Tips for VS Code
- **Extensions**: Install the **"Python"** and **"ESLint"** extensions for the best experience.
- **Auto-Running**: You can create a file called `.vscode/tasks.json` to automate this, but split terminals areUsually easier to manage.
- **Debugging**: The frontend has HMR (Hot Module Replacement), so any code changes you make will show up instantly in your browser!

---

### 🛑 Troubleshooting
- **Port 8000 already in use?** Run `taskkill /F /IM python.exe` and try again.
- **Missing dependencies?** 
  - Backend: `pip install -r requirements.txt`
  - Frontend: `npm install`
