import streamlit as st
from PIL import Image
import os

# from backend import (
#     setup_directories,
#     load_known_faces,
#     recognize_face,
#     save_new_person
# )

# setup_directories()

st.set_page_config(page_title="Home Security Face Recognition", layout="wide")
st.title("🏠 Home Security Face Recognition System")

tab1, tab2, tab3 = st.tabs(["🔍 Recognize Face", "➕ Add New Person", "📜 Logs"])

# Recognize Tab
with tab1:
    st.header("Recognize a Face")
    uploaded = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])

    if uploaded:
        upload_path = os.path.join("uploads", uploaded.name)
        with open(upload_path, "wb") as f:
            f.write(uploaded.getbuffer())

       # known_encodings, known_names, known_roles = load_known_faces()
        results, image_array = recognize_face(upload_path, known_encodings, known_names, known_roles)

        st.image(image_array, caption="Uploaded Image", use_column_width=True)

        for person, role in results:
            if person == "Unknown":
                st.warning("⚠️ Unknown person detected! Notification would be sent.")
            else:
                st.success(f"✅ Recognized: {person} ({role})")

# Add New Person Tab
with tab2:
    st.header("Add a New Person to the System")
    name = st.text_input("Enter full name")
    category = st.selectbox("Select category", ["Residents", "Relatives", "Workers"])
    new_image = st.file_uploader("Upload a clear face image", type=["jpg", "jpeg", "png"])

    if st.button("Add Person"):
        if name and category and new_image:
            # save_new_person(name, category, new_image)
            st.success(f"✅ {name} added under {category}")
        else:
            st.error("❌ Please complete all fields to add a new person.")

# Logs Tab
with tab3:
    st.header("Recognition Logs (Coming Soon)")
    st.info("This section will display logs of recent recognitions in future versions.")
