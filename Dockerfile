# Étape de build
FROM node:22-slim AS build
WORKDIR /app

# Définition de l'environnement pour le build
ENV NODE_ENV=production

# On copie les fichiers de dépendances
COPY package*.json ./
COPY .npmrc ./

# Installation des dépendances (y compris devDependencies pour le build)
# On utilise npm install au lieu de npm ci si package-lock.json n'est pas parfaitement synchronisé
# ou si on veut être plus flexible, mais npm ci est préférable si possible.
RUN npm ci --include=dev

# Copie du reste du code
COPY . .

# Build du client et du serveur
RUN npm run build

# Étape finale (production)
FROM node:22-slim
WORKDIR /app

# Définition de l'environnement pour le runtime
ENV NODE_ENV=production

# On ne copie que le nécessaire du build
# Le serveur est dans dist/server.cjs
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# On installe seulement les dépendances de production
RUN npm install --omit=dev

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/server.cjs"]
