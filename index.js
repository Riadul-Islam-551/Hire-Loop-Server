const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // post the recruiter job
    const db = client.db("hire-loop");
    const jobCollection = db.collection("job");
    const companyCollection = db.collection("company");
    const userCollection = db.collection("user");
    const applicationCollection = db.collection("applications");

    //user related apis
    app.get("/api/users", async (req, res) => {
      const result = await userCollection.find().toArray();

      res.send(result);
    });

    // jobs related apis
    app.get("/api/jobs", async (req, res) => {
      const query = {};

      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }

      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/api/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await jobCollection.findOne(query);

      res.send(result);
    });

    app.post("/api/jobs", async (req, res) => {
      const data = req.body;
      const newJob = {
        ...data,
        createdAt: new Date(),
      };
      const result = await jobCollection.insertOne(newJob);

      res.send(result);
    });

    //application related apis

    app.get("/api/applications", async (req, res) => {
      const query = {};
      if (req.query.applicantId) {
        query.applicantId = req.query.applicantId;
      }
      if (req.query.jobId) {
        query.jobId = req.query.jobId;
      }

      const cursor = await applicationCollection.find(query);
      const applicationData = await cursor.toArray();

      res.send(applicationData);
    });

    app.post("/api/applications", async (req, res) => {
      const data = req.body;
      const newJobApplication = {
        ...data,
        createdAt: new Date(),
      };

      const result = await applicationCollection.insertOne(newJobApplication);

      res.send(result);
    });

    // company related operation
    app.get("/api/companies", async (req, res) => {
      const result = await companyCollection.find().toArray();

      res.send(result);
    });

    app.get("/api/my/companies", async (req, res) => {
      const query = {};
      if (req.query.recruiterId) {
        query.recruiterID = req.query.recruiterId;
      }

      const result = await companyCollection.findOne(query);
      res.send(result || {});
    });

    app.post("/api/companies", async (req, res) => {
      const data = req.body;
      const newCompany = {
        ...data,
        createdAt: new Date(),
      };
      const result = await companyCollection.insertOne(newCompany);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
