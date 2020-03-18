import { getInnerText } from './getInnerText.js'
import { Page } from './Page.js'

export class FlatOfferListPage extends Page {
  async getFlatOfferElements () {
    return [] // instances of FlatOfferListElement
  }

  async getNumberOfResultsElement () {
    return null
  }

  async getNumberOfResultsText (numberOfResultsElement) {
    return await getInnerText(numberOfResultsElement)
  }

  parseNumberOfResultsText (numberOfResultsText) {
    return parseInt(numberOfResultsText, 10)
  }

  async getNumberOfResults () {
    const element = await this.getNumberOfResultsElement()
    return element ? this.parseNumberOfResultsText(this.getNumberOfResultsText(element), 10) : 0
  }
}
