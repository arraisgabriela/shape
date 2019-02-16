class SerializableSimpleItem < BaseJsonSerializer
  type 'items'
  attributes :name, :content,
             :url, :thumbnail_url, :icon_url, :question_type

  belongs_to :filestack_file

  attribute :filestack_file_url do
    @object.cached_filestack_file_url || ''
  end
end
