require 'rails_helper'

RSpec.describe CardDuplicatorMapper::Base, type: :service do
  let(:batch_id) { SecureRandom.hex(10) }
  subject do
    CardDuplicatorMapper::Base.new(batch_id: batch_id)
  end

  context 'registering duplicated cards' do
    before do
      # Stub out so that it doesn't clear cards
      allow(CardDuplicatorMapper::RemapLinkedCards).to receive(:call)
    end

    it 'stores card ids' do
      subject.register_duplicated_card(
        original_card_id: '123',
        to_card_id: '456',
      )
      expect(subject.duplicated_cards_hash['123']).to eq('456')
      expect(subject.duplicated_card_ids).to eq(['123'])
    end

    it 'calls RemapLinkedCards if all cards mapped' do
      expect(CardDuplicatorMapper::RemapLinkedCards).to receive(:call).with(
        batch_id: batch_id,
      )
      subject.register_duplicated_card(
        original_card_id: '123',
        to_card_id: '456',
      )
      subject.register_linked_card(
        card_id: '123',
        data: { type: :link_item },
      )
      expect(subject.all_cards_mapped?).to be true
    end
  end

  context 'registering linked cards' do
    before do
      subject.register_linked_card(
        card_id: '789',
        data: { type: :link_item },
      )
    end

    it 'stores card data' do
      expect(subject.linked_cards_hash['789']).to eq({ type: :link_item }.to_s)
      expect(subject.linked_card_ids).to eq(['789'])
      expect(subject.linked_card?(card_id: '789')).to be true
    end
  end
end
