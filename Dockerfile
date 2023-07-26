FROM node:16-alpine

WORKDIR /home/node/app

COPY ./ /home/node/app/

ENV SERVER_TIMEZONE
ENV PORT
ENV ORIGIN
ENV JWT_SECRET_STRING
ENV MONGODB_CONNECTION_URL
ENV AWS_ECR_IMAGE
ENV AWS_LOGS_GROUP
ENV AWS_REGION

RUN yarn

RUN yarn build

EXPOSE 5000

CMD ["yarn", "start:prod"]