# 🔍 CodeCritic AI

**AI-Powered Code Review and Analysis Platform**

CodeCritic AI is an intelligent code analysis platform that leverages OpenAI's GPT models to automatically review your GitHub repositories, identify code issues, and provide actionable suggestions for improvement.

---

## ✨ Features

- **🔐 GitHub OAuth Integration** - Seamlessly connect your GitHub account
- **📊 Repository Synchronization** - Automatically sync all your repositories
- **🤖 AI-Powered Code Analysis** - Smart code review using OpenAI GPT models
- **🎯 Issue Detection** - Identify security vulnerabilities, bugs, and code quality issues
- **📈 Quality Scoring** - Get an overall code quality score (0-100)
- **🏷️ Severity Classification** - Issues categorized by severity (Critical, High, Medium, Low)
- **💡 Smart Suggestions** - Actionable recommendations for fixing identified issues
- **📱 Modern UI** - Clean, responsive dashboard built with Next.js and Tailwind CSS
- **⚡ Cost-Optimized** - Smart code sampling to minimize API costs

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Reliable relational database
- **OpenAI API** - GPT-powered code analysis
- **GitHub API** - Repository and code access
- **Python 3.8+**

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide Icons** - Beautiful icon library

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**
- **Node.js 18+** and npm/yarn
- **PostgreSQL** database
- **GitHub OAuth App** credentials
- **OpenAI API Key**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codecritic.git
cd codecritic
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/codecritic

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# JWT Secret (generate a secure random string)
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API URL
API_URL=http://localhost:8000
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

### 5. Database Setup

The database tables will be created automatically when you first run the backend. To verify:

```bash
cd backend
python diagnose_database.py
```

---

## 🎯 Usage

### 1. **Login with GitHub**
   - Navigate to `http://localhost:3000`
   - Click "Login with GitHub"
   - Authorize the application

### 2. **Sync Repositories**
   - After logging in, click "Sync Repositories"
   - Your GitHub repositories will be imported

### 3. **Analyze Code**
   - Select a repository from your dashboard
   - Click "Analyze Repository"
   - Wait for the AI analysis to complete

### 4. **View Results**
   - See your code quality score
   - Review identified issues by severity
   - Read suggestions for improvements

---

## 📊 API Endpoints

### Authentication
- `GET /api/v1/auth/github/login` - Initiate GitHub OAuth
- `POST /api/v1/auth/github/callback` - Handle OAuth callback
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout user

### Repositories
- `POST /api/v1/repositories/sync` - Sync GitHub repositories
- `GET /api/v1/repositories/list` - List user repositories
- `GET /api/v1/repositories/{id}` - Get repository details
- `GET /api/v1/repositories/stats/summary` - Get repository stats
- `DELETE /api/v1/repositories/{id}` - Delete repository

### Analysis
- `POST /api/v1/analysis/analyze/{repository_id}` - Start code analysis
- `GET /api/v1/analysis/list` - List all analyses
- `GET /api/v1/analysis/{id}` - Get analysis details
- `GET /api/v1/analysis/{id}/issues` - Get analysis issues
- `GET /api/v1/analysis/repository/{repository_id}` - Get repository analyses

---

## 🔍 How It Works

1. **Code Sampling**: The system intelligently samples code files to minimize OpenAI API costs while maintaining analysis accuracy
2. **AI Analysis**: OpenAI's GPT models analyze the code for:
   - Security vulnerabilities (SQL injection, XSS, etc.)
   - Code quality issues
   - Performance problems
   - Best practice violations
3. **Issue Classification**: Issues are categorized by:
   - **Severity**: Critical, High, Medium, Low
   - **Category**: Security, Quality, Performance, Style
4. **Actionable Insights**: Each issue includes specific suggestions for remediation

---

## 🔧 Configuration

### Analysis Settings

You can customize the analysis behavior in `backend/app/services/openai_service.py`:

- **Model**: Change the OpenAI model (default: `gpt-4`)
- **Max Files**: Limit files analyzed per repository
- **Max Lines**: Limit lines analyzed per file
- **Temperature**: Control AI creativity (0-1)

### Cost Optimization

The platform includes several cost-saving features:
- Smart file sampling (prioritizes important files)
- Token counting before API calls
- Quick scoring for preliminary checks
- Configurable analysis depth

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Check database connection
cd backend
python diagnose_database.py

# Fix repository ownership
python fix_repository_ownership.py
```

### Repository Not Appearing
- Ensure you've synced repositories after login
- Check that your GitHub token is valid
- Verify database user_id matches logged-in user

### Analysis Fails
- Verify OpenAI API key is valid
- Check API quota/billing
- Ensure repository has analyzable code files

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing powerful language models
- **GitHub** for API access and OAuth
- **FastAPI** and **Next.js** communities for excellent frameworks

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 🔮 Future Enhancements

- [ ] Support for more programming languages
- [ ] Code fix suggestions with diff preview
- [ ] Integration with CI/CD pipelines
- [ ] Team collaboration features
- [ ] Historical analysis tracking
- [ ] Custom rule configuration
- [ ] Export reports (PDF, Markdown)
- [ ] Webhook notifications

---



