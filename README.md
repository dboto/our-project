
- requirements
install nodejs,
postgresql,
postgis and
load openstreetmap data

- get source
 git clone https://github.com/dboto/our-project.git our-project

- install dependencies
$cd our-project
$npm install

-start server
$node app.js

go to localhost:3000

- test
curl -X POST http://localhost:3000/GetPointsInRadius/amenity/15.9931498%2045.7811254/1000
