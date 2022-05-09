const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.me6tg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('electronicsHouse').collection('product')
        const myCollection = client.db('electronicsHouse').collection('item')
        console.log('connected')

        app.get('/inventories', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray()
            res.send(products);
        })


        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query)
            res.send(product);
        })

        app.post('/add-inventory', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct)
            console.log('posting')
            const result = await productCollection.insertOne(newProduct);
            res.send(result)
        })

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result);
        })
        app.put('/update-product/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProductInfo = req.body;
            console.log(updatedProductInfo)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedProductInfo.quantity,

                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options);
        });
        //my item api
        app.post('/item', async (req, res) => {
            const item = req.body
            const result = await myCollection.insertOne(item)
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running electronics wirehouse server')
});
app.listen(port, () => {
    console.log('Listening to port', port)
})