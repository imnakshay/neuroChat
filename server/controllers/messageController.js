import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import axios from "axios";
import imagekit from '../configs/imagekit.js';


//text based ai chat controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        //check credits
        if (req.user.credits < 1) return res.json({ success: false, message: "You don't have enough credits" });

        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({ _id: chatId, userId });

        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

        //open ai response
        const { choices } = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [

                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };
        res.json({ success: true, reply });

        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    } catch (error) {
        res.json({ success: false, message: error.message + "api error" });
    }
}



//image generation controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.credits < 2) return res.json({ success: false, message: "You don't have enough credits." });


        const { prompt, chatId, isPublished } = req.body;

        //find chat 
        const chat = await Chat.findOne({ userId, _id: chatId });

        //push User messages
        chat.messages.push({
            role: "user", content: prompt, timestamp: Date.now(), isImage: false
        });

        //encode the prompt;
        const encodedPrompt = encodeURIComponent(prompt);

        //construct imagekit ai url
        // const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/neurochat/${Date.now()}.png?tr=w-800,h-800`;
        // console.log(generatedImageUrl);////2414124124

        //trigger generation by fetching from Imagekit.
        const payload = {
            prompt,
            output_format: "png"
        };
        const aiImageResponse = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/generate/core`,
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                    Accept: "image/*"
                },
            },
        );

        //conver to base64
        const base64image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`

        //upload image kit media library
        const uploadResponse = await imagekit.upload({
            file: base64image,
            fileName: `${Date.now()}.png`,
            folder: "neurochat"
        })

        const reply = { role: "assistant", content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished }
        res.json({ success: true, reply });


        //update the database
        chat.messages.push(reply);
        await chat.save();

        //deduct the two credits
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


