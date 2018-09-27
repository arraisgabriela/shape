require 'rails_helper'

RSpec.describe SurveyResponse, type: :model do
  context 'associations' do
    it { should belong_to(:test_collection) }
    it { should have_many(:question_answers) }
  end

  describe '#all_questions_answered?' do
    let(:survey_response) { create(:survey_response) }

    context 'no questions answered' do
      it 'returns false' do
        expect(survey_response.all_questions_answered?).to be false
      end
    end

    context 'some questions answered' do
      let!(:question_answer) do
        create(:question_answer,
               survey_response: survey_response,
               question: survey_response.question_items.first)
      end

      it 'returns false' do
        expect(survey_response.all_questions_answered?).to be false
      end
    end

    context 'all questions answered' do
      let!(:question_answers) do
        survey_response.question_items.map do |question|
          create(:question_answer,
                 survey_response: survey_response,
                 question: question)
        end
      end

      it 'returns true' do
        expect(survey_response.all_questions_answered?).to be true
      end
    end
  end

  describe '#question_answer_created_or_destroyed' do
    let(:survey_response) { create(:survey_response) }

    it 'changes updated_at' do
      expect {
        survey_response.question_answer_created_or_destroyed
      }.to change(survey_response, :updated_at)
    end

    it 'keeps status as in_progress' do
      expect(survey_response.in_progress?).to be true
    end

    context 'with all questions answered' do
      let!(:question_answers) do
        survey_response.question_items.map do |question|
          create(:question_answer,
                 survey_response: survey_response,
                 question: question)
        end
      end

      it 'marks response as completed' do
        expect(survey_response.reload.completed?).to be true
      end

      it 'when answer is deleted, marks response as in_progress' do
        expect(survey_response.reload.completed?).to be true
        question_answers.first.destroy
        expect(survey_response.reload.in_progress?).to be true
      end
    end
  end
end
