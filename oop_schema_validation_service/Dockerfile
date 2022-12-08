FROM sandrokeil/typescript

WORKDIR /home/app
COPY . .

RUN npm run build 

CMD [ "npm", "run", "start" ]