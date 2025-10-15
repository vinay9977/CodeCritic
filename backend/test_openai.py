"""
Detailed OpenAI connection test
Run: python test_openai.py
"""
import os
from dotenv import load_dotenv

load_dotenv("../.env")

print("🔍 Testing OpenAI API Connection...\n")

openai_key = os.getenv("OPENAI_API_KEY")

if not openai_key:
    print("❌ OPENAI_API_KEY not found in .env")
    exit(1)

print(f"✅ API Key found: {openai_key[:15]}...{openai_key[-4:]}\n")

# Test 1: Basic import
print("Test 1: Importing OpenAI library...")
try:
    from openai import OpenAI
    print("✅ OpenAI library imported successfully\n")
except ImportError as e:
    print(f"❌ Failed to import OpenAI: {e}")
    print("Run: pip install openai==1.12.0")
    exit(1)

# Test 2: Create client
print("Test 2: Creating OpenAI client...")
try:
    client = OpenAI(api_key=openai_key)
    print("✅ Client created successfully\n")
except Exception as e:
    print(f"❌ Failed to create client: {e}\n")
    exit(1)

# Test 3: Simple API call with timeout
print("Test 3: Making API call...")
try:
    import httpx
    
    # Create client with custom timeout
    client = OpenAI(
        api_key=openai_key,
        timeout=30.0,
        max_retries=2
    )
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": "Say 'Hello' if you can read this"}
        ],
        max_tokens=20
    )
    
    result = response.choices[0].message.content
    print(f"✅ API call successful!")
    print(f"   Response: {result}")
    print(f"   Tokens used: {response.usage.total_tokens}")
    print(f"   Model: {response.model}\n")
    
    print("🎉 OpenAI API is working perfectly!\n")
    
except httpx.ConnectError as e:
    print("❌ Connection Error - Cannot reach OpenAI servers")
    print("   Possible causes:")
    print("   1. No internet connection")
    print("   2. Firewall blocking OpenAI (api.openai.com)")
    print("   3. VPN/Proxy issues")
    print("   4. Corporate network restrictions")
    print(f"\n   Technical error: {e}\n")
    
except httpx.TimeoutException:
    print("❌ Timeout Error - Request took too long")
    print("   Try again or check your internet speed\n")
    
except Exception as e:
    error_str = str(e)
    
    if "401" in error_str or "Incorrect API key" in error_str:
        print("❌ Authentication Error - Invalid API key")
        print("   1. Check your key at: https://platform.openai.com/api-keys")
        print("   2. Make sure it starts with 'sk-'")
        print("   3. Key might be expired or deleted\n")
        
    elif "429" in error_str:
        print("❌ Rate Limit Error")
        print("   1. Too many requests")
        print("   2. Check usage at: https://platform.openai.com/usage")
        print("   3. Add billing info if not done yet\n")
        
    elif "insufficient_quota" in error_str or "quota" in error_str.lower():
        print("❌ Quota Exceeded")
        print("   1. Add billing info: https://platform.openai.com/account/billing")
        print("   2. Or wait for free tier to reset\n")
        
    else:
        print(f"❌ Unknown Error: {error_str}\n")

print("=" * 60)
print("\n💡 Troubleshooting Tips:")
print("   • If connection fails, try: pip install --upgrade openai")
print("   • Check firewall settings for api.openai.com")
print("   • Try from different network")
print("   • Verify billing at: https://platform.openai.com/account/billing")