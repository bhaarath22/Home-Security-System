import warnings
import cv2
import os
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
1
# Suppress warnings
warnings.filterwarnings('ignore')

# --- Device Setup ---
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(f'[INFO] Running on device: {device}')

# Initialize MTCNN and FaceNet models
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)


# --- Load Known Faces ---
def load_known_faces(base_path="/Users/bharathgoud/PycharmProjects/machineLearing/HomeSecurity/FaceRecognition/HSDS1"):
    known_embeddings, known_names, known_roles = [], [], []

    for role in os.listdir(base_path):
        role_path = os.path.join(base_path, role)
        if not os.path.isdir(role_path):
            continue

        for filename in os.listdir(role_path):
            if not filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            try:
                path = os.path.join(role_path, filename)
                img = Image.open(path).convert('RGB')
                faces = mtcnn(img)
                if faces is not None:
                    for face in faces:
                        if face is None:
                            continue
                        if face.dim() == 3:
                            face = face.unsqueeze(0)
                        embedding = resnet(face.to(device)).detach().cpu()
                        known_embeddings.append(embedding)
                        known_names.append(os.path.splitext(filename)[0])
                        known_roles.append(role)
            except Exception as e:
                print(f"[ERROR] {filename}: {e}")

    if known_embeddings:
        known_embeddings = torch.cat(known_embeddings)
    else:
        known_embeddings = torch.empty((0, 512))

    return known_embeddings, known_names, known_roles


# --- Recognize Faces from Frame ---
def recognize_faces_in_frame(frame, known_embeddings, known_names, known_roles, threshold=0.8):
    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    boxes, probs = mtcnn.detect(img_pil)

    names_and_roles = []
    face_locations = []

    if boxes is not None:
        for i, box in enumerate(boxes):
            if probs[i] < 0.9:
                continue
            x1, y1, x2, y2 = [int(v) for v in box]
            face_locations.append((y1, x2, y2, x1))
            face = mtcnn.extract(img_pil, [box], None)

            if face is not None:
                embedding = resnet(face.to(device)).detach().cpu()
                if known_embeddings.shape[0] > 0:
                    distances = torch.norm(known_embeddings - embedding, dim=1)
                    min_dist, idx = torch.min(distances, dim=0)
                    if min_dist < threshold:
                        name = known_names[idx]
                        role = known_roles[idx]
                    else:
                        name, role = "Unknown", "-"
                else:
                    name, role = "Unknown", "-"
                names_and_roles.append((name, role))

    return face_locations, names_and_roles


# --- Real-time Webcam Recognition ---
def run_realtime_recognition(known_embeddings, known_names, known_roles):
    cap = cv2.VideoCapture(0)
    print("[INFO] Press 'q' to quit webcam.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        face_locations, identities = recognize_faces_in_frame(frame, known_embeddings, known_names, known_roles)

        for (top, right, bottom, left), (name, role) in zip(face_locations, identities):
            label = f"{name} ({role})" if name != "Unknown" else "Unknown"
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

            if name != "Unknown":
                print(f"[RECOGNIZED] {name} - Category: {role}")
            else:
                print("[ALERT] Unknown person detected!")

        cv2.imshow("Face Recognition (Real-time)", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


# --- Static Image Recognition ---
def run_image_recognition(image_path, known_embeddings, known_names, known_roles):
    image = cv2.imread(image_path)
    if image is None:
        print("[ERROR] Could not load image.")
        return

    face_locations, identities = recognize_faces_in_frame(image, known_embeddings, known_names, known_roles)

    for (top, right, bottom, left), (name, role) in zip(face_locations, identities):
        label = f"{name} ({role})" if name != "Unknown" else "Unknown"
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(image, (left, top), (right, bottom), color, 2)
        cv2.putText(image, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        if name != "Unknown":
            print(f"[RECOGNIZED] {name} - Category: {role}")
        else:
            print("[ALERT] Unknown person detected!")

    cv2.imshow("Face Recognition (Image)", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# --- Main Execution ---
if __name__ == "__main__":
    known_embeddings, known_names, known_roles = load_known_faces()

    print("\nSelect Mode:")
    print("1. Real-time webcam recognition")
    print("2. Image file recognition")
    mode = input("Enter 1 or 2: ").strip()

    if mode == '1':
        run_realtime_recognition(known_embeddings, known_names, known_roles)
    elif mode == '2':
        image_path = input("Enter image file path: ").strip()
        run_image_recognition(image_path, known_embeddings, known_names, known_roles)
    else:
        print("[ERROR] Invalid option selected.")
