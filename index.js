const express = require('express')
const cors = require('cors')
// const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const path = require('path');

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://searplatenetwork.web.app'
    ],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gehw4nj.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const logger = (req, res, next) => {
    console.log('logged info', req.method, req.url);
    next();
}

// const verifyToken = (req, res, next) => {
//     const token = req?.cookies?.token;
//     // console.log('token in the meddelware', token)
//     if (!token) {
//         return res.status(401).send({ massage: 'aunauthorized acccess' })
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
//         if (error) {
//             return res.status(401).send({ massage: 'unatuhorized access' })
//         }
//         req.user = decoded
//         next()
//     })

// }

async function run() {
    try {

        const productCollection = client.db('foodSearDB').collection('addFood')
        const productRequestCollection = client.db('productRequstDB').collection('productRequst')

        // auth realted api
        app.post('/jwtToken', async (req, res) => {
            const user = req.body;
            console.log('user token', user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true });
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logged out', user)
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

       


        //survices related api
        app.post('/addFood', async (req, res) => {
            const newFood = req.body;
            const result = await productCollection.insertOne(newFood)
            res.send(result)
        })
        app.get('/addFood', async (req, res) => {
            const filter = req.query
            console.log(filter)
            const query = {}
            const options = {
                sort: {
                    status: filter.sort === 'sorting' ? 1 : -1
                }
            }
            const cursor = await productCollection.find(query, options).toArray()
            res.send(cursor)
        })
        app.get('/addFood/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result)
        })
        app.delete('/addFood/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })
        app.put('/addFood/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { Upsert: true };
            const food = req.body
            const updateFood = {
                $set: {
                    additionalNode: food.additionalNode,
                    count: food.count,
                    dateTime: food.dateTime,
                    foodName: food.foodName,
                    location: food.location,
                    photo: food.photo,
                    status: food.status
                }
            }
            const result = await productCollection.updateOne(filter, updateFood, options)
            res.send(result)
        })
        app.put('/productRequst/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { Upsert: true };
            const food = req.body
            const updateFood = {
                $set: {
                    additionalNode: food.additionalNode,
                    count: food.count,
                    dateTime: food.dateTime,
                    foodName: food.foodName,
                    location: food.location,
                    photo: food.photo,
                    status: food.status
                }
            }
            const result = await productCollection.updateOne(filter, updateFood, options)
            res.send(result)
        })
        app.get('/productRequst', verifyToken, logger, async (req, res) => {
            console.log('token woner info', req.user.email)
            console.log('token woner ', req.query)
            if (req.user.email !== req?.query?.email) {
                return res.status(403).send({ massage: 'forbidden access' })
            }
            const cursor = await productRequestCollection.find().toArray()
            res.send(cursor)
        })
        app.post('/productRequst', async (req, res) => {
            const newRequst = req.body;
            const result = await productRequestCollection.insertOne(newRequst)
            res.send(result)
        })

        app.delete('/productRequst/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productRequestCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('community food searing surver...')
})

app.listen(port, () => {
    console.log('community food searing port is ', { port })
})