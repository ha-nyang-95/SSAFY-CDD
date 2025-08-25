# This Dockerfile is for the application itself.
# It starts from our pre-built base image which contains all heavy dependencies.
# This build will be very fast.

# Use the pre-built base image from Artifact Registry
FROM asia-northeast3-docker.pkg.dev/cdd-3dgs/b102-3d-modeling/3d-modeling-base:latest

# Set working directory
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
# This includes main.py and the 3D_gaussian_splatting folder
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "1", "--threads", "8", "--timeout", "0", "main:app"]
