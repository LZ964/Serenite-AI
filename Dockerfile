# Étape de build
FROM node:22-slim AS build
WORKDIR /app

# On copie les fichiers de dépendances
COPY package*.json ./
COPY .npmrc ./

# Installation propre des dépendances
RUN npm ci

# Copie du reste du code
COPY . .

# Build du client et du serveur
RUN npm run build

# Étape finale (production)
FROM node:22-slim
WORKDIR /app

# On ne copie que le nécessaire du build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
