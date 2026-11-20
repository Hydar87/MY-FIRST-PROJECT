
const normalizePhone = (phoneNumber) => {
    let formattedPhone = String(phoneNumber).trim();

    formattedPhone = formattedPhone.replace(/^\+/, "");

    if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
    }

    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
        throw new Error("Invalid Kenyan phone number");
    }

    return formattedPhone;
};

module.exports = { normalizePhone };
