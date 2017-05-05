#json-server --watch db.json --port 1337 -q
json-server -p 1337 --watch db.json >> ./json-server.log 2>&1 </dev/null &
