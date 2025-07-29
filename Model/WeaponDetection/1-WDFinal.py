import streamlit as st
from PIL import Image
import google.generativeai as genai
import os
import io
import requests


st.set_page_config(page_title="Weapon Detection", page_icon="🔫")
st.title("Weapon Detection using Gemini API")
st.write("Upload an image or take a picture to detect weapons")


# Gemini Initialization
def setup_gemini():
    api_key = "AIzaSyCtXLZlwHHWoc"
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash') # For image+text analysis

model = setup_gemini()


# Function to send Telegram alert
def send_telegram_alert(analysis_result):
    bot_token = '76bfAiQaZhxNcG0'
    chat_id = '5086255790'
    message = f' Alert: Weapons detected!\n\nAnalysis results:\n{analysis_result}'

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message
    }

    try:
        response = requests.post(url, data=payload)
        if response.ok:
            st.success("Alert sent to authorities!")
        else:
            st.warning("Weapons detected but failed to send alert.")
    except Exception as e:
        st.error(f"Error sending alert: {e}")


# Function to analyze image with Gemini
def analyze_image(image):
    try:
        # Convert the image to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        # Prepare the prompt
        prompt = """Analyze this image carefully and determine if there are any weapons present. 
        If weapons are detected, identify each one by name and type (e.g., "handgun - firearm", 
        "knife - bladed weapon", "rifle - firearm"). 
        If no weapons are detected, simply respond with "No weapons detected".
        Be thorough in your analysis and consider all possible weapons."""

        # Call Gemini
        response = model.generate_content(
            [prompt, Image.open(io.BytesIO(img_byte_arr))],
            stream=True
        )
        response.resolve()

        return response.text
    except Exception as e:
        st.error(f"Error analyzing image: {e}")
        return None


# Image upload and camera input
option = st.radio("Choose input method:", ("Upload an image", "Take a picture with camera"))

if option == "Upload an image":
    uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image", use_column_width=True)

        if st.button("Analyze for Weapons"):
            with st.spinner("Analyzing image..."):
                result = analyze_image(image)
                if result:
                    st.subheader("Analysis Results:")
                    st.write(result)

                    # Check if weapons were detected and send alert
                    if "No weapons detected" not in result:
                        send_telegram_alert(result)
else:
    # Camera input
    img_file_buffer = st.camera_input("Take a picture")
    if img_file_buffer is not None:
        image = Image.open(img_file_buffer)

        with st.spinner("Analyzing image..."):
            result = analyze_image(image)
            if result:
                st.subheader("Analysis Results:")
                st.write(result)

                # Check if weapons were detected and send alert
                if "No weapons detected" not in result:
                    send_telegram_alert(result)

st.markdown("""
### Instructions:
1. Choose either to upload an image or use your camera
2. The system will analyze the image for weapons
3. Results will show detected weapons or confirm no weapons found
4. Authorities will be automatically alerted if weapons are detected
""")