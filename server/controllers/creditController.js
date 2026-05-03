import Transaction from "../models/Transaction.js";
import Razorpay from 'razorpay'

const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]


//api controller for getting all plans

export const getPlans = async (req, res) => {
    try {
        res.json({ success: true, plans })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})

//api controller for purchasing plan
export const purchasePlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user._id;
        const plan = plans.find(plan => plan._id === planId);
        if (!plan) return res.json({ success: false, message: "Plan does not exist" });


        //create new transaction
        const transaction = await Transaction.create({
            userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })

        //create order
        const options = {
            amount: plan.price * 100,
            currency: process.env.CURRENCY,
            receipt: transaction._id.toString(),
            notes: {
                transactionId: transaction._id.toString()
            }
        }

        await razorpay.orders.create(options, (error, order) => {
            if (error) {
                res.json({ success: false, message: error.message });
            }
            res.json({ success: true, order });
        })

    } catch (error) {

    }
}