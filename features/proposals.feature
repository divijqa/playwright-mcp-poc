Feature: Dynamic Proposal Management

  Scenario: Bypassing unstable dashboards to confirm a specific proposal
    Given the user navigates to the login gateway
    When the user authenticates and handles the dynamic landing state
    Then the target proposal should be successfully verified
