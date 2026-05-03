import express from "express";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const router = express.Router();

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.body)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false });
      }

      const event = JSON.parse(req.body.toString());

      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;

        const receipt =
          payment.notes?.transactionId || payment.receipt;

        const transaction = await Transaction.findById(receipt);

        if (!transaction) {
          return res.json({ success: false });
        }

        if (transaction.isPaid) {
          return res.json({ success: true });
        }

        transaction.isPaid = true;
        await transaction.save();

        await User.findByIdAndUpdate(transaction.userId, {
          $inc: { credits: transaction.credits },
        });

        return res.json({ success: true });
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  }
);

export default router;