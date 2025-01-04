from flask import Flask, render_template, request, jsonify, send_from_directory
import openai
import yaml
import time
from pathlib import Path
import base64
#importing all libraries

app=Flask(__name__)
app.config['UPLOAD_TTS_FOLDER']='static/audio'
app.config['UPLOAD_AUDIO_FOLDER']='static/audiooutput'
app.config['UPLOAD_TRANSCRIBE_FOLDER']='static/transcribeaudio'

with open("apikey.yaml","r") as file:
    config=yaml.safe_load(file)

openai.api_key= config["API_KEY"]

@app.route("/")
def textindex():
    return render_template("textindex.html")

@app.route("/image")
def imageindex():
    return render_template("imageindex.html")

@app.route("/tts")
def ttsindex():
    return render_template("ttsindex.html")

@app.route("/audio")
def audioindex():
    return render_template("audioindex.html")

@app.route("/transcribe")
def whisperindex():
    return render_template("whisperindex.html")

@app.route("/reason")
def reasindex():
    return render_template("reasindex.html")

@app.route("/answer", methods=['POST'])
def generate():
    user_input=request.json.get("input","")
    print(user_input)

    try:
        response=openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role":"user", "content":user_input}]
        )
        output=response.choices[0].message.content
        print(output)
        return jsonify({"output": output})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/generate-image', methods=['POST'])
def generate_image():
    prompt = request.json.get("prompt","")
    print(prompt)
    try:        
        response = openai.images.generate(
            prompt= prompt,
            n=2,
            size="1024x1024"
            )
        image_data = [image.url for image in response.data]
        print(image_data,"\n")
        return jsonify({'data': [{'url': url} for url in image_data]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/speech", methods=['POST'])
def generate_speech():
    user_input=request.json.get("input","")
    print(user_input)
   
    try:
        unique_filename = f"speech_{int(time.time())}.mp3"
        speech_file_path = Path(app.config['UPLOAD_TTS_FOLDER'])/ unique_filename
        response = openai.audio.speech.create(
            model = "tts-1",
            voice = "alloy",
            input = user_input
        )
        with open(speech_file_path, "wb") as f:
            f.write(response.read())
        audio_url = f"/{app.config["UPLOAD_TTS_FOLDER"]}/{unique_filename}"
        return jsonify({"audio_url": audio_url})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/audio", methods=['POST'])
def audio():
    user_input= request.json.get("input","")
    print(user_input)

    try:
        output_filename = f"reponse_{int(time.time())}.mp3"
        audio_path=Path(app.config['UPLOAD_AUDIO_FOLDER'])/output_filename
        response = openai.chat.completions.create(
            model = "gpt-4o-audio-preview",
            modalities=["text","audio"],
            audio={"voice": "alloy", "format": "mp3"},
            messages=[{
            "role": "user",
            "content": user_input}
        ]
        )
        output = response.choices[0].message.audio.data
        wav_bytes = base64.b64decode(output)
        with open(audio_path, "wb") as f:
            f.write(wav_bytes)
        audio_gen_url = f"/{app.config["UPLOAD_AUDIO_FOLDER"]}/{output_filename}"
        return jsonify({"audio_gen_url": audio_gen_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    print(f"File Name: {audio_file.filename}")
    print(f"Content Type: {audio_file.content_type}")
    try:
        transcribe_file_path = Path(app.config['UPLOAD_TRANSCRIBE_FOLDER'])/ audio_file.filename
        with open(transcribe_file_path,"wb") as temp_file:
            temp_file.write(audio_file.read())
        with open(transcribe_file_path,"rb") as binary_file:
            response = openai.audio.transcriptions.create(
                model = "whisper-1",
                file = binary_file           
            )
        output= response.text
        return jsonify({'transcription': output})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route("/reason", methods=["POST"])
def reason():
    prompt = request.json.get("input","")
    print(prompt)

    try:
        response = openai.chat.completions.create(
            model = "o1-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        output = response.choices[0].message.content
        print(output)
        return jsonify({"output": output})
    
    except Exception as e:
        return jsonify({"error:": str(e)}), 500
    
@app.route("/static/audiooutput/<filename>")
def serve_output_audio(filename):
    return send_from_directory(app.config['UPLOAD_AUDIO_FOLDER'], filename)
    
@app.route("/static/audio/<filename>")
def serve_audio(filename):
    return send_from_directory(app.config['UPLOAD_TTS_FOLDER'], filename)

if __name__=="__main__":
    app.run(debug=True)
