# CreativeDifference::Groups == BusinessUnit
class Api::V1::CreativeDifference::GroupsController < Api::V1::CreativeDifference::BaseController
  # how to load and authorize shape groups?
  before_action :authorize_shape_group # ?

  def index
    business_units = fetch_business_units
    groups = Group.where(
                organization_id: current_user.current_organization.id
              ).
              where_application_id(1).
              where(
                ExternalRecord.arel_table[:external_id].matches('BusinessUnit%')
              ).
              includes(:roles)

    groups.each do |group|
      business_unit_id = group.external_records.first.external_id_to_integer
      group.business_unit = business_units.find do |bu|
        bu["id"] == business_unit_id
      end
    end
    groups_with_bus = groups.select { |group| group.business_unit.present? }

    render jsonapi: groups_with_bus, include: [roles: %i[users groups]]
  end

  def create
    business_unit = create_business_unit
    if business_unit["errors"]
      group = Group.new
      group.errors.add(:business_unit, business_unit["errors"])
      render_api_errors group.errors
    else
      p groups = find_related_groups(business_unit)
      p "found #{groups}"
      if groups.empty?
        p "no groups, making groups"
        groups = create_related_groups(business_unit)
      end

      render jsonapi: groups, include: [roles: %i[users groups]]
    end
  end

  def update
    p params
    p business_unit = update_business_unit
    # also handle updating other values? (industry subcategory, structure)
    # make separate interactors
    if business_unit["errors"]
      p "C∆ errors"
      p business_unit
      group = Group.new
      group.errors.add(:business_unit, business_unit["errors"])
      render_api_errors group.errors
    else
      p "success from C∆"
    # find the Shape groups and update their names as well
    # find related groups
      p groups = find_related_groups(business_unit)
    # update related groups names
      groups.each do |group|
        external_id = group.external_records.where(application_id:1).first.external_id
        role_type = external_id.split("_").last
        group.update(name: "#{business_unit["name"]} #{role_type}")
      end
      render jsonapi: groups, include: [roles: %i[users groups]]
    end
  end

  private

  def find_related_groups(business_unit)
    groups = Group.where(
      organization_id: current_user.current_organization.id
    ).
    where_application_id(1).
    where(
      ExternalRecord.arel_table[:external_id].matches(
        "BusinessUnit_#{business_unit["id"]}%"
      )
    )

    groups.each { |group| group.business_unit = business_unit }

    groups
  end

  # TODO: extract methods to a standalone object in /services/creative_difference/client.rb
  def create_related_groups(business_unit)
    %w[admin member].map do |role_name|
      role_type = role_name.pluralize.titleize
      group = Group.create({
        name: "#{business_unit["name"]} #{role_type}",
        organization_id: current_organization.id,
        created_by: current_user,
        application: current_application,
      })
      # Assign business unit so the group can render properly
      group.business_unit = business_unit

      group.add_external_id("BusinessUnit_#{business_unit["id"]}_#{role_type}", ENV["CREATIVE_DIFFERENCE_APPLICATION_ID"])

      current_user.add_role(Role::ADMIN, group)
      group
    end
  end

  def update_business_unit
    token = ENV['CREATIVE_DIFFERENCE_API_TOKEN']
    url = "http://localhost:3000/api/v3/business_units/#{params[:business_unit_id]}"
    external_id = current_user.current_organization.external_records.where(application_id: ENV["CREATIVE_DIFFERENCE_APPLICATION_ID"]).first&.external_id
    creative_difference_org_id = external_id.split("_").last

    # Use dig or except or similar to get correct keys
    # business_unit_params = {
    #   name: params[:name],
    #   industry_subcategory_id: params[:industry_subcategory_id],
    #   content_version_id: params[:content_version_id],
    # }
    p 'sending params[:group]'
    p params[:group]

    p response = HTTParty.put(
      URI.encode(url),
      headers: {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{token}"
      },
      body: {
        business_unit: params[:group], # { name: "foo" }
      }.to_json,
      query: {
        'organization_id': creative_difference_org_id
      },
      # format: :plain, # https://github.com/jnunemaker/httparty/tree/master/docs#parsing-json
      timeout: 10,
      retries: 1
    )
    JSON.parse(response.body, symbolize_keys: true)
  end

  def create_business_unit
    token = ENV['CREATIVE_DIFFERENCE_API_TOKEN']
    url = 'http://localhost:3000/api/v3/business_units'
    external_id = current_user.current_organization.external_records.where(application_id: ENV["CREATIVE_DIFFERENCE_APPLICATION_ID"]).first&.external_id
    creative_difference_org_id = external_id.split("_").last

    p response = HTTParty.post(
        URI.encode(url),
        headers: {
          "Content-Type" => "application/json",
          "Authorization" => "Bearer #{token}"
        },
        body: {
          business_unit: json_api_params[:business_unit],
        }.to_json,
        query: {
          'organization_id': creative_difference_org_id
        },
        # format: :plain, # https://github.com/jnunemaker/httparty/tree/master/docs#parsing-json
        timeout: 10,
        retries: 1
      )
      JSON.parse(response.body, symbolize_keys: true)
  end

  def fetch_business_units
    token = ENV['CREATIVE_DIFFERENCE_API_TOKEN']
    url = 'http://localhost:3000/api/v3/business_units'
    external_id = current_user.current_organization.external_records.where(application_id: ENV["CREATIVE_DIFFERENCE_APPLICATION_ID"]).first&.external_id

    if external_id
      creative_difference_org_id = external_id.split("_").last
      # => "Organization_4" => "4"
      # HTTParty.get('http://localhost:3000/api/v3/business_units')
      p request = HTTParty.get(
        URI.encode(url),
        headers: {
          "Content-Type" => "application/json",
          "Authorization" => "Bearer #{token}"
        },
        query: {
          'organization_id': creative_difference_org_id
        },
        # format: :plain, # https://github.com/jnunemaker/httparty/tree/master/docs#parsing-json
        timeout: 10,
        retries: 1
      )
      JSON.parse(request.body, symbolize_keys: true)
    else
      []
    end
  end

  # Move to Api::V1::CreativeDifference::BaseController
  def authorize_shape_group
    # load and authorize groups?
    true
  end
end