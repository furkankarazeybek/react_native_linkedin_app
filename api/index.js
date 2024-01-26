const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://furkan:furkan@clusterlinkedin.n37w825.mongodb.net/",
    {}
  )
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((err) => {
    console.log("Error encountered: ", err);
  });

app.listen(port, () => {
  console.log("Server is running on port 3000");
});

const User = require("./models/user");
const Post = require("./models/post");

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, profileImage } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Email zaten kullanımda");
      return res.status(400).json({ message: "Email zaten kullanımda" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profileImage,
    });

    // Generate the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    await newUser.save();

    // Send the verification email to the registered user
    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res
      .status(202)
      .json({ message: "Kayıt Başarılı. Email gelen kutunuza bakın" });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "femagle304@gmail.com",
      pass: "qequkfhisqnckltz",
    },
  });

  const mailOptions = {
    from: "Linkedin",
    to: email,
    subject: "Email Doğrulama",
    text: `Lütfen email adresinizi doğrulamak için aşağıdaki linke tıklayın: http://localhost:3000/verify/${verificationToken}`,
  };

  // Send the mail
  try {
    await transport.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.log("Error sending the verification email", error);
  }
};

// Endpoint to verify email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    // Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email başarıyla doğrulandı" });
  } catch (error) {
    res.status(500).json({ message: "Email doğrulama hatası" });
  }
});

//generate secret key

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

// login

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Geçersiz email ya da şifre" });
    }

    // Şifre karşılaştırması
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Hatalı Şifre" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//user's profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error); // Hatanın nedenini anlamak için hatayı logla
    res
      .status(500)
      .json({ message: "Kullanıcı profili alınırken hata oluştu" });
  }
});

app.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    const loggedInuser = await User.findById(loggedInUserId).populate(
      "connections",
      "_id"
    );
    if (!loggedInuser) {
      return res.status(400).json({ message: "User not found" });
    }

    // get the ID's of the connected users
    const connectedUserIds = loggedInuser.connections.map(
      (connection) => connection._id
    );

    const users = await User.find({
      _id: { $ne: loggedInUserId, $nin: connectedUserIds },
    });

    res.status(200).json(users);
  } catch (error) {
    console.log("Error users", error);
    res.status(500).json({ message: "Error users" });
  }
});

// send a connection request
app.post("/connection-request", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    await User.findByIdAndUpdate(selectedUserId, {
      $push: { connectionRequests: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentConnectionRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error creating connection request" });
  }
});

// endpoint to show all of the connection requests
app.get("/connection-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
    .populate("connectionRequests", "name email profileImage")
    .lean();

    const connectionRequests = user.connectionRequests;
    res.json(connectionRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//endpoint to accept a connection request
app.post("/connection-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.connections.push(recepientId);
    recepient.connections.push(senderId);

    recepient.connectionRequests = recepient.connectionRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentConnectionRequests = sender.sentConnectionRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({message:"Frient request accepted successfully"})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//endpoint to fetch all the connections of a user
app.get("/connections/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate("connections", "name profileImage createdAt")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }
    res.status(200).json({ connections: user.connections });
  } catch (error) {
    console.log("error fetching the connections", error);
    res.status(500).json({ message: "Error fetching the connections" });
  }
});

//endpoint to create a post

app.post("/create", async (req, res) => {
  try {
    const { description, imageUrl, userId } = req.body;

    const newPost = new Post({
      description: description,
      imageUrl: imageUrl,
      user: userId,
    });

    await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.log("error creating the post", error);
    res.status(500).json({ message: "Error creating the post" });
  }
});

//endpoint to fetch all the posts
app.get("/all", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "name profileImage");

    res.status(200).json({ posts });
  } catch (error) {
    console.log("error fetching all the posts", error);
    res.status(500).json({ message: "Error fetching all the posts" });
  }
});

//endpoints to like a post
app.post("/like/:postId/:userId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    //check if the user has already liked the post
    const existingLike = post?.likes.find(
      (like) => like.user.toString() === userId
    );

    if (existingLike) {
      post.likes = post.likes.filter((like) => like.user.toString() !== userId);
    } else {
      post.likes.push({ user: userId });
    }

    await post.save();

    res.status(200).json({ message: "Post like/unlike successfull", post });
  } catch (error) {
    console.log("error likeing a post", error);
    res.status(500).json({ message: "Error liking the post" });
  }
});

//endpoint to update user description
app.put("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { userDescription } = req.body;

    await User.findByIdAndUpdate(userId, { userDescription });

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.log("Error updating user Profile", error);
    res.status(500).json({ message: "Error updating user profile" });
  }
});