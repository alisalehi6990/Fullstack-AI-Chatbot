set -e

cd server
npm install
npm run build
mkdir dist/test
mkdir dist/test/data
touch dist/test/data/05-versions-space.pdf