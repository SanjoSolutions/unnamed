import { FlatOfferDetailPage } from "../../lib/FlatOfferDetailPage.js";
import { isTitleOfSeniorsOnlyFlat } from "../../lib/isTitleOfSeniorsOnlyFlat.js";
import { parseCurrencyText } from "../../lib/parseCurrencyText.js";
import { parseFloatNumberText } from "../../lib/parseFloatNumberText.js";
import { parseNumberOfRooms } from "../../lib/parseNumberOfRooms.js";

export class GewobagFlatOfferDetailPage extends FlatOfferDetailPage {
  async getCosts() {
    if (!this.costs) {
      const costsDataRows = await this.page.$$(".details-price li");
      this.costs = await Promise.all(
        costsDataRows.map(async (costsDataRow) => {
          const keyElement = await costsDataRow.$(".detail-label");
          const key = await keyElement.evaluate((node) => node.innerHTML);
          const valueElement = await costsDataRow.$(".detail-value");
          const value = await valueElement.evaluate((node) => node.innerText);
          return [key, value];
        })
      );
    }

    return this.costs;
  }

  async getCost(keyToFind) {
    return (await this.getCosts()).find(([key]) => key === keyToFind);
  }

  async getKeyFigures() {
    if (!this.keyFigures) {
      const keyFiguresRows = await this.page.$$(".details-general li");
      this.keyFigures = await Promise.all(
        keyFiguresRows.map(async (keyFiguresRow) => {
          const keyElement = await keyFiguresRow.$(".detail-label");
          const key = await keyElement.evaluate((node) => node.innerHTML);
          const valueElement = await keyFiguresRow.$(".detail-value");
          const value = await valueElement.evaluate((node) => node.innerText);
          return [key, value];
        })
      );
    }

    return this.keyFigures;
  }

  async getKeyFigure(keyToFind) {
    return (await this.getKeyFigures()).find(([key]) => key === keyToFind);
  }

  async getColdRent() {
    const coldRentText = (await this.getCost("Grundmiete"))[1];
    return parseCurrencyText(coldRentText);
  }

  async getColdServiceCharges() {
    const coldServiceChargesText = (
      await this.getCost("VZ Betriebskosten kalt")
    )[1];
    return parseCurrencyText(coldServiceChargesText);
  }

  async getWarmServiceCharges() {
    const warmServiceChargesEntry = await this.getCost(
      "VZ Betriebskosten warm"
    );
    if (warmServiceChargesEntry) {
      const warmServiceChargesText = warmServiceChargesEntry[1];
      return parseCurrencyText(warmServiceChargesText);
    } else {
      return null;
    }
  }

  async getWarmRent() {
    const warmRent = await this.getCost("Gesamtmiete");
    return parseCurrencyText(warmRent[1]);
  }

  async getArea() {
    const areaText = (await this.getKeyFigure("Fläche in m²"))[1];
    return parseFloatNumberText(areaText);
  }

  async getNumberOfRooms() {
    const numberOfRoomsText = (await this.getKeyFigure("Anzahl Zimmer"))[1];
    return parseNumberOfRooms(numberOfRoomsText);
  }

  async getTitle() {
    const titleElement = await this.page.$(".entry-title");
    return await titleElement.evaluate((node) => node.innerText);
  }

  async getSeniorsOnly() {
    return isTitleOfSeniorsOnlyFlat(await this.getTitle());
  }

  async getSelfRenovation() {
    return (await this.getTitle()).includes("Selbstrenovier");
  }
}
