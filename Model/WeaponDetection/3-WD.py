import streamlit as st
from PIL import Image
import google.generativeai as genai
import os
import io

# Set up the page
st.set_page_config(page_title="Weapon Detection", page_icon="🔫")
st.title("Weapon Detection using Gemini API")
st.write("Upload an image or take a picture to detect weapons")


# Initialize Gemini
def setup_gemini():
    api_key = "6ggmwkHow"

    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-pro-vision')

model = setup_gemini()



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

# st.markdown("""
# ### Instructions:
# 1. Choose either to upload an image or use your camera
# 2. The system will analyze the image for weapons
# 3. Results will show detected weapons or confirm no weapons found
# """)
