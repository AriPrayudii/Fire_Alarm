const webpush = require("web-push");

const vapidKeys = {
  publicKey:
    "BIEymX_zdwr0NYmItCv1uR_nBMPTPvMNW9Okw7fe1we19c-lyKMuXOaia-LB0rxaQhDUIdWmr_rekQpXJqg_1rE",
  privateKey: "Acd-4Z5kfHrESmGjKp8tJq0g4AOSsVNMwCJ_sm5F6Ow",
};

webpush.setVapidDetails(
  "mailto:oweiuqoweuq@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

module.exports = { webpush, vapidKeys };
