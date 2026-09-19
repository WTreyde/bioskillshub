FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends imagej xvfb xauth python3 && rm -rf /var/lib/apt/lists/*
COPY science/imagej/imagej-core /usr/local/bin/imagej-core
RUN chmod +x /usr/local/bin/imagej-core
ENV FIJI_BIN=/usr/local/bin/imagej-core
WORKDIR /workspace
ENTRYPOINT ["python3", "science/imagej/run.py"]
