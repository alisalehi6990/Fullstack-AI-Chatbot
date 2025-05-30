set -e

cd server
npm install
npm run build
npx prisma generate