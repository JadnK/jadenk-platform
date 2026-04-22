mit x-api-key
curl -H "x-api-key: DEIN_KEY" http://localhost:4000/v1/backend/health

oder mit Bearer
curl -H "Authorization: Bearer DEIN_KEY" http://localhost:4000/v1/backend/health

Ohne Key:
{ "error": "API Key fehlt" }

Mit falschem Key:
{ "error": "Ungültiger API Key" }
 

 npm install -g pnpm
cd in projekt
pnpm install
pnpm build
pnpm run start
