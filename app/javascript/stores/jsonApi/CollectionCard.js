import { action, observable } from 'mobx'

import { uiStore } from '~/stores'
import BaseRecord from './BaseRecord'

class CollectionCard extends BaseRecord {
  @observable maxWidth = this.width

  // this gets set based on number of visible columns, and used by CollectionCover
  @action setMaxWidth(val) {
    this.maxWidth = val
  }

  beginReplacing() {
    uiStore.openBlankContentTool({
      order: this.order,
      width: this.width,
      height: this.height,
      replacingId: this.id,
    })
  }

  async API_create({ isReplacing = false } = {}) {
    try {
      await this.apiStore.request('collection_cards', 'POST', { data: this.toJsonApi() })
      if (!isReplacing) {
        await this.apiStore.fetch('collections', this.parent.id, true)
        uiStore.closeBlankContentTool()
      }
    } catch (e) {
      // console.warn(e)
    }
  }

  async API_archive({ isReplacing = false } = {}) {
    // eslint-disable-next-line no-alert
    const agree = isReplacing ? true : window.confirm('Are you sure?')
    if (agree) {
      const collection = this.parent
      let lastCard = false
      try {
        await this.apiStore.request(`collection_cards/${this.id}/archive`, 'PATCH')
        if (collection.collection_cards.length === 1) lastCard = true

        await this.apiStore.fetch('collections', collection.id, true)
        if (isReplacing) uiStore.closeBlankContentTool()
        // for some reason it doesn't remove the last card when you re-fetch
        if (lastCard) collection.emptyCards()
        return true
      } catch (e) {
        // console.warn(e)
      }
    }
    return false
  }

  async API_duplicate() {
    try {
      // This method will increment order of all cards after this one
      await this.apiStore.request(`collection_cards/${this.id}/duplicate`, 'POST')
      // Refresh collection after re-ordering - force reloading
      this.apiStore.fetch('collections', this.parent.id, true)
    } catch (e) {
      // console.warn(e)
    }
  }
}
CollectionCard.type = 'collection_cards'

export default CollectionCard
