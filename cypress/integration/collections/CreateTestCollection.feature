Feature: Creating a Test Collection

    Scenario: Adding the test collection via the BCT
    Given I login and visit the Test Area
    When I create a test collection named "Test Prototype"
    Then I should see a collection card named "Test Prototype"
    When I navigate to the collection named "Test Prototype" via the "CollectionCover"
    Then I should see "Test Prototype" in a "EditableNameHeading"
    # verify the existence of the default questions
    Then I should see "Photo/Video" in a "QuestionSelectOption"
    Then I should see "Description" in a "QuestionSelectOption"
    Then I should see "Useful" in a "QuestionSelectOption"
    Then I should see "End of Survey" in a ".DisplayText"

    # Scenario: Setting up the questions and launching the test
    When I add a link URL
    And I add a test description for "DescriptionQuestionText"
    And I add an open response question
    When I click the "HeaderFormButton" containing "Get Feedback"
    And I wait for "@apiLaunchTest" to finish
    And I wait for 1 second

    Then I should see "Usefulness" in a "ChartItemCover"
    # assuming the collection cover is not truncated...
    Then I should see a collection card named "Test Prototype Feedback Design"
    Then I should see "Get Link" in a "HeaderFormButton"
    Then I should see "Stop Feedback" in a "HeaderFormButton"

    # NOTE: seemingly no way to test clipboard copying in cypress (i.e. "Get Link")
    Scenario: Filling out a test
    When I logout
    And I capture the current URL
    And I visit the current Test URL
    Then I should see a "StandaloneTestSurvey"
    Then I should see "Why Coding Needs" in a "GridCard"
    Then I should see a question with "ScaleEmojiHolder" and 4 emojis
    When I click the last "ScaleEmojiBtn"
    Then I should see "ScaleEmojiBtn" deselected
    Then I should see a "OpenQuestionTextInput"
    When I add a test description for "OpenQuestionTextInput"
    And I click the "OpenQuestionTextButton"
    Then I should see a question with "RecontactEmojiHolder" and 2 emojis
    When I click "RecontactEmojiBtnThumbUp"
    Then I should see a "RecontactTextInput"
    When I add a test email for "RecontactTextInput"
    And I click the "RecontactTextResponseButton"
    Then I should see a "FinishedEmojiHolder"
