require 'csv'

module DataReport
  class DatasetsCSVReport < SimpleService
    def initialize(datasets:)
      @datasets = datasets
    end

    def call
      CSV.generate do |csv|
        dates = @datasets.map(&:data).flatten.map { |d| d['date'] }.uniq.sort
        csv << [' '] + dates

        @datasets.each do |ds|
          source = ds.name
          if ds.type == 'Dataset::CollectionsAndItems'
            source = ds.data_source.present? ? 'Collection' : 'Organization'
          end
          row = Array.new(dates.size + 1, ' ')

          ds.data.each do |d|
            idx = dates.index(d['date']) + 1
            row[idx] = d['value']
          end
          row[0] = source
          csv << row
        end
      end
    end
  end
end
