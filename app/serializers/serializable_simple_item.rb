class SerializableSimpleItem < BaseJsonSerializer
  type 'items'
  attributes :name, :content,
             :url, :thumbnail_url, :icon_url,
             :question_type, :question_description, :question_title,
             :archived, :is_restorable

  belongs_to :filestack_file

  attribute :filestack_file_url do
    @object.filestack_file_signed_url
  end

  attribute :filestack_handle do
    @object.filestack_file_handle
  end

  attribute :is_restorable do
    @object.try(:restorable?)
  end
end
