# == Schema Information
#
# Table name: datasets
#
#  id               :bigint(8)        not null, primary key
#  anyone_can_view  :boolean          default(TRUE)
#  cached_data      :jsonb
#  chart_type       :integer
#  data_source_type :string
#  description      :text
#  groupings        :jsonb
#  identifier       :string
#  max_domain       :integer
#  measure          :string
#  name             :string
#  question_type    :string
#  style            :jsonb
#  tiers            :jsonb
#  timeframe        :integer
#  total            :integer
#  type             :string
#  url              :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  application_id   :integer
#  data_source_id   :bigint(8)
#  organization_id  :bigint(8)
#
# Indexes
#
#  index_datasets_on_anyone_can_view                      (anyone_can_view)
#  index_datasets_on_data_source_type_and_data_source_id  (data_source_type,data_source_id)
#  index_datasets_on_organization_id                      (organization_id)
#

class Dataset
  class CollectionsAndItems < Dataset
    VALID_MEASURES = %w[
      participants
      viewers
      activity
      content
      collections
      items
      records
    ].freeze

    validates :measure, inclusion: { in: Dataset::CollectionsAndItems::VALID_MEASURES }

    def data
      if ever?
        return [{ date: 'ever', value: single_value }]
      end

      data_report.call
    end

    def single_value
      return unless ever?

      data_report.single_value
    end

    private

    def data_report
      DataReport::CollectionsAndItems.new(
        dataset: self,
      )
    end
  end
end
