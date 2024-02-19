require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
// const connectDB = require("./services/connectToDb");
const cookiePaser = require("cookie-parser");
const Post = require("./models/post");
const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const profileRoute = require("./routes/profile");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const { loginRequired } = require("./middlewares/authorization");

// connectDB(true);

const app = express();
// const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const posts = await Post.find({}).sort({ createdAt: -1 });
  res.render("index", {
    user: req.user,
    posts: posts,
  });
});

app.get("/dashboard", loginRequired("token"), async (req, res) => {
  const posts = await Post.find({}).sort({ createdAt: -1 });
  res.render("dashboard", { user: req.user, posts: posts });
});

app.get("/search", async (req, res) => {
  try {
    const { title } = req.query;
    console.log(title);
    const agg = [
      {
        $search: {
          index: "post-search",
          autocomplete: {
            query: title,
            path: "title",
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          location: 1,
          description: 1,
        },
      },
    ];

    const response = await Post.aggregate(agg);
    console.log(response);
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json([]);
  }
});

app.post("/search", async (req, res) => {
  const keyToSearch = req.body.key;
  if (keyToSearch !== "") {
    try {
      const posts = await Post.aggregate([
        {
          $search: {
            index: "post-search-normal",
            text: {
              query: keyToSearch,
              path: {
                wildcard: "*",
              },
            },
          },
        },
      ]);
      if (posts) {
        res.render("index", {
          user: req.user,
          posts,
        });
      } else res.redirect("/");
    } catch (error) {
      res.status(404).redirect("/");
    }
  } else {
    console.log("Enter Somthing to search");
    res.redirect("/");
  }
});


app.use("/", userRoute);
app.use("/", postRoute);
app.use("/", profileRoute);

// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });

module.exports = app;
