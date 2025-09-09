FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install any Python dependencies if needed
RUN pip install --no-cache-dir -r requirements.txt || echo "No requirements.txt found"

# Expose HTTPS port
EXPOSE 8443

# Command to run the HTTPS server
CMD ["python", "https_server.py"]