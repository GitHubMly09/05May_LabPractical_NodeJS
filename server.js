require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const shortid = require("shortid")

const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("db connected"))
.catch(err => console.log(err))

const urlSchema = new mongoose.Schema({
    fullUrl: String,
    code: String,
    shortLink: String,
    createdAt: { type: Date, default: Date.now }
})

const UrlModel = mongoose.model("UrlData", urlSchema)

app.post("/create", async (req, res) => {
    const inputUrl = req.body.fullUrl
    const base = process.env.BASE_URL

    try {
        let data = await UrlModel.findOne({ fullUrl: inputUrl })

        if (data) {
            return res.json({ link: data.shortLink })
        }

        const id = shortid.generate()
        const finalLink = base + "/" + id

        const newData = new UrlModel({
            fullUrl: inputUrl,
            code: id,
            shortLink: finalLink
        })

        await newData.save()

        res.json({
            original: inputUrl,
            short: finalLink
        })

    } catch (e) {
        res.status(500).send("error")
    }
})

app.get("/:code", async (req, res) => {
    try {
        const found = await UrlModel.findOne({ code: req.params.code })

        if (!found) {
            return res.status(404).send("invalid link")
        }

        res.redirect(found.fullUrl)

    } catch (e) {
        res.status(500).send("server issue")
    }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("running on " + PORT))
