import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig.js"; // development only
// import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import fetch from "node-fetch";
import * as cron from "node-cron";
import moment from "moment";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import * as notify from "./notify.js";
import * as http from "http";
import express from "express";
import { google } from "googleapis";

const cs1a = process.env.cs1a;
const cs1p = process.env.cs1p;
const cd3a = process.env.cd3a;
const cd3p = process.env.cd3p;

const privateKeys = [process.env.cs1k, process.env.cd3k];
const signatureProvider = new JsSignatureProvider(privateKeys);

// test
// endpoints https://wax.eosio.online/endpoints
// const rpc = new JsonRpc("https://wax.greymass.com/", { fetch });
const rpc = new JsonRpc("http://wax.api.eosnation.io/", { fetch });
// const rpc = new JsonRpc("https://wax.eosusa.news/", { fetch });
const api = new Api({
  rpc: rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder(),
});

let currentTime = new Date();
let localDate = Date.now().toLocaleString("en-US", {
  timeZone: "America/New_York",
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// await delay(1000) /// waiting 1 second.

async function cpu4_update_balance() {
  // while (true) {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "cpu4",
            name: "updatebalance",
            authorization: [
              {
                actor: cs1a,
                permission: cs1p,
              },
            ],
            data: {
              username: cs1a,
            },
          },
          {
            account: "cpu4",
            name: "updatebalance",
            authorization: [
              {
                actor: cd3a,
                permission: cd3p,
              },
            ],
            data: {
              username: cd3a,
            },
          },
        ],
      },
      { useLastIrreversible: true, expireSeconds: 300 }
    );
    console.log("\x1b[32m%s\x1b[0m", "balances updated");
  } catch (error) {
    console.log(error);
    console.log("ERROR: unable to update balances. \nExiting..");
    process.exit();
  }
}

async function claim_voter() {
  // while (true) {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "eosio",
            name: "voterclaim",
            authorization: [
              {
                actor: "cs1a",
                permission: "cs1p",
              },
            ],
            data: {
              owner: "cs1a",
            },
          },
        ],
      },
      { useLastIrreversible: true, expireSeconds: 300 }
    );
    console.log("\x1b[32m%s\x1b[0m", "voter claimed");
  } catch (error) {
    console.log("\x1b[33m%s\x1b[0m", error.message);
    if (
      (error.message =
        "assertion failure with message: already claimed rewards within past day")
    ) {
      // await setTimeout(claim_voter(), 500);
      await sleep(500);
      await claim_voter();
      // setTimeout((await claim_voter(), 500));
      // etTimeout(() => await claim_voter(), 1000);
    }
    // process.exit();
  }
  // }
}

async function get_cs1_balance() {
  const cs1_wax = await rpc.get_currency_balance("eosio.token", "cs1a", "WAX");
  return Number(cs1_wax.join(", ").split(" ")[0]);
}

async function get_cpu4_cs1_deposit() {
  try {
    const transaction = await rpc.get_table_rows({
      json: true, // Get the response as json
      code: "cpu4", // Contract that we target
      scope: "cpu4", // Account that owns the data
      table: "deposits", // Table name
      // index_position: 2, // Table secondary index
      lower_bound: cs1a, // Table secondary key value
      limit: 1, // Here we limit to 1 to get only row
      reverse: false, // Optional: Get reversed data
      show_payer: false, // Optional: Show ram payer
    });
    return Number(transaction.rows[0].wax.split(" ")[0]);
  } catch (error) {
    console.log(error);
    console.log("ERROR: unable to get cs1 deposit");
    console.log(error.message);
  }
}

async function get_cpu4_cd3_deposit() {
  try {
    const transaction = await rpc.get_table_rows({
      json: true, // Get the response as json
      code: "cpu4", // Contract that we target
      scope: "cpu4", // Account that owns the data
      table: "deposits", // Table name
      // index_position: 2, // Table secondary index
      lower_bound: cd3a, // Table secondary key value
      limit: 1, // Here we limit to 1 to get only row
      reverse: false, // Optional: Get reversed data
      show_payer: false, // Optional: Show ram payer
    });
    return Number(transaction.rows[0].wax.split(" ")[0]);
  } catch (error) {
    console.log(error);
    console.log("ERROR: unable to get cs1 deposit");
    console.log(error.message);
  }
}

async function stake(cs1_balance) {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "eosio",
            name: "delegatebw",
            authorization: [
              {
                actor: cs1a,
                permission: "cs1p",
              },
            ],
            data: {
              from: cs1a,
              receiver: cs1a,
              stake_net_quantity: "0.00000000 WAX",
              stake_cpu_quantity: cs1_balance + " WAX",
              transfer: false,
            },
          },
        ],
      },
      {
        useLastIrreversible: true,
        expireSeconds: 300,
      }
    );
    console.log("balance staked");
  } catch (error) {
    console.log(error);
  }
}

