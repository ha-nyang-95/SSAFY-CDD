import argparse
import os
import subprocess
import boto3
import cv2
import shutil
from glob import glob
from urllib.parse import urlparse

def run_pipeline(s3_video_url, s3_output_path):
    """
    Runs the 3D Gaussian Splatting pipeline.

    Args:
        s3_video_url (str): The S3 URL of the input video.
        s3_output_path (str): The S3 path to upload the output .ply file to.
    """

    workspace_dir = "workspace"
    video_filename = os.path.basename(urlparse(s3_video_url).path)
    input_image_dir = os.path.join(workspace_dir, "input")

    # Create workspace and input image directories
    os.makedirs(input_image_dir, exist_ok=True)

    # 1. Download video from S3
    print(f"Downloading video from {s3_video_url}...")
    s3 = boto3.client("s3")
    parsed_url = urlparse(s3_video_url)
    bucket_name = parsed_url.netloc
    object_key = parsed_url.path.lstrip('/')
    s3.download_file(bucket_name, object_key, video_filename)

    # 2. Extract frames from the video
    print(f"Extracting frames from {video_filename}...")
    vidcap = cv2.VideoCapture(video_filename)
    success, image = vidcap.read()
    count = 0
    while success:
        cv2.imwrite(os.path.join(input_image_dir, f"frame{count:05d}.jpg"), image)
        success, image = vidcap.read()
        count += 1
    print(f"Extracted {count} frames.")

    # 3. Run convert.py
    print("Running convert.py...")
    subprocess.run([
        "python", "convert.py",
        "-s", workspace_dir
    ], check=True)

    # 4. Run train.py
    print("Running train.py...")
    subprocess.run([
        "python", "train.py",
        "-s", workspace_dir
    ], check=True)

    # 5. Find the output .ply file
    print("Finding the output .ply file...")
    output_dirs = glob("output/*")
    latest_output_dir = max(output_dirs, key=os.path.getctime)
    ply_files = glob(os.path.join(latest_output_dir, "point_cloud", "iteration_*", "point_cloud.ply"))
    if not ply_files:
        raise FileNotFoundError("Could not find the output .ply file.")
    latest_ply_file = max(ply_files, key=os.path.getctime)
    print(f"Found .ply file: {latest_ply_file}")


    # 6. Upload the .ply file to S3
    print(f"Uploading {latest_ply_file} to {s3_output_path}...")
    parsed_output_url = urlparse(s3_output_path)
    output_bucket_name = parsed_output_url.netloc
    output_object_key = parsed_output_url.path.lstrip('/')
    s3.upload_file(latest_ply_file, output_bucket_name, output_object_key)

    # 7. Cleanup
    print("Cleaning up temporary files...")
    shutil.rmtree(workspace_dir)
    os.remove(video_filename)

    print("Pipeline finished successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="3D Gaussian Splatting Pipeline")
    parser.add_argument("--s3_video_url", type=str, required=True, help="S3 URL of the input video")
    parser.add_argument("--s3_output_path", type=str, required=True, help="S3 path for the output .ply file")
    args = parser.parse_args()

    run_pipeline(args.s3_video_url, args.s3_output_path)