FROM python:3.9-slim-bullseye

RUN apt-get update -y && apt-get install -y \
  sudo \                 
  python3.9 \
  python3-pip \
  build-essential \
  wget \
  git \
  python-dev \ 
  unzip 

RUN rm -rf /var/lib/apt/lists/*
RUN mkdir -p /home/app 
WORKDIR /home/app
COPY requirements.txt /home/app/
RUN pip install -r requirements.txt

COPY /GC_META /home/app/

COPY schema_service.py /home/app/ 

CMD ["python3", "schema_service.py"]