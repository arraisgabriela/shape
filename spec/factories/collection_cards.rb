FactoryBot.define do
  factory :collection_card do
    parent factory: :collection
    order 0

    trait :reference do
      reference true
    end

    factory :collection_card_item do
      item factory: :text_item
      collection nil
    end

    factory :collection_card_collection do
      collection
      item nil
    end
  end
end
