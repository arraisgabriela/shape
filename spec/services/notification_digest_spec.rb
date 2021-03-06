require 'rails_helper'

RSpec.describe NotificationDigest, type: :service do
  let!(:organization) { create(:organization) }
  # persist objects so that NotificationDigest queries will work
  let!(:user) { create(:user) }
  let!(:other_user) { create(:user) }
  let(:digest_service) do
    NotificationDigest.new(type: type)
  end

  before do
    mail_double = double('mail')
    allow(NotificationMailer).to receive(:notify).and_return(mail_double)
    allow(mail_double).to receive(:deliver_later).and_return(true)
    User.update_all(last_notification_mail_sent: 1.day.ago)
    user.reload # pick up model change from update_all
  end

  describe '#call' do
    context 'with type = :notifications' do
      let(:type) { :notifications }
      let!(:activity) { create(:activity, organization: organization, action: 'moved') }
      let!(:notification) { create(:notification, user: user, activity: activity) }

      it 'should send a notification digest for each user that has a recent notification' do
        expect(NotificationMailer).to receive(:notify).with(
          user_id: user.id,
          notification_ids: [notification.id],
          comment_thread_ids: [],
        )
        digest_service.call
      end

      context 'with last_notification_mail_sent recently' do
        before do
          User.update_all(last_notification_mail_sent: Time.now)
        end

        it 'should not send a notification' do
          expect(NotificationMailer).not_to receive(:notify)
          digest_service.call
        end
      end

      context 'with a notification of a comment' do
        let!(:comment_activity) { create(:activity, organization: organization, action: 'commented') }
        let!(:comment_notification) { create(:notification, user: user, activity: comment_activity) }

        it 'does not send a (redundant) notification' do
          expect(NotificationMailer).to receive(:notify).with(
            user_id: user.id,
            notification_ids: [notification.id],
            comment_thread_ids: [],
          )

          expect(NotificationMailer).to_not receive(:notify).with(
            user_id: user.id,
            notification_ids: [comment_notification.id],
            comment_thread_ids: [],
          )

          digest_service.call
        end
      end

      context 'with user opted out of notifications' do
        let!(:user) { create(:user, notify_through_email: false) }

        it 'should not send a notification digest to the user' do
          expect(NotificationMailer).not_to receive(:notify).with(
            user_id: user.id,
            notification_ids: [notification.id],
            comment_thread_ids: [],
          )
          digest_service.call
        end
      end
    end

    context 'with type = :mentions' do
      let(:group_user) { create(:user) }
      let(:group) { create(:group, add_admins: [group_user]) }
      let(:type) { :mentions }
      let!(:comment_thread) do
        create(:item_comment_thread, organization: organization, add_followers: [user, other_user, group_user])
      end
      let!(:comment_with_mentions) do
        create(:comment,
               add_mentions: [user, other_user],
               add_group_mentions: [group],
               comment_thread: comment_thread)
      end

      before do
        User.update_all(last_notification_mail_sent: 1.day.ago)
        user.reload # pick up model change from update_all
      end

      it 'should send a notification digest for each user that has been recently mentioned' do
        # expect notification email to be sent to user
        expect(NotificationMailer).to receive(:notify).with(
          user_id: user.id,
          notification_ids: anything,
          comment_thread_ids: anything,
        )
        # ...and other_user
        expect(NotificationMailer).to receive(:notify).with(
          user_id: other_user.id,
          notification_ids: anything,
          comment_thread_ids: anything,
        )
        # ...and group user
        expect(NotificationMailer).to receive(:notify).with(
          user_id: group_user.id,
          notification_ids: anything,
          comment_thread_ids: anything,
        )
        digest_service.call
      end

      context 'when comment has been deleted before email sent' do
        before { comment_with_mentions.destroy }

        it 'does not send a notification' do
          expect(NotificationMailer).to_not receive(:notify).with(
            user_id: user.id,
            notification_ids: [],
            comment_thread_ids: [],
          )

          digest_service.call
        end
      end
    end

    context 'with unsupported type' do
      let(:type) { :other }

      it 'should raise an error' do
        expect { digest_service.call }.to raise_error(StandardError)
      end
    end

    describe 'when there are no notifications' do
      let(:type) { :notifications }

      it 'returns early and does not send the notification mailer' do
        expect(NotificationMailer).not_to have_received(:notify)
        digest_service.call
      end
    end

    describe 'when there are no mentions' do
      let(:group_user) { create(:user) }
      let(:group) { create(:group, add_admins: [group_user]) }
      let(:type) { :mentions }
      let!(:comment_thread) do
        create(:item_comment_thread, organization: organization, add_followers: [user, other_user, group_user])
      end
      let!(:comment_with_mentions) do
        create(:comment,
               add_mentions: [user, other_user],
               add_group_mentions: [group],
               comment_thread: comment_thread)
      end

      before do
        User.update_all(last_notification_mail_sent: 1.day.ago)
        user.reload # pick up model change from update_all
      end

      it 'returns early and does not send the notification mailer' do
        expect(NotificationMailer).not_to have_received(:notify)
        digest_service.call
      end
    end
  end
end
