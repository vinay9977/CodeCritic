"""
Quick Fix: Assign all repositories to your current user
Run: python fix_repository_ownership.py

This will ask for your username and update all repos to belong to you
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
print("REPOSITORY OWNERSHIP FIX")
print("=" * 60)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Show all users
    print("\n📊 Available Users:")
    users = conn.execute(text("SELECT id, username FROM users")).fetchall()
    
    if not users:
        print("  ❌ No users found! Please login first.")
        sys.exit(1)
    
    for user in users:
        print(f"  {user[0]}. {user[1]}")
    
    # Show current repository ownership
    print("\n📦 Current Repository Ownership:")
    repos = conn.execute(text("""
        SELECT r.id, r.full_name, r.user_id, u.username 
        FROM repositories r 
        LEFT JOIN users u ON r.user_id = u.id
    """)).fetchall()
    
    for repo in repos:
        owner = repo[3] if repo[3] else "ORPHANED"
        print(f"  Repo {repo[0]}: {repo[1]} → Owner: {owner} (ID: {repo[2]})")
    
    # Ask user which ID to use
    print("\n" + "=" * 60)
    try:
        user_id = input("Enter your user ID to claim all repositories (or 'cancel' to exit): ").strip()
        
        if user_id.lower() == 'cancel':
            print("Cancelled.")
            sys.exit(0)
        
        user_id = int(user_id)
        
        # Verify user exists
        user = conn.execute(text("SELECT username FROM users WHERE id = :id"), {"id": user_id}).fetchone()
        
        if not user:
            print(f"❌ User ID {user_id} not found!")
            sys.exit(1)
        
        print(f"\n🔄 Updating all repositories to belong to: {user[0]} (ID: {user_id})")
        
        # Update all repositories
        result = conn.execute(
            text("UPDATE repositories SET user_id = :user_id"),
            {"user_id": user_id}
        )
        conn.commit()
        
        print(f"✅ Successfully updated {result.rowcount} repositories!")
        
        # Show final state
        print("\n📦 Updated Repository Ownership:")
        repos = conn.execute(text("""
            SELECT r.id, r.full_name, u.username 
            FROM repositories r 
            JOIN users u ON r.user_id = u.id
        """)).fetchall()
        
        for repo in repos:
            print(f"  Repo {repo[0]}: {repo[1]} → Owner: {repo[2]}")
        
        print("\n✨ Done! Try analyzing a repository now.")
        
    except ValueError:
        print("❌ Invalid user ID. Please enter a number.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nCancelled.")
        sys.exit(0)