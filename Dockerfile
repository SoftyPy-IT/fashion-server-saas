# Stage 1 
FROM node:18 as builder

WORKDIR /build

COPY package*.json ./
RUN npm install

COPY . .
COPY .env.example .env

RUN npm run build

# Stage 2 - Runner
FROM node:18 as runner

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /build/package*.json ./
COPY --from=builder /build/node_modules/ ./node_modules/
COPY --from=builder /build/dist/ ./dist/
COPY --from=builder /build/.env .env  

# Expose the port your application listens on
EXPOSE 5000

# Command to run the application
CMD [ "npm", "start" ]
