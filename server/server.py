from flask import Flask, request, jsonify
import util
from flask_cors import CORS

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 16 MB limit
CORS(app)

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    print("Request content length:", request.content_length)

    try:
        image_data = request.get_json()["image_data"]
    except Exception as e:
        print("Error reading image data:", e)
        return jsonify({"error": "Invalid input"}), 400

    # image_data = request.form['image_data']

    response = jsonify(util.classify_image(image_data))
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.errorhandler(413)
def request_entity_too_large(error):
    return "File too large", 413

if __name__ == "__main__":
    print("Starting Python Flask Server For Influencer Image Classification")
    util.load_saved_artifacts()
    app.run(port=5000)