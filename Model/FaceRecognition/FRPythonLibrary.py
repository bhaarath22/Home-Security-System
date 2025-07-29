import face_recognition
import cv2
import os
import numpy as np

def load_known_faces(base_path="/Users/bharathgoud/PycharmProjects/machineLearing/HomeSecurity/FaceRecognition/HSDS1"):
    known_encodings = []
    known_names = []
    known_roles = []

    for role in os.listdir(base_path):
        role_path = os.path.join(base_path, role)
        if not os.path.isdir(role_path):
            continue
        for filename in os.listdir(role_path):
            image_path = os.path.join(role_path, filename)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_encodings.append(encodings[0])
                known_names.append(os.path.splitext(filename)[0])
                known_roles.append(role)

    return known_encodings, known_names, known_roles


# Recognize Faces in Frame or Image
def recognize_faces_in_frame(frame, known_encodings, known_names, known_roles):
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    names_and_roles = []

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.45)
        name, role = "Unknown", "-"
        if True in matches:
            index = matches.index(True)
            name = known_names[index]
            role = known_roles[index]
        names_and_roles.append((name, role))

    return face_locations, names_and_roles

#  Webcam Mode
def run_realtime_recognition(known_encodings, known_names, known_roles):
    cap = cv2.VideoCapture(0)
    print("[INFO] Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        face_locations, identities = recognize_faces_in_frame(frame, known_encodings, known_names, known_roles)

        for (top, right, bottom, left), (name, role) in zip(face_locations, identities):
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)


            label = f"{name} ({role})" if name != "Unknown" else "Unknown"
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

            if name != "Unknown":
                print(f"[RECOGNIZED] {name} - Category: {role}")
            else:
                print("[ALERT] Unknown person detected!")

        cv2.imshow("Face Recognition (Webcam)", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


# Static Image Mode
def run_image_recognition(image_path, known_encodings, known_names, known_roles):
    image = face_recognition.load_image_file(image_path)
    frame = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    face_locations, identities = recognize_faces_in_frame(frame, known_encodings, known_names, known_roles)

    for (top, right, bottom, left), (name, role) in zip(face_locations, identities):
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        label = f"{name} ({role})" if name != "Unknown" else "Unknown"
        cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)


        if name != "Unknown":
            print(f"[RECOGNIZED] {name} - Category: {role}")
        else:
            print("[ALERT] Unknown person detected!")

    cv2.imshow("Face Recognition (Image)", frame)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


#
if __name__ == "__main__":
    known_encodings, known_names, known_roles = load_known_faces()

    print("Choose mode:")
    print("1. Real-time Webcam")
    print("2. Single Image File")
    mode = input("Enter 1 or 2: ")

    if mode == "1":
        run_realtime_recognition(known_encodings, known_names, known_roles)
    elif mode == "2":
        image_path = input("Enter path to image: ").strip()
        if os.path.exists(image_path):
            run_image_recognition(image_path, known_encodings, known_names, known_roles)
        else:
            print("[ERROR] Image file not found.")
    else:
        print("[ERROR] Invalid option.")

