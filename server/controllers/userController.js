import User from "../models/User.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import Chat from "../models/Chat.js";

//generate jwt
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

//api to register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        //chech whether user exist or not
        const userExist = await User.findOne({ email });
        if (userExist) return res.json({ message: "User already registered.", success: false });

        const user = await User.create({ name, email, password }); // it will register the user in database

        const token = generateToken(user._id);

        //sending the response of successfull registration along with the jwt token
        res.json({ success: true, token });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

//api to login user
export const loginUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = generateToken(user._id);
                return res.json({ success: true, token });
            }
        }
        return res.json({ success: false, message: "Invalid email or password." });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//api to get user data;
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.json({ success: true, user });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}


//api to get published images
export const getPublishedImages = async (req, res) => {
    try {
        const publishedImageMessages = await Chat.aggregate([
            { $unwind: "$messages" },
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                },
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])

        res.json({success:true,images:publishedImageMessages.reverse()})
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}