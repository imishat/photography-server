const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const jwt = require('jsonwebtoken')
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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const serviceCollection = client.db('photodb').collection('service')
        const addServicesCollection = client.db('photodb').collection('add')
        const reviewCollection = client.db('photodb').collection('review')
        app.get('/service', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find().sort({ _id: -1 })
            const service = await cursor.limit(3).toArray()
            res.send(service)
        })
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
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
        app.post('/service', async(req, res) => {
            const add = req.body;
            const result = await serviceCollection.insertOne(add);
            res.send(result);
        });

        //add services item

        app.get('/add', async(req, res) => {
                const query = {}
                const cursor = addServicesCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)

            })
            // add rewiew 
        app.post('/review', verifyJWT, async(req, res) => {
            const query = req.body;
            const result = await reviewCollection.insertOne(query);
            res.send(result)
        })
        app.get('/review', async(req, res) => {
            const query = {}
            const cursur = reviewCollection.find(query).sort({ _id: -1 })
            const result = await cursur.toArray();
            res.send(result)
        })
        app.get('/review', verifyJWT, async(req, res) => {

            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }


            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.delete('/review/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
        app.patch('/review/:id', async(req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })






    } finally {

    }
}
run().catch(error => console.error(error))










app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})