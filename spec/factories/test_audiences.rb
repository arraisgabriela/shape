FactoryBot.define do
  factory :test_audience do
    sample_size 1
    audience
    test_collection nil
    launched_by factory: :user
  end
end