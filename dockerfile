FROM node:18.17.1

# Set the working directory inside the container
WORKDIR /app  # This creates /app if it doesn't exist

# Copy only package.json and package-lock.json (if available) first
COPY package*.json ./

# Increase npm timeout to avoid timeout issues
RUN npm config set timeout 600000

# Install dependencies
RUN npm install

# Copy the rest of the project files (including 'src' folder)
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]

