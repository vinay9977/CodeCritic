"""
Database Diagnostic Script
Run: python diagnose_database.py

This will show you exactly what's in your database
"""
import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv("../.env")

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL

print("=" * 60)
print("DATABASE DIAGNOSTIC TOOL")
print("=" * 60)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("\n📊 USERS TABLE:")
    print("-" * 60)
    users = conn.execute(text("SELECT id, username, github_id FROM users")).fetchall()
    for user in users:
        print(f"  ID: {user[0]}, Username: {user[1]}, GitHub ID: {user[2]}")
    
    print("\n📦 REPOSITORIES TABLE:")
    print("-" * 60)
    repos = conn.execute(text("""
        SELECT r.id, r.full_name, r.user_id, u.username 
        FROM repositories r 
        LEFT JOIN users u ON r.user_id = u.id
    """)).fetchall()
    
    for repo in repos:
        print(f"  Repo ID: {repo[0]}, Name: {repo[1]}, Owner User ID: {repo[2]}, Owner Username: {repo[3]}")
    
    print("\n🔍 ISSUE DETECTION:")
    print("-" * 60)
    
    # Check for orphaned repos (user_id doesn't exist)
    orphaned = conn.execute(text("""
        SELECT r.id, r.full_name, r.user_id 
        FROM repositories r 
        LEFT JOIN users u ON r.user_id = u.id
        WHERE u.id IS NULL
    """)).fetchall()
    
    if orphaned:
        print("  ⚠️  FOUND ORPHANED REPOSITORIES (no matching user):")
        for repo in orphaned:
            print(f"     Repo ID: {repo[0]}, Name: {repo[1]}, Invalid User ID: {repo[2]}")
    else:
        print("  ✅ No orphaned repositories found")
    
    # Check which repositories belong to which user
    print("\n📋 REPOSITORY OWNERSHIP:")
    print("-" * 60)
    ownership = conn.execute(text("""
        SELECT u.id, u.username, COUNT(r.id) as repo_count
        FROM users u
        LEFT JOIN repositories r ON u.id = r.user_id
        GROUP BY u.id, u.username
    """)).fetchall()
    
    for owner in ownership:
        print(f"  User {owner[0]} ({owner[1]}): owns {owner[2]} repositories")

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)

print("\n💡 NEXT STEPS:")
print("1. Check if your logged-in user matches the repository owner")
print("2. If mismatched, run: UPDATE repositories SET user_id = YOUR_USER_ID;")
print("3. Or apply the CRUD fix and sync again")