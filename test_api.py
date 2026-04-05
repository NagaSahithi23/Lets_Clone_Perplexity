import requests
import json
import sys

# Force UTF-8 for Windows output
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'replace')

url = "http://127.0.0.1:5000/api/chat"
headers = {"Content-Type": "application/json"}
data = {"prompt": "What is the latest score for Real Madrid?", "model": "gemini-2.5-flash", "proSearch": True}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    # Print pretty-printed JSON safely
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
