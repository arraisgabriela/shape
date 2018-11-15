class Api::V1::SearchController < Api::V1::BaseController
  def search
    results = search_collections(params[:query])
    render(
      meta: {
        page: page,
        total: results.total_count,
        size: results.size,
      },
      jsonapi: results, include: [:parent_collection_card]
    )
  end

  def users_and_groups
    results = search_users_and_groups(params[:query])
    render(
      meta: {
        page: page,
        total: results.total_count,
        size: results.size,
      },
      jsonapi: results,
    )
  end

  private

  def page
    params[:page].present? ? params[:page].to_i : 1
  end

  def tags_where_clause(query)
    tags = query.scan(/#\w+/).flatten.map { |tag| tag.delete('#') }
    where_clause = {}
    where_clause[:tags] = { all: tags } if tags.count.positive?
    where_clause
  end

  def activity_date_range_where_clause(query)
    date_format_regexp = /(\d{1,2}\/\d{1,2}\/\d{4})/
    not_in_range, first_date, last_date = query.scan(
      /(Not)?Updated\(#{date_format_regexp},\s*#{date_format_regexp}\s*\)/i,
    ).flatten

    where_clause = {}
    return where_clause unless first_date && last_date

    beginning = Date.strptime(first_date, '%d/%m/%Y')
    ending = Date.strptime(last_date, '%d/%m/%Y')

    if beginning && ending
      if not_in_range
        where_clause[:_or] = [{
          activity_dates: {
            lt: beginning,
          },
        }, {
          activity_dates: {
            gt: ending,
          },
        }]
      else
        where_clause[:activity_dates] = {
          gte: beginning,
          lte: ending,
        }
      end
    end
    where_clause
  end

  def in_collection_where_clause(query)
    # add "within" search params
    within_collection_id = query.scan(%r{within\([A-z\/]*(\d+)}i).flatten[0]
    where_clause = {}
    where_clause[:parent_ids] = { all: [within_collection_id.to_i] } if within_collection_id
    where_clause
  end

  def modify_query(query)
    filter_applied = false
    # remove any hashtag elements from the query
    modified_query = query.sub(/#\w+\s/, '')

    if query.match?(%r{within\([A-z\/]*(\d+)}i)
      modified_query = modified_query.sub(/within\(.*\)/i, '')
      filter_applied = true
    end

    if modified_query.match?(/(Not)?Updated\(.*\)/i)
      modified_query = modified_query.sub(/(Not)?Updated\(.*\)/i, '')
      filter_applied = true
    end

    if filter_applied && modified_query.blank?
      modified_query = '*'
    end

    modified_query
  end

  def search_collections(query)
    # search for tags via hashtag e.g. "#template"
    where_clause = {
      organization_id: current_organization.id,
    }
    # super_admin has access to everything regardless of user/group_ids
    unless current_user.has_cached_role?(Role::SUPER_ADMIN)
      where_clause[:_or] = [
        { user_ids: [current_user.id] },
        { group_ids: current_user_current_group_ids },
      ]
    end
    where_clause = where_clause.merge(tags_where_clause(query))
    where_clause = where_clause.merge(in_collection_where_clause(query))
    where_clause = where_clause.merge(activity_date_range_where_clause(query))

    modified_query = modify_query(query)

    Collection.search(
      modified_query,
      fields: %w[name^5 tags^3 content],
      where: where_clause,
      per_page: params[:per_page] || 10,
      page: page,
    )
  end

  def search_users_and_groups(query)
    Searchkick.search(
      query,
      index_name: [User, Group],
      match: :word_start,
      fields: %w[handle^5 name],
      where: {
        organization_ids: [current_organization.id],
      },
      per_page: 6,
    )
  end

  def current_user_current_group_ids
    current_user.organization_group_ids(
      current_user.current_organization,
    )
  end
end
