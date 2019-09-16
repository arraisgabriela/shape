class RemoveGroupFromGroup
  include Interactor::Organizer
  include Interactor::Schema

  schema :subgroup, :parent_group

  organize(
    RevokeMembershipToGroup,
    RemoveChildrenOfSubgroup,
    RemoveGrandparentToChildGroupRelations,
  )
end