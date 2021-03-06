import { promises as fs } from "fs";
import path from "path";
import { notify } from "./flat_offer_notifier.js";
import { getMissingFields } from "./lib/getMissingFields.js";
import { isBoolean } from "./lib/isBoolean.js";
import { isNumber } from "./lib/isNumber.js";

const modulesDirectoryName = "modules";

const modulesPath = path.join(__dirname, modulesDirectoryName);

export function verifyContactData(contactData) {
  const minimumRequiredFields = [
    "title",
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "applicationMessage",
    "numberOfAdults",
    "numberOfChildren",
    "monthlyIncome",
    "earliestDateToMoveIn",
    "wbs",
    "hasPets",
    "threatenedByLossOfHousing",
    "firstTimeHousehold",
    "mBill",
  ];
  const missingRequiredFields = getMissingFields(
    minimumRequiredFields,
    contactData
  );
  if (missingRequiredFields.length >= 1) {
    throw new Error(
      `Missing required fields in contact data: ${missingRequiredFields.join(
        ", "
      )}`
    );
  }
}

export function process(
  getBrowser,
  flatOfferFetchers,
  { intervalBetweenProcessRuns, contactData, shouldStop }
) {
  console.log("Fetching flat offers...");
  fetchFlatOffers(
    getBrowser,
    intervalBetweenProcessRuns,
    flatOfferFetchers,
    onFlatOffer.bind(null, getBrowser, contactData),
    shouldStop
  );
}

async function onFlatOffer(getBrowser, contactData, flatOffer) {
  if (
    !haveAppliedForFlatOffer(flatOffer) &&
    kommtInFrage(contactData, flatOffer)
  ) {
    await apply(getBrowser, contactData, flatOffer);
  }
}

export async function getFlatOfferFetchers() {
  const flatOfferFetchers = [];
  for (const fileName of await fs.readdir(modulesPath)) {
    let filePath = path.join(modulesPath, fileName);
    let stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.js");
      stats = await fs.stat(filePath);
    }
    if (
      isJavaScriptFile(filePath) &&
      !path.basename(fileName).startsWith("_") &&
      !path.basename(fileName, path.extname(fileName)).endsWith("_test")
    ) {
      if (stats.isFile()) {
        const module = require(filePath);
        const fetcher = module.fetch;
        if (!fetcher) {
          throw new Error(
            `Module "${filePath}" has no expected export "fetch".`
          );
        }
        if (typeof fetcher !== "function") {
          throw new Error(
            `Module "${filePath}" export "fetch" has not the expected type "function".`
          );
        }
        flatOfferFetchers.push(fetcher);
      }
    }
  }
  return flatOfferFetchers;
}

function fetchFlatOffers(
  getBrowser,
  intervalBetweenProcessRuns,
  flatOfferFetchers,
  onFlatOffer,
  shouldStop
) {
  for (const fetch of flatOfferFetchers) {
    fetch(getBrowser, intervalBetweenProcessRuns, onFlatOffer, shouldStop);
  }
}

// TODO: Needs unit tests
export function kommtInFrage(contactData, flatOffer) {
  const maxColdRentPlusColdServiceCharges = 463.65;
  const maxWarmServiceCharges = 76.5;
  const monthlyIncome =
    972.15 /* AG2 */ + 100; /* Abzugsfreier Nebenverdienst */
  return (
    ((isNumber(flatOffer.coldRent) &&
      isNumber(flatOffer.coldServiceCharges) &&
      isNumber(flatOffer.warmServiceCharges) &&
      flatOffer.coldRent + flatOffer.coldServiceCharges <=
        maxColdRentPlusColdServiceCharges &&
      flatOffer.warmServiceCharges <= maxWarmServiceCharges) ||
      (isNumber(flatOffer.warmRent) &&
        flatOffer.warmRent <=
          maxColdRentPlusColdServiceCharges + maxWarmServiceCharges) ||
      (isNumber(flatOffer.coldRent) &&
        isNumber(flatOffer.serviceCharges) &&
        flatOffer.coldRent + flatOffer.serviceCharges <=
          maxColdRentPlusColdServiceCharges + maxWarmServiceCharges)) &&
    forPeopleOfAge(flatOffer, 29) &&
    flatOffer.area <= 50 && // m ** 2
    flatOffer.numberOfRooms <= 2 &&
    (!flatOffer.url.includes("howoge") ||
      monthlyIncome >= 3 * totalRent(flatOffer)) && // Haushaltsnettoeinkommen >= 3 * Gesamtmiete
    (!isBoolean(flatOffer.selfRenovation) ||
      flatOffer.selfRenovation === Boolean(contactData.selfRenovation))
  );
}

function totalRent(flatOffer) {
  if (
    isNumber(flatOffer.coldRent) &&
    isNumber(flatOffer.coldServiceCharges) &&
    isNumber(flatOffer.warmServiceCharges)
  ) {
    return (
      flatOffer.coldRent +
      flatOffer.coldServiceCharges +
      flatOffer.warmServiceCharges
    );
  } else if (isNumber(flatOffer.warmRent)) {
    return flatOffer.warmRent;
  } else if (
    isNumber(flatOffer.coldRent) &&
    isNumber(flatOffer.serviceCharges)
  ) {
    return flatOffer.coldRent + flatOffer.serviceCharges;
  }
}

function forPeopleOfAge(flatOffer, age) {
  return (
    !isFlatOfferForSeniorsOnly(flatOffer) &&
    (typeof flatOffer.requiredMinimumAge !== "number" ||
      age >= flatOffer.requiredMinimumAge)
  );
}

function isFlatOfferForSeniorsOnly(flatOffer) {
  return Boolean(flatOffer.seniorsOnly);
}

async function apply(getBrowser, contactData, flatOffer) {
  if (typeof flatOffer.apply === "function") {
    console.log("Applying for flat offer: ", flatOffer);
    await flatOffer.apply(getBrowser, contactData);
  } else {
    console.log("Sending notification for flat offer: ", flatOffer);
    await notify(flatOffer, contactData);
  }
  /*
  console.log('Sending notification for flat offer: ', flatOffer)
  await notify(flatOffer, contactData)
  */
  await registerFlatOfferAsAppliedTo(flatOffer);
}

// IMPROVEMENT: Structure code of haveAppliedForFlatOffer and registerFlatOfferAsAppliedTo like fetchedFlatOffers.js
// IMPROVEMENT: Save flatOffer data for manual validation (like it is done for fetchedFlatOffers.json)
function haveAppliedForFlatOffer(flatOffer) {
  // FIXME: User readJSON instead of require
  const flatOffersAppliedTo = require("../flatOffersAppliedTo.json");
  return flatOffersAppliedTo.includes(flatOffer.url);
}

async function registerFlatOfferAsAppliedTo(flatOffer) {
  // FIXME: User readJSON instead of require
  const flatOffersAppliedTo = require("../flatOffersAppliedTo.json");
  flatOffersAppliedTo.push(flatOffer.url);
  await fs.writeFile(
    path.resolve(__dirname, "..", "flatOffersAppliedTo.json"),
    JSON.stringify(flatOffersAppliedTo, null, 2)
  );
}

function isJavaScriptFile(filePath) {
  return [".js", ".mjs", ".cjs"].includes(path.extname(filePath));
}