async function deposit_cpu4(cs1_balance) {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "eosio.token",
            name: "transfer",
            authorization: [
              {
                actor: cs1a,
                permission: cs1p,
              },
            ],
            data: {
              from: cs1a,
              to: "cpu4",
              quantity: cs1_balance + " WAX",
              memo: "Deposit",
            },
          },
        ],
      },
      {
        useLastIrreversible: true,
        expireSeconds: 300,
      }
    );
    console.log("balance staked");
  } catch (error) {
    console.log(error);
  }
}

async function get_cs1_voter_info() {
  try {
    const transaction = await rpc.get_table_rows({
      json: true, // Get the response as json
      code: "eosio", // Contract that we target
      scope: "eosio", // Account that owns the data
      table: "voters", // Table name
      // index_position: 2, // Table secondary index
      lower_bound: cs1a, // Table secondary key value
      limit: 1, // Here we limit to 1 to get only row
      reverse: false, // Optional: Get reversed data
      show_payer: false, // Optional: Show ram payer
    });
    let staked = Number(transaction.rows[0].staked) / 100000000;
    let last_claim_time = transaction.rows[0].last_claim_time;
    return { staked, last_claim_time };
  } catch (error) {
    console.log(error);
    console.log("ERROR: unable to get cs1 deposit");
    console.log(error.message);
  }
}

async function update(cpu4_cs1_deposit, cpu4_cd3_deposit) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.keyFile,
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Instance of Google Sheets API
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.spreadsheetId;

    // Write row(s) to spreadsheet
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      // range: "cpu4!C10:O10",
      range: "test!A3",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            new Date(),
            "",
            cpu4_cs1_deposit,
            "=C3-C2-B3",
            "=(C3-C2)/C2",
            "",
            cpu4_cd3_deposit,
            "=G3-G2-F3",
            "=(G3-G2)/G2",
          ],
        ],
      },
    });
    // console.log(googleSheets.spreadsheets.values);
    console.log("\x1b[32m%s\x1b[0m", "updated spreadsheet successfully!");
  } catch (error) {
    console.log(error);
    console.log("ERROR: unable to update to sheet");
    console.log(error.message);
  }
}

async function append(cpu4_cs1_deposit, cpu4_cd3_deposit, cs1_staked) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.keyFile,
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Instance of Google Sheets API
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.spreadsheetId;

    // Write row(s) to spreadsheet
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      // range: "cpu4!C10:O10",
      range: "cpu4!C10",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            new Date(),
            "",
            cpu4_cs1_deposit,
            "",
            "",
            "",
            "",
            cpu4_cd3_deposit,
            "",
            "",
            "",
            "",
            cs1_staked,
          ],
        ],
      },
    });
    console.log("\x1b[32m%s\x1b[0m", "appended spreadsheet successfully!");
  } catch (error) {
    console.log(error);
    console.log("ERROR: unable to append to sheet");
    console.log(error.message);
  }
}

export async function run() {
  console.log(Date());
  // await cpu4_update_balance();
  // await claim_voter();

  await sleep(3000);
  // let cs1_balance = await get_cs1_balance();
  // console.log("\x1b[33m%s\x1b[0m", "cs1balance | " + cs1_balance);
  // if (cs1_balance != 0) {
  //   // await stake(cs1_balance);
  //   await deposit_cpu4(cs1_balance);
  // }

  let cpu4_cs1_deposit = await get_cpu4_cs1_deposit();
  console.log("\x1b[35m%s\x1b[0m", "cpu4cs1dep | " + cpu4_cs1_deposit);
  let cpu4_cd3_deposit = await get_cpu4_cd3_deposit();
  console.log("\x1b[35m%s\x1b[0m", "cpu4cd3dep | " + cpu4_cd3_deposit);

  await sleep(3000);

  let voter = await get_cs1_voter_info();
  let cs1_staked = voter.staked;
  console.log("\x1b[35m%s\x1b[0m", "cs1_staked | " + cs1_staked);

  // await update(cpu4_cs1_deposit, cpu4_cd3_deposit);
  await append(cpu4_cs1_deposit, cpu4_cd3_deposit, cs1_staked);

  console.log(Date());
  console.log("waiting to update tomorrow at 17:0:00...");
}

// run();

// console.log("waiting to update at 17:00:00...");
// cron.schedule("00 17 * * *", run);

/*
"\x1b[32m%s\x1b[0m", green string & reset
\x1b[32m  green
\x1b[0m   reset
\x1b[31m  red

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
*/
