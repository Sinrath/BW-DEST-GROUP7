FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install any Python dependencies if needed
RUN pip install --no-cache-dir -r requirements.txt || echo "No requirements.txt found"

# Expose ports for both HTTP (local) and HTTPS (production)
EXPOSE 8080 8443

# Command to run the appropriate server based on environment
CMD ["sh", "-c", "if [ \"$USE_HTTP\" = \"true\" ]; then python http_server.py; else python https_server.py; fi"]