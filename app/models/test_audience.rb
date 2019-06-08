# == Schema Information
#
# Table name: test_audiences
#
#  id                 :bigint(8)        not null, primary key
#  closed_at          :datetime
#  price_per_response :decimal(10, 2)
#  sample_size        :integer
#  status             :integer          default("open")
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audience_id        :bigint(8)
#  launched_by_id     :integer
#  network_payment_id :string
#  test_collection_id :bigint(8)
#
# Indexes
#
#  index_test_audiences_on_audience_id         (audience_id)
#  index_test_audiences_on_test_collection_id  (test_collection_id)
#
# Foreign Keys
#
#  fk_rails_...  (audience_id => audiences.id)
#

class TestAudience < ApplicationRecord
  belongs_to :audience
  belongs_to :test_collection,
             class_name: 'Collection::TestCollection',
             touch: true
  belongs_to :launched_by, class_name: 'User', optional: true
  has_many :survey_responses
  has_many :payments, as: :purchasable

  delegate :name,
           :link_sharing?,
           to: :audience
  validates :price_per_response, presence: true

  before_validation :set_price_per_response_from_audience, on: :create
  before_create :purchase, if: :requires_payment?

  delegate :name, :price_per_response,
           to: :audience,
           prefix: true

  delegate :organization, to: :test_collection

  delegate :number_to_currency, to: 'ActionController::Base.helpers'

  # this will only get set in PurchaseTestAudience
  attr_writer :network_payment_method

  scope :link_sharing, -> { where(price_per_response: 0) }
  scope :paid, -> { where('price_per_response > 0') }
  scope :ordered_last_closed_at, -> { order(closed_at: :desc) }

  PAYMENT_WAITING_PERIOD = 1.week

  enum status: {
    open: 0,
    closed: 1,
  }

  def self.display_name
    'Audience'
  end

  def paid?
    price_per_response > 0
  end

  def survey_response_completed!
    return unless reached_sample_size?
    self.status = :closed
    self.closed_at = Time.current
    save
    test_collection.test_audience_closed!
  end

  def reached_sample_size?
    return false if link_sharing?
    survey_responses.completed.size >= sample_size
  end

  def description
    "#{launched_by.name} launched #{test_collection.name} test with " \
      "#{sample_size} total #{audience_name} audience respondents at " +
      number_to_currency(price_per_response || 0)
  end

  def total_price
    return 0 if price_per_response.blank?
    sample_size * price_per_response
  end

  private

  # This callback only gets called when using PurchaseTestAudience and setting payment_method
  def purchase
    return unless valid?

    payment = payments.create(
      network_payment_method_id: @network_payment_method.id,
      description: description,
      amount: total_price.to_f,
      quantity: sample_size,
      unit_amount: price_per_response.to_f,
    )

    return if payment.persisted?

    errors.add(:base, "Payment failed: #{payment.errors.full_messages.join('. ')}")
    throw :abort
  end

  def requires_payment?
    @network_payment_method.present? && total_price.positive?
  end

  def set_price_per_response_from_audience
    self.price_per_response ||= audience&.price_per_response
  end
end
