class Item < ApplicationRecord
  # The primary collection that 'owns' this item
  has_one :parent_collection_card,
          -> { not_reference },
          class_name: 'CollectionCard'

  # All collection cards this is linked to
  has_many :collection_cards, -> { reference }

  delegate :collection, to: :parent_collection_card

  validates :type, presence: true
end
