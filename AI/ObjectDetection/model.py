from ultralytics import YOLO

def load_model(model_path='yolov8n.pt'):
    """
    Loads the YOLOv8 model with pre-trained weights.
    """
    model = YOLO(model_path)
    return model
