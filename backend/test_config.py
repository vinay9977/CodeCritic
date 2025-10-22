"""
Test if OpenAI and other configurations are set up correctly
Run: python test_config.py
"""
import os
from dotenv import load_dotenv

# Load from parent directory .env
load_dotenv("../.env")

print("🔍 Checking Configuration...\n")

# Check OpenAI Key
openai_key = os.getenv("OPENAI_API_KEY")
if openai_key:
    print(f"✅ OPENAI_API_KEY: {openai_key[:10]}...{openai_key[-4:]}")
else:
    print("❌ OPENAI_API_KEY: NOT FOUND")
    print("   Add to .env: OPENAI_API_KEY=sk-your-key-here")

# Check GitHub Keys
github_client_id = os.getenv("GITHUB_CLIENT_ID")
github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")

if github_client_id:
    print(f"✅ GITHUB_CLIENT_ID: {github_client_id[:10]}...")
else:
    print("❌ GITHUB_CLIENT_ID: NOT FOUND")

if github_client_secret:
    print(f"✅ GITHUB_CLIENT_SECRET: {github_client_secret[:10]}...")
else:
    print("❌ GITHUB_CLIENT_SECRET: NOT FOUND")

# Check Database
db_url = os.getenv("DATABASE_URL")
if db_url:
    print(f"✅ DATABASE_URL: {db_url[:30]}...")
else:
    print("❌ DATABASE_URL: NOT FOUND")

# Check JWT Secret
jwt_secret = os.getenv("JWT_SECRET_KEY")
if jwt_secret:
    print(f"✅ JWT_SECRET_KEY: {jwt_secret[:10]}...")
else:
    print("❌ JWT_SECRET_KEY: NOT FOUND")

print("\n" + "="*50)

# Test OpenAI connection
if openai_key:
    print("\n🧪 Testing OpenAI Connection...")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        
        # Simple test
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'OK' if this works"}],
            max_tokens=10
        )
        print(f"✅ OpenAI API working! Response: {response.choices[0].message.content}")
        
    except Exception as e:
        print(f"❌ OpenAI API Error: {str(e)}")
else:
    print("\n⚠️  Skipping OpenAI test (no API key)")

print("\n✨ Configuration check complete!")