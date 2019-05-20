class SerializableTestAudience < BaseJsonSerializer
  type 'test_audiences'
  attributes :sample_size, :audience_id, :test_collection_id

  belongs_to :audience
  belongs_to :test_collection

  attribute :price_per_response do
    @object.price_per_response.to_f
  end

  attribute :num_survey_responses do
    @object.survey_responses.size
  end
end
