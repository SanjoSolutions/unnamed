import { openPage } from '../../lib/openPage.js'
import { navigateToForm } from './navigateToForm.js'
import { navigateToFormPage } from './navigateToFormPage.js'

export async function openForm (getBrowser, flatOffer) {
  const page = await openPage(getBrowser)
  await navigateToFormPage(page, flatOffer)
  const form = await navigateToForm(page)
  return { page, form }
}
