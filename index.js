const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;


const cors = require('cors');
require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crceb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
  try{
    await client.connect();

    console.log('database connected');

    
    const database = client.db('carProducts');
    const productCollection = database.collection('products');
    const orderCollection = database.collection('orders');
    const reviewCollection = database.collection('review');
    const usersCollection = database.collection('users');


    
     // POST API
     app.post('/products', async (req, res) => {
      const product = req.body;
      console.log('hitting the post api', product);

      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
  });


    // GET PRODUCTS API
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
  });



    app.delete('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.json(result);
    })




   //get api for a single data
   app.get('/products/:id', async(req, res) => {
     const carsor = req.params.id;
     const query = {_id: ObjectId(carsor)}
    const result = await productCollection.find(query).toArray();
    res.send(result[0]);
  })


    // POST order
   app.post("/orders", async(req, res) => {
     const query = req.body;
     const result = await orderCollection.insertOne(req.body);
     console.log(result);
     res.send(result);
   })


   // All Orders
   app.get("/orders", async(req, res) => {
    const query = orderCollection.find({});
    const result = await query.toArray();
    console.log(result);
    res.send(result);
});


   // My order
  app.get("/myOrders", async(req, res) => {
    const email = req.query.email;
    const query = {email:email}
    const cursor = orderCollection.find(query);
    const result = await cursor.toArray();
    res.send(result); 
  })


  // Delete API

  app.delete('/orders/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await orderCollection.deleteOne(query);
    res.json(result);
  })


  



       //  Creating admin API
       app.put("/users/admin", async (req, res) => {
        const user = req.body;
        // console.log(user);
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
    });




    // get api admin panel
    app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        console.log(user);
        let isAdmin = false;
        if (user?.role === "admin") {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    });



    // post API for reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
  });


   // get API for reviews
   app.get("/reviews", async (req, res) => {
    const allReview = await reviewCollection.find({}).toArray();
    res.send(allReview);
});



     // post API user
     app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
  });


  // put API user
  app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });



  }
  finally{
    // await client.close();
  }

}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello Car Rental Server Site!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})