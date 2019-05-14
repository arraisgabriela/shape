class SurveyResponse < ApplicationRecord
  belongs_to :test_collection, class_name: 'Collection::TestCollection', touch: true
  belongs_to :user, optional: true
  belongs_to :test_audience, optional: true
  has_many :question_answers, dependent: :destroy
  has_one :feedback_incentive_record

  after_save :create_open_response_items, if: :completed?

  delegate :question_items, to: :test_collection
  delegate :answerable_complete_question_items, to: :test_collection

  enum status: {
    in_progress: 0,
    completed: 1,
  }

  def all_questions_answered?
    # nil case should only happen in test env (test_design is not created)
    return true if answerable_complete_question_items.nil?
    # compare answerable question items to the ones we've answered
    (answerable_complete_question_items.pluck(:id) - question_answers.pluck(:question_id)).empty?
  end

  def question_answer_created_or_destroyed
    if all_questions_answered?
      SurveyResponseCompletion.call(self)
    else
      update(updated_at: Time.current)
    end
  end

  def cache_test_scores!
    return unless test_collection.inside_a_submission?
    test_collection.parent_submission.cache_test_scores!
  end

  private

  def create_open_response_items
    question_answers
      .joins(:question)
      .includes(:open_response_item)
      .where(
        Item::QuestionItem
          .arel_table[:question_type]
          .eq(Item::QuestionItem.question_types[:question_open]),
      ).each do |question_answer|
        next if question_answer.open_response_item.present?
        # Save will trigger the callback to create the item
        question_answer.save
      end
  end
end
