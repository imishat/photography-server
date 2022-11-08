const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oyqsogu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('photodb').collection('service')
        const addServicesCollection = client.db('photodb').collection('add')
        app.get('/service', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.limit(3).toArray()
            res.send(service)
        })
        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)

        })

        //add services item
        app.post('/add', async(req, res) => {
            const add = req.body;
            const result = await addServicesCollection.insertOne(add);
            res.send(result);
        });
        app.get('/add', async(req, res) => {
            const query = {}
            const cursor = addServicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })


    } finally {

    }
}
run().catch(error => console.error(error))










app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})