import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import PyPDF2
import io

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure Gemini API
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY and API_KEY != "YOUR_API_KEY_HERE":
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GOOGLE_API_KEY not found in .env or is still placeholder.")

# Persistent PDF context
current_pdf_context = ""

@app.route('/api/upload', methods=['POST'])
def upload():
    global current_pdf_context
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            current_pdf_context = text
            print(f"PDF uploaded and parsed: {len(text)} characters extracted.")
            return jsonify({"success": True, "filename": file.filename})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Only PDF files are supported"}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        prompt = data.get('prompt')
        model_name = data.get('model', 'gemini-1.5-flash') # Default to 1.5 if not specified
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # Augment prompt if PDF context is present
        final_prompt = prompt
        if current_pdf_context:
            final_prompt = f"Context from uploaded PDF:\n{current_pdf_context}\n\nUser Question: {prompt}\n\nInstructions: Use the above context to answer the question. If the information is not in the context, say you don't know based on the document, but can answer using your general knowledge."

        # Attempt to use the requested model (Gemini 2.5 Flash as requested by user)
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(final_prompt)
            return jsonify({"response": response.text})
        except Exception as model_err:
            print(f"Model {model_name} failed: {model_err}. Falling back to gemini-1.5-flash.")
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return jsonify({"response": response.text, "info": "Fallback used"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
