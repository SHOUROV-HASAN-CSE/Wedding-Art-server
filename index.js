const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();



// Middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.secdjxe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// Jwt Token Area
function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;

  if(!authHeader){
      return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
      if(err){
          return res.status(403).send({message: 'Forbidden access'});
      }
      req.decoded = decoded;
      next();
  })
}








async function run(){

  try{

    const serviceCollection = client.db('creativePhotography').collection('services');
    const reviewCollection = client.db('creativePhotography').collection('reviews');


    app.post('/jwt', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1 days'})
      res.send({token})
  })  





    app.get('/serviceone', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query).sort({"_id" : -1});
      const services = await cursor.limit(4).toArray();
      res.send(services);
  });


    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
  });


  app.post('/services', async (req, res) => {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.send(result);
  });


  app.get('/services/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
});

    // Review Section

    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
  });

  app.get('/reviews', verifyJWT, async (req, res) => {
    let query = {};

    if (req.query.email) {
        query = {
            email: req.query.email
        }
    }
    const cursor = reviewCollection.find(query);
    const reviews = await cursor.toArray();
    res.send(reviews);
});

    // details section

app.get('/review', async (req, res) => {
  let query = {};
  if (req.query.serviceid) {
      query = {
        serviceId: req.query.serviceid
      }
  }
  const cursor = reviewCollection.find(query);
  const review = await cursor.toArray();
  res.send(review.reverse());
});



app.delete('/reviews/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await reviewCollection.deleteOne(query);
  res.send(result);
})

}
  finally{
  }
  
}

run().catch(err=> console.error(err));


app.get('/',(req, res) =>{
  res.send('Creative Photography Server is Running.......');
});


app.listen(port, () =>{
  console.log(`The Server is running on ${port} port`);
});