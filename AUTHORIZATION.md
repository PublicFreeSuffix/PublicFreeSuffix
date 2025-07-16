# Automated Registrant Authorization via Email(ARAE)

To streamline your operations, we've set up an automated merge and deployment process for PR submissions starting from PR \#80. Please follow the instructions below to authorize the merging of your pull request.

### Prerequisites

For this authorization process to be valid, your submitted pull request (PR) must meet the following title, description, and status requirements. All conditions below must be satisfied:

  * The PR title uses the legal format: `Registration\Update\Remove: your-domain-name.no.kg`
  * The PR description uses the automatic template, with the options and domain name fields correctly modified.
  * Your PR has completed automatic validation and received the `validation-passed` label.
  * Your PR only contains changes to a single `whois\*.json` file.
  * Your PR has no conflicts.

### Sending the Authorization Email

Choose how to send the authorization email based on the type of change you've made:

1.  **For new domain registrations:** Only the email address corresponding to the `registrant` field in the Whois file needs to send this authorization email.
2.  **For modifying domain nameserver information:** Only the email address corresponding to the `registrant` field in the Whois file needs to send this authorization email.
3.  **For changing an existing domain's registrant email** from `aaa@example.com` to `bbb@gmail.com`: Both email addresses must send the authorization email within 12 hours.

### To Whom Should You Send It?

All authorization emails **must be sent to the unified authorization email address**: `pr-authorization@publicfreesuffix.org`. Please note that by sending an email to this address, you are agreeing to all our terms and conditions and consenting to the merging of your PR and its associated operations.

### Email Format

**It is crucial to send the authorization email only after your PR has been submitted, has received the `validation-passed` label, and has no conflicts; otherwise, it will be invalid.** You only need to send an email with the following subject line (replace `XXX` with your PR ID):

```
APPROVE_PFS_PR_XXX
```

**`XXX` should be replaced with your numerical PR ID.** **The email body does not require any content.** If you're concerned about the email going into spam, you can write a random sentence, as we only use the email subject to retrieve the PR information.

Typically, after the email is successfully sent, the merge and DNS update will be completed within 5 minutes.