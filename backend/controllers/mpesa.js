const axios = require("axios");
const { getAccessToken } = require("../utils/mpesaAccessToken");
const {normalizePhone} = require("../utils/nomalizePhoneNo");

const stkPush = async (req, res) => {
    try {

        const { phoneNumber, amount  } = req.body;
        const formattedPhone = normalizePhone(phoneNumber);

        const purpose = "subscribe";

        const token = await getAccessToken();

        const date = new Date();

        const timestamp =
            date.getFullYear().toString() +
            String(date.getMonth() + 1).padStart(2, "0") +
            String(date.getDate()).padStart(2, "0") +
            String(date.getHours()).padStart(2, "0") +
            String(date.getMinutes()).padStart(2, "0") +
            String(date.getSeconds()).padStart(2, "0");

        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;

        const password = Buffer.from(
            shortcode + passkey + timestamp
        ).toString("base64");

        const url =
            process.env.MPESA_ENV === "production"
                ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
                : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

            const response = await axios.post(
                url,
                {
                    BusinessShortCode: shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",

                    Amount: amount,
                    PartyA: formattedPhone,
                    PartyB: shortcode,

                    PhoneNumber: formattedPhone,

                    CallBackURL: process.env.MPESA_CALLBACK_URL,

                    AccountReference: purpose,

                    TransactionDesc: "Payment for subscription or purchase"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


        return res.status(200).json({
            message: "STK Push initiated successfully",

            purpose,

            data: response.data
        });

    } catch (error) {
        console.log("Error in stkPush:", error);

        return res.status(500).json({
            message: "STK Push failed",
            error: error.response?.data || error.message
        });
    }
};

// MPESA CALLBACK
const mpesaCallback = async (req, res) => {
    try {
        const callback = req.body?.Body?.stkCallback;

        if (!callback) {
            return res.status(400).json({
                message: "Invalid callback payload"
            });
        }

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc
        } = callback;

        console.log("\n========== M-PESA CALLBACK ==========");
        console.log("MerchantRequestID:", MerchantRequestID);
        console.log("CheckoutRequestID:", CheckoutRequestID);
        console.log("ResultCode:", ResultCode);
        console.log("ResultDesc:", ResultDesc);

        if (ResultCode === 0) {

            const items = callback.CallbackMetadata?.Item || [];

            const getValue = (name) =>
                items.find(item => item.Name === name)?.Value ?? null;

            const amount = getValue("Amount");
            const receiptNumber = getValue("MpesaReceiptNumber");
            const transactionDate = getValue("TransactionDate");
            const phoneNumber = getValue("PhoneNumber");

            console.log("Payment successful");
            console.log("Amount:", amount);
            console.log("Receipt:", receiptNumber);
            console.log("Phone:", phoneNumber);
            console.log("Date:", transactionDate);

        } else {
            console.log("Payment failed or cancelled");
            console.log("Reason:", ResultDesc);
        }

        console.log("=====================================\n");
        return res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });

    } catch (error) {
        console.error("Callback error:", error);

        return res.status(500).json({
            ResultCode: 1,
            ResultDesc: "Callback processing failed"
        });
    }
};


module.exports = { 
    stkPush,
    mpesaCallback
};