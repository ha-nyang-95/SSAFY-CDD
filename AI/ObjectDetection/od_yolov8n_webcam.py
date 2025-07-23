# pip install ultralytics
# pip install opencv-python


import cv2
from ultralytics import YOLO

#비디오 웹캠용 모델 정의
model = YOLO('yolov8n.pt')

cap = cv2.VideoCapture(1)

while cap.isOpened():
    # Read a frame from the video
    success, frame = cap.read()

    if success:
        # Run YOLOv8 inference on the frame
        results = model(frame)

        # Visualize the results on the frame
        annotated_frame = results[0].plot()

        cv2.imshow("YOLOv8 Inference", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        # Break the loop if the end of the video is reached
        break

cap.release()
cv2.destroyAllWindows()