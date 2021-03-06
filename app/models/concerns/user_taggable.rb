module UserTaggable
  extend ActiveSupport::Concern

  included do
    has_many :user_tags, as: :record, dependent: :destroy
    has_many :tagged_users, through: :user_tags, source: :user
    after_save :assign_and_remove_user_tags
  end

  class UserTagList < ActsAsTaggableOn::TagList
    # Override TagList implementation to skip downcasing,
    # as well as validate handles are user handles
    # https://github.com/mbleigh/acts-as-taggable-on/blob/master/lib/acts_as_taggable_on/tag_list.rb
    def clean!
      reject!(&:blank?)
      map!(&:to_s)
      map!(&:strip)
      # Ensure they are valid user handle
      valid_handles = User.where(handle: self).pluck(:handle)
      reject! { |handle| !valid_handles.include?(handle) }
      self
    end
  end

  def user_tag_list
    @user_tag_list ||= UserTagList.new(tagged_users.pluck(:handle))
  end

  def user_tag_list=(*assign_user_handles)
    @user_tag_list = UserTagList.new(assign_user_handles)
  end

  def reload(*args)
    @user_tag_list = nil
    super(*args)
  end

  private

  def assign_and_remove_user_tags
    @user_tag_add_user_ids = []
    @user_tag_remove_user_ids = []

    if user_tag_list.blank?
      # If they are clearing it out, remove all tagged users
      @user_tag_remove_user_ids = tagged_user_ids
    else
      assign_user_ids = User.where(handle: user_tag_list).pluck(:id)

      tagged_user_ids.each do |tagged_user_id|
        unless assign_user_ids.include?(tagged_user_id)
          @user_tag_remove_user_ids << tagged_user_id
        end
      end

      @user_tag_add_user_ids = assign_user_ids - tagged_user_ids
    end

    if @user_tag_remove_user_ids.present? && persisted?
      UserTag.where(
        record_id: id,
        record_type: self.class.base_class.name,
        user_id: @user_tag_remove_user_ids,
      ).destroy_all
      after_remove_tagged_user_ids(@user_tag_remove_user_ids)
    end

    if @user_tag_add_user_ids.present?
      @user_tag_add_user_ids.each do |user_id|
        UserTag.create(
          record_id: id,
          record_type: self.class.base_class.name,
          user_id: user_id,
        )
      end

      after_add_tagged_user_ids(@user_tag_add_user_ids)
    end

    # Reload so relationship isn't cached if assigning in-memory object instance
    tagged_users.reload if @user_tag_remove_user_ids || @user_tag_add_user_ids.present?

    # Set to nil so it is reloaded when accessed again,
    # so any invalid handles aren't preserved
    @user_tag_list = nil
  end

  def after_remove_tagged_user_ids(user_ids)
    return unless submission? && inside_a_challenge?

    # Remove the challenge collection filter for these user(s), if this was the last tag for them
    remaining_user_ids = UserTag.where(
      record_id: parent.submissions.pluck(:id),
      record_type: self.class.base_class.name,
      user_id: user_ids,
    ).pluck(:user_id)

    remove_user_ids = user_ids - remaining_user_ids
    return if remove_user_ids.empty?

    User.where(id: remove_user_ids).each do |user|
      remove_challenge_reviewer_filter_from_submission_box(user)
    end
  end

  def after_add_tagged_user_ids(user_ids)
    # If a user is tagged on a submission within a challenge,
    # add them to the selectable collection filters if not already
    return unless submission? && inside_a_challenge?

    User.where(id: user_ids).each do |user|
      add_challenge_reviewer_filter_to_submission_box(user)
    end
  end
end
