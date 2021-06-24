const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());

app.use(bodyParser.json());
app.use(express.static('image'));
app.use(fileUpload())



app.get('/', (req, res) => {
    res.send('Hello World!')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kkca9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection error', err);
    const eventCollection = client.db("share").collection("events");
    const checkoutCollection = client.db("share").collection("checkout");
    const reviewCollection = client.db("share").collection("review");
    const adminCollection = client.db("share").collection("admin");
    console.log('database connected successfully')

    app.post('/addUser',(req, res)=>{
        const newEvent = req.body;
        eventCollection.insertOne(newEvent)
        .then(result =>{
            res.send(result.insertedCount>0)
        })
    })
    app.post('/addReview',(req, res)=>{
        const newReview = req.body;
        reviewCollection.insertOne(newReview)
        .then(result =>{
            res.send(result.insertedCount>0)
        })
    })
    app.post('/addAdmin',(req, res)=>{
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
        .then(result =>{
            res.send(result.insertedCount>0)
        })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/users', (req, res) => {
        eventCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.get('/users/:name', (req, res)=>{
        eventCollection.find({name: req.params.name})
        .toArray((err, items)=>{
          res.send(items)
        })
      })

    app.post('/addCheckOut', (req, res) => {
        const newCheckOut = req.body;
        console.log('no error',newCheckOut)
        checkoutCollection.insertOne(newCheckOut)
        .then(result => 
          res.send(result.insertedCount>0)
          )
      })
      app.get('/bookingList',(req, res) => {
        // console.log(req.query.email);
        checkoutCollection.find({email:req.query.email})
        .toArray((err , documents) => {
          res.send(documents)
        })
      })

      app.get("/isAdmin", (req,res) =>{
          adminCollection.find({email:req.query.email}).toArray((err,doc)=>{
              console.log(doc);
              if(doc.length != 0){
                  res.json({isAdmin:true}).status(200);
              }
              else{
                  res.send({isAdmin:false, message:"permission denied"}).status(403);
              }
          })
      })

    app.get('/OrderList',(req, res) => {
        // console.log(req.query.email);
        checkoutCollection.find({})
        .toArray((err , documents) => {
          res.send(documents)
        })
      })
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})