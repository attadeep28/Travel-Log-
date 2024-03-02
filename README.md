# Travel Log
 
Visit: [http://13.51.79.102/](http://51.21.21.143/) (Ec2 for hosting)
 
## About
 
**Travel Log** is a full-stack web application designed for individuals to share their travel experiences within a community of fellow adventurers. This user-friendly app allows people to:
 
- Explore travel experiences shared by others
- Add and narrate their own travel stories
- Include various details about their experiences
- Share captivating images of locations
- Specify the cost of their travels
- Highlight the cultural heritage of visited locations
- Recommend must-visit places
 
## How To Run
 
**Step 1**: Create a `.env` file and define the following variables:
 
- `MONGO_URL`
- `PORT`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_REGION`
- `S3_BUCKET`
- `HOST`
- `EMAIL`
- `PASS`
 
**Step 2**: Install dependencies with `npm i`.
 
**Step 3**: Run the application with `node index.js`.
 
## Tech Stack
### Frontend
- HTML
- CSS
- Bootstrap
- JavaScript
 
### Backend
- Node.js
- Express.js
- JavaScript
 
### Database
- MongoDB for storing Data (Atlas Search And Atlas Autocomplete for Searching)
- S3 for storing images
 
### Authentication
- JSON Web Tokens (JWT) for user authentication
- Nodemailer for sending OTP
 
### Testing
- chai
- Mocha
- Sinon
- supertest
 
 
### Test Coverage
  58 passing (8s)

------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |   96.88 |     82.5 |     100 |   97.17 |                   
 Travel-Log             |     100 |      100 |     100 |     100 |                   
  index.js              |     100 |      100 |     100 |     100 |                   
 Travel-Log/middlewares |     100 |      100 |     100 |     100 |                   
  authentication.js     |     100 |      100 |     100 |     100 |                   
  authorization.js      |     100 |      100 |     100 |     100 |                   
 Travel-Log/models      |   97.29 |     87.5 |     100 |     100 |                   
  post.js               |     100 |      100 |     100 |     100 |                   
  user.js               |   96.87 |     87.5 |     100 |     100 | 43                
 Travel-Log/routes      |   97.51 |       80 |     100 |   97.51 |                   
  post.js               |   96.36 |     62.5 |     100 |   96.36 | 55,105            
  profile.js            |     100 |      100 |     100 |     100 |                   
  user.js               |   96.42 |     87.5 |     100 |   96.42 | 19-21             
 Travel-Log/services    |   89.36 |       50 |     100 |   89.36 |                   
  S3_Upload.js          |   80.76 |       50 |     100 |   80.76 | 33-34,51-52,59    
  authentication.js     |     100 |      100 |     100 |     100 |                   
  connectToDb.js        |     100 |       50 |     100 |     100 | 4                 
  sendOtpMail.js        |     100 |      100 |     100 |     100 |                   
------------------------|---------|----------|---------|---------|-------------------
