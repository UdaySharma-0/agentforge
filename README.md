# AgentForge

Production-grade AI Agent platform.

## Stack
- Backend: Node.js + Express
- AI Service: Python + FastAPI
- DB: MongoDB Atlas
- Vector Search: MongoDB Atlas
- LLM: Groq (gpt-oss-20b)

## Setup

### AI Agent Service
```bash
cd ai-agent-service
python -m venv venv
source venv/bin/activate  # windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload


### Backend
```bash
cd backend
npm install
cp .env.example .env
npm start


netstat -ano | findstr :3000


“Don’t build a chatbot. Build the easiest way to deploy intelligence anywhere.”