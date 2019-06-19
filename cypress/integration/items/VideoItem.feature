Feature: Video Item

  Scenario: Creating a video item from the BCT
    Given I login and visit the Test Area
    When I create a video card
    And I add a link URL "https://vimeo.com/340255030" and wait for "@vimeoApi"
    And I wait for "@apiCreateCollectionCard" to finish
    Then I should see a "GridCard"
    Then I should see a ".StyledVideoCover"