#!/usr/bin/env python3
"""
API endpoint specific tests to identify missing routes
"""

import requests
import json

def test_missing_api_routes():
    """Test for missing API routes and suggest fixes"""
    base_url = "http://localhost:8001"
    
    print("🔍 Analyzing API Endpoints...")
    print("=" * 40)
    
    # Check what routes actually exist
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ FastAPI docs accessible")
            
        # Check OpenAPI schema
        openapi_response = requests.get(f"{base_url}/openapi.json")
        if openapi_response.status_code == 200:
            openapi_data = openapi_response.json()
            
            print("\n📋 Available API Routes:")
            paths = openapi_data.get("paths", {})
            for path, methods in paths.items():
                for method in methods.keys():
                    print(f"  {method.upper()} {path}")
            
            # Check for missing expected routes
            expected_routes = [
                "/api/v1/chat",
                "/api/v1/questions", 
                "/api/v1/search",
                "/api/v1/answers"
            ]
            
            print("\n❌ Missing Expected Routes:")
            available_paths = list(paths.keys())
            for route in expected_routes:
                if route not in available_paths:
                    print(f"  {route}")
                    
        else:
            print("❌ Could not retrieve OpenAPI schema")
            
    except Exception as e:
        print(f"❌ Error analyzing endpoints: {e}")

def suggest_fixes():
    """Suggest fixes for missing API routes"""
    print("\n🔧 SUGGESTED FIXES:")
    print("=" * 40)
    print("The main.py file contains individual endpoints but missing API router structure.")
    print("Missing routes that tests expect:")
    print("- /api/v1/chat (for chat functionality)")  
    print("- /api/v1/questions (for questions list)")
    print("")
    print("Current routes available:")
    print("- /embed")
    print("- /search") 
    print("- /refine")
    print("- /answer/{qa_id}")
    print("- /feedback")
    print("- /health")
    print("")
    print("RECOMMENDATION: Add API router with /api/v1 prefix")
    
def test_current_endpoints():
    """Test currently available endpoints"""
    base_url = "http://localhost:8001"
    
    print("\n🧪 Testing Current Endpoints:")
    print("=" * 40)
    
    endpoints = [
        ("/health", "GET"),
        ("/embed", "POST"),
        ("/search", "POST"),
        ("/refine", "POST"),
        ("/answer/1", "GET"),
        ("/feedback", "POST")
    ]
    
    for endpoint, method in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            else:
                # Use minimal test data
                test_data = {"text": "test"} if "embed" in endpoint else {}
                response = requests.post(f"{base_url}{endpoint}", json=test_data, timeout=5)
            
            print(f"  {method} {endpoint}: {response.status_code}")
            
        except Exception as e:
            print(f"  {method} {endpoint}: ERROR - {e}")

if __name__ == "__main__":
    test_missing_api_routes()
    suggest_fixes()
    test_current_endpoints()