# live 영상을 객체 인식하는 코드

# pip install ultralytics
# pip install opencv-python


import cv2
from ultralytics import YOLO

def detect_object_Yolo(model_name, cam_num):
    #비디오 웹캠용 모델 정의
    model = YOLO(model_name)

    cap = cv2.VideoCapture(cam_num)

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


if __name__ == "__main__":
    detect_object_Yolo('yolov8n.pt', 0)